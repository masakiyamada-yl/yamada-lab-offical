###############################################################################
# main.tf — yamada-lab-offical Terraform 設定
#
# audit #023 再発防止 改善 3 (Cloud Run domain mapping IaC 化)。
# Cloud Run service / image / deploy は ci.yml が管理 (deploy-cloudrun action)。
# 本 Terraform は **手動セットアップが必要だった configuration** のみ IaC 化:
#   - Cloud Run domain mapping (www.yamada-lab.co.jp)
#   - Cloud Run service IAM binding (allUsers run.invoker)
#
# state backend: gs://yamada-lab-offical-tfstate/ (uniform access, versioning ON)
# CD actor: offical-deployer@yamada-lab-offical.iam.gserviceaccount.com (WIF 経由)
###############################################################################

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "yamada-lab-offical-tfstate"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}
