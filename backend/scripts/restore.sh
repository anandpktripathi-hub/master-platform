#!/bin/bash

BACKUP_FILE=$1
DB_NAME="smetasc-saas"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

mongorestore --archive=$BACKUP_FILE --gzip --db=$DB_NAME

echo "Restore completed from: $BACKUP_FILE"
