###############################################################################
# domain_mapping.tf — Cloud Run domain mapping を IaC 管理
#
# 既存 resource (audit #023 復旧で手動作成済) を import で state に取り込む。
# 以後の変更は terraform.yml CD 経由のみで行う。
#
# 注: domain mapping の certificate は Cloud Run が自動 provision (manual 不要)。
###############################################################################

resource "google_cloud_run_domain_mapping" "www" {
  provider = google-beta
  name     = var.public_hostname
  location = var.region

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = var.service_name
  }

  lifecycle {
    # certificate 自動 provision 中に status が頻繁に書き換わるため、
    # status 以下の transient な field の drift を ignore する
    ignore_changes = [
      status,
      metadata[0].annotations,
      metadata[0].labels,
      metadata[0].generation,
      metadata[0].resource_version,
      metadata[0].self_link,
      metadata[0].uid,
    ]
  }
}

import {
  to = google_cloud_run_domain_mapping.www
  id = "${var.project_id}/${var.region}/${var.public_hostname}"
}
