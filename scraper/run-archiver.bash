#!/usr/bin/env bash
# Run the archiver at about 10 minute intervals
# Intentionally not setting -e, since we just want it to continue even if the process fails

cd VaccinationSlotsArchive/archive
while true; do
    node ../../src/archiver.js
    # Update our checkout before we commit - avoids push rejections
    git pull origin main
    git add .
    git -c 'user.email=Archiver@archiver.archive' -c 'user.name=archiver' commit -m 'Adding data' 
    git push origin main
    echo 'sleeping...'
    sleep 10m
done