# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Random ID for unique instance naming
resource "random_id" "db_suffix" {
  byte_length = 4
}

# Cloud SQL Database Instance
resource "google_sql_database_instance" "main" {
  name             = "${lower(replace(var.database_name, "_", "-"))}-${random_id.db_suffix.hex}"
  database_version = var.database_type == "mysql" ? "MYSQL_8_0" : "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    disk_type         = "PD_HDD"
    disk_size         = 10

    backup_configuration {
      enabled = false
    }

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "allow-all-demo"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}

# Database
resource "google_sql_database" "database" {
  name     = replace(var.database_name, "-", "_")
  instance = google_sql_database_instance.main.name
}

# Database User
resource "google_sql_user" "user" {
  name     = "${replace(var.database_name, "-", "_")}_user"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}
