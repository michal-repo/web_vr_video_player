#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR/scripts"

if [ ! -f "read_ini.sh" ]; then
    wget https://raw.githubusercontent.com/michal-repo/bash_ini_parser/8fb95e3b335823bc85604fd06c32b0d25f2854c5/read_ini.sh
fi

cd $SCRIPT_DIR
chmod u+x generate_files_json.sh generate_thumbnails.sh