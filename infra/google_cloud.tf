terraform {
  backend "gcs" {
    bucket = "abekoh-simple-rss-terraform-backend"
  }
}

provider "google" {
  project = "abekoh-simple-rss"
  region  = "us-west1"
}

resource "google_storage_bucket" "terraform-backend" {
  name     = "abekoh-simple-rss-terraform-backend"
  location = "US-WEST1"
}

resource "google_artifact_registry_repository" "simple-rss-repo" {
  repository_id = "simple-rss"
  location      = "us-west1"
  description   = "repository for simple-rss"
  format        = "DOCKER"
}

resource "google_service_account" "deploy-account" {
  account_id   = "simple-rss-deploy"
  display_name = "Service Account for deploy"
}

resource "google_project_iam_member" "deploy-member" {
  project = "abekoh-simple-rss"
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.deploy-account.email}"
}

resource "google_project_iam_member" "deploy-member-compute-admin" {
  project = "abekoh-simple-rss"
  role    = "roles/compute.instanceAdmin.v1"
  member  = "serviceAccount:${google_service_account.deploy-account.email}"
}

data "google_project" "project" {
}

variable "DB_URL" {
  type = string
}

resource "google_secret_manager_secret" "db-url" {
  secret_id = "db-url"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db-url" {
  secret      = google_secret_manager_secret.db-url.name
  secret_data = var.DB_URL
}

variable "GEMINI_API_KEY" {
  type = string
}

resource "google_secret_manager_secret" "gemini-api-key" {
  secret_id = "gemini-api-key"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "gemini-api-key" {
  secret      = google_secret_manager_secret.gemini-api-key.name
  secret_data = var.GEMINI_API_KEY
}

# SSL証明書用のストレージバケット
resource "google_storage_bucket" "ssl-certificates" {
  name     = "abekoh-simple-rss-ssl-certificates"
  location = "US-WEST1"
}

resource "google_service_account" "backend-account" {
  account_id   = "simple-rss-backend"
  display_name = "Service Account for backend instance"
}

resource "google_project_iam_member" "backend-artifact-registry-reader" {
  project = "abekoh-simple-rss"
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.backend-account.email}"
}

resource "google_project_iam_member" "backend-secret-manager-accessor" {
  project = "abekoh-simple-rss"
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend-account.email}"
}

# バックエンドインスタンスにストレージバケットへのアクセス権を付与
resource "google_project_iam_member" "backend-storage-object-viewer" {
  project = "abekoh-simple-rss"
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.backend-account.email}"
}

data "google_compute_image" "ubuntu" {
  family  = "ubuntu-2404-lts-amd64"
  project = "ubuntu-os-cloud"
}

resource "google_compute_address" "backend-ip" {
  name = "simple-rss-backend"
}

resource "google_compute_instance" "backend-instance" {
  name         = "simple-rss-backend"
  machine_type = "e2-micro"
  zone         = "us-west1-c"

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu.self_link
      size  = 10
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.backend-ip.address
    }
  }

  metadata = {
    startup-script = <<-EOT
      #!/bin/bash
      set -e
      
      # 各ソフトウェアがインストール済みかチェックする関数
      function is_installed() {
        if command -v $1 &> /dev/null; then
          return 0  # インストール済み
        else
          return 1  # 未インストール
        fi
      }
      
      # 基本パッケージのインストール
      apt-get update
      
      # 必要なパッケージのみインストール
      for pkg in apt-transport-https ca-certificates gnupg curl; do
        if ! dpkg -l | grep -q "^ii  $pkg "; then
          echo "Installing $pkg..."
          apt-get install -y $pkg
        else
          echo "$pkg is already installed, skipping..."
        fi
      done
      
      # Dockerのインストール
      if ! is_installed docker; then
        echo "Installing Docker..."
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io
      else
        echo "Docker is already installed, skipping..."
      fi
      
      # Nginxのインストール
      if ! is_installed nginx; then
        echo "Installing Nginx..."
        apt-get install -y nginx
      else
        echo "Nginx is already installed, skipping..."
      fi
      
      # 証明書用のディレクトリを作成
      mkdir -p /etc/nginx/ssl
      
      # Google Cloud Storageから証明書をダウンロード
      gsutil cp gs://abekoh-simple-rss-ssl-certificates/reader-api.abekoh.dev.crt /etc/nginx/ssl/
      gsutil cp gs://abekoh-simple-rss-ssl-certificates/reader-api.abekoh.dev.key /etc/nginx/ssl/
      
      # 環境変数の取得
      DB_URL=$(gcloud secrets versions access latest --secret=db-url)
      GEMINI_API_KEY=$(gcloud secrets versions access latest --secret=gemini-api-key)
      
      # バックエンドコンテナの起動
      gcloud auth configure-docker us-west1-docker.pkg.dev --quiet
      docker run --rm -d \
        --pull always \
        --name simple-rss-backend \
        -p 8080:8080 \
        -e PORT="8080" \
        -e GOOSE_DRIVER="postgres" \
        -e GOOSE_DBSTRING="$DB_URL" \
        -e GOOSE_MIGRATION_DIR="migrations" \
        -e DB_URL="$DB_URL" \
        -e GEMINI_API_KEY="$GEMINI_API_KEY" \
        us-west1-docker.pkg.dev/abekoh-simple-rss/simple-rss/backend:latest
      
      # Nginxの設定
      cat > /etc/nginx/sites-available/simple-rss <<EOF
      server {
          listen 80;
          server_name reader-api.abekoh.dev;
          
          location / {
              return 301 https://\$host\$request_uri;
          }
      }
      
      server {
          listen 443 ssl;
          server_name reader-api.abekoh.dev;
          
          ssl_certificate /etc/nginx/ssl/reader-api.abekoh.dev.crt;
          ssl_certificate_key /etc/nginx/ssl/reader-api.abekoh.dev.key;
          
          ssl_protocols TLSv1.2 TLSv1.3;
          ssl_prefer_server_ciphers on;
          ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
          
          location / {
              proxy_pass http://localhost:8080;
              proxy_set_header Host \$host;
              proxy_set_header X-Real-IP \$remote_addr;
              proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto \$scheme;
          }
      }
      EOF
      
      # シンボリックリンクの作成
      ln -sf /etc/nginx/sites-available/simple-rss /etc/nginx/sites-enabled/
      rm -f /etc/nginx/sites-enabled/default
      
      # Nginxの設定テスト
      nginx -t
      
      # Nginxの再起動
      systemctl restart nginx
    EOT
  }

  service_account {
    email  = google_service_account.backend-account.email
    scopes = ["cloud-platform"]
  }

  allow_stopping_for_update = true

  tags = ["https-server"]
}

resource "google_compute_firewall" "backend-firewall" {
  name    = "allow-http-backend"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

output "backend_instance_ip" {
  description = "The public IP address of the backend instance"
  value       = google_compute_address.backend-ip.address
}
