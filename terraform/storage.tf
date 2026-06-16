resource "google_storage_bucket" "photos" {
  depends_on = [google_project_service.storage]

  name          = "${var.project_id}-photos"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
}
