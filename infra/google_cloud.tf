terraform {
  backend "gcs" {
    bucket  = "abekoh-simple-rss-terraform-backend"
  }
}

provider "google" {
  project     = "abekoh-simple-rss"
  region      = "us-west1"
}

resource "google_storage_bucket" "terraform-backend" {
  name          = "abekoh-simple-rss-terraform-backend"
  location      = "US-WEST1"
}
