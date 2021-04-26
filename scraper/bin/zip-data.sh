#/bin/bash
now=$(env TZ=Asia/Calcutta date +"%Y-%m-%d_%H-%M")
zip -r --exclude=*.DS_Store* ./data-zip/data_$now.zip ./data-raw