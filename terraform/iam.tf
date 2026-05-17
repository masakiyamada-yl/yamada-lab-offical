###############################################################################
# iam.tf — Cloud Run service の IAM binding を IaC 管理
#
# allUsers を run.invoker に bind し、Cloud Run service を public に。
# 既存 binding (audit #023 復旧で手動付与) を import で state に取り込む。
#
# 注: Org policy iam.allowedPolicyMemberDomains の override (project-level
#     allowAll) は経営者作業として Cloud Console UI で実施済 (audit #023 step 1)。
#     terraform から org policy を扱うには別途 google_org_policy_policy が
#     必要だが、本リポでは IAM binding のみカバーする。
###############################################################################

resource "google_cloud_run_service_iam_member" "allusers_invoker" {
  project  = var.project_id
  location = var.region
  service  = var.service_name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

import {
  to = google_cloud_run_service_iam_member.allusers_invoker
  id = "${var.project_id}/${var.region}/${var.service_name} roles/run.invoker allUsers"
}
