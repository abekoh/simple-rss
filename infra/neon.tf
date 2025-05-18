terraform {
  required_providers {
    neon = {
      source = "kislerdm/neon"
    }
  }
}

provider "neon" {}

resource "neon_project" "simple-rss" {
  name           = "simple-rss"
  pg_version     = 17
  region_id      = "aws-us-west-2"
  store_password = "yes"
}
