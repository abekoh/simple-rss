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

resource "google_cloud_run_v2_service" "simple-rss-backend" {
  name     = "simple-rss-backend"
  location = "us-west1"
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-west1-docker.pkg.dev/abekoh-simple-rss/simple-rss/backend:latest"
      env {
        name  = "GOOSE_DRIVER"
        value = "goose"
      }
      env {
        name  = "GOOSE_MIGRATION_DIR"
        value = "migrations"
      }
      env {
        name = "DB_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db-url.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "GOOSE_DBSTRING"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db-url.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini-api-key.secret_id
            version = "latest"
          }
        }
      }
    }
  }
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

resource "google_secret_manager_secret_iam_member" "db-url-access" {
  secret_id  = google_secret_manager_secret.db-url.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
  depends_on = [google_secret_manager_secret.db-url]
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

resource "google_secret_manager_secret_iam_member" "gemini-api-key-access" {
  secret_id  = google_secret_manager_secret.gemini-api-key.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
  depends_on = [google_secret_manager_secret.gemini-api-key]
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

