#!/bin/bash

# get script folder
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

# include read_ini function
. read_ini.sh

# read config.ini
read_ini ../config.ini

cd ${INI__videos__videos_location}

# generate Thumbnails
generate(){
	filepattern=(${INI__videos__thumbnails_folder}/"$file".jpg)
	if [ ! -f "$filepattern" ]; then
		sleep 2
		ffmpeg -loglevel panic -nostdin -ss 20 -i "$file" -filter:v "crop=in_w/2:in_h:0:0, scale=512:-1" -vframes 1 -q:v 2 "$filepattern" -y
	fi
}

# create folder tree for Thumbnails
find ${INI__videos__videos_folder} -type d -not -path "./${INI__videos__thumbnails_folder}" | while IFS= read -r directory
do
	mkdir "./${INI__videos__thumbnails_folder}/$directory" -p
done

# find mp4 files and generate Thumbnails
find ${INI__videos__videos_folder} -name "*.mp4" | while IFS= read -r file
do
	generate
done

echo "All done!"
