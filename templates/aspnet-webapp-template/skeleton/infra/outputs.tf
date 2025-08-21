output "database_connection_name" {
  description = "The connection name of the database instance"
  value       = google_sql_database_instance.main.connection_name
}

output "database_name" {
  description = "The name of the database"
  value       = google_sql_database.database.name
}

output "database_user" {
  description = "The database user"
  value       = google_sql_user.user.name
}

output "database_password" {
  description = "The database password"
  value       = random_password.db_password.result
  sensitive   = true
}

output "database_public_ip" {
  description = "The public IP address of the database instance"
  value       = google_sql_database_instance.main.public_ip_address
}
