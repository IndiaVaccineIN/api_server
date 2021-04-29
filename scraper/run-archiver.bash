#!/usr/bin/env bash
# Run the archiver at about 10 minute intervals
# The archiver itself takes about 5min, so we just wait 5min between runs
# Intentionally not setting -e, since we just want it to continue even if the process fails

mkdir -p archive
cd archive
while true; do
    node ../archiver.js
    echo 'sleeping...'
    sleep 5m
done