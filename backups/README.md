Nightly gzip'd pg_dump backups, produced by .github/workflows/db-backup.yml.
Files older than 30 days are pruned automatically. Restore with:
  gunzip -c backups/YYYY-MM-DD.sql.gz | psql "$SUPABASE_DB_URL"
