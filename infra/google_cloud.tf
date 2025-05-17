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

