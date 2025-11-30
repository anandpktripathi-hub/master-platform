#!/bin/bash

BACKUP_DIR="/backups"
DB_NAME="smetasc-saas"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.gz"

mkdir -p $BACKUP_DIR

mongodump --db $DB_NAME --archive=$BACKUP_FILE --gzip

find $BACKUP_DIR -name "backup_*.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
