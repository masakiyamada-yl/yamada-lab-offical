variable "project_id" {
  description = "GCP project id for yamada-lab-offical (公開コーポレートサイト)"
  type        = string
  default     = "yamada-lab-offical"
}

variable "region" {
  description = "Cloud Run service region"
  type        = string
  default     = "asia-northeast1"
}

variable "service_name" {
  description = "Cloud Run service name (ci.yml deploy-cloudrun と一致)"
  type        = string
  default     = "yamada-lab-offical-www"
}

variable "public_hostname" {
  description = "公開ホスト名 (Cloud Run domain mapping の対象)"
  type        = string
  default     = "www.yamada-lab.co.jp"
}
