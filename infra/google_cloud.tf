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
      
      apt-get update
      apt-get install -y apt-transport-https ca-certificates gnupg curl
      
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
      echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
      apt-get update
      apt-get install -y docker-ce docker-ce-cli containerd.io
      
      DB_URL=$(gcloud secrets versions access latest --secret=db-url)
      GEMINI_API_KEY=$(gcloud secrets versions access latest --secret=gemini-api-key)

      gcloud auth configure-docker us-west1-docker.pkg.dev --quiet
      docker run --rm -d \
        --name simple-rss-backend \
        -p 8080:8080 \
        -e PORT="8080" \
        -e GOOSE_DRIVER="postgres" \
        -e GOOSE_DBSTRING="$DB_URL" \
        -e GOOSE_MIGRATION_DIR="migrations" \
        -e DB_URL="$DB_URL" \
        -e GEMINI_API_KEY="$GEMINI_API_KEY" \
        us-west1-docker.pkg.dev/abekoh-simple-rss/simple-rss/backend:latest
    EOT
  }

  service_account {
    email  = google_service_account.backend-account.email
    scopes = ["cloud-platform"]
  }

  allow_stopping_for_update = true
}

resource "google_compute_firewall" "backend-firewall" {
  name    = "allow-http-backend"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["8080"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server"]
}

output "backend_instance_ip" {
  description = "The public IP address of the backend instance"
  value       = google_compute_instance.backend-instance.network_interface[0].access_config[0].nat_ip
}
