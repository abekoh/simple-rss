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
      image = "us-docker.pkg.dev/cloudrun/container/hello"
    }
  }
}

resource "google_artifact_registry_repository" "simple-rss-backend-repo" {
  repository_id = "simple-rss-backend"
  location      = "us-west1"
  description   = "repository for simple-rss-backend"
  format        = "DOCKER"
}
