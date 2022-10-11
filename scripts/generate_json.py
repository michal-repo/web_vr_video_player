#!/usr/bin/python3

import os
import json
import configparser

config = configparser.ConfigParser()
config.read('config.ini')

out_files = []

for (root, dirs, files) in os.walk(config['videos']['videos_relative_path']+"/"+config['videos']['videos_folder']):
    for file in files:
        if ".mp4" in file[-4:]:
            fullfile = (os.path.join(root, file))
            entry = fullfile.replace(
                config['videos']['videos_relative_path'], "")
            expected_img = config['videos']['videos_relative_path'] + \
                "/"+config['videos']['thumbnails_folder']+entry+".jpg"
            img = expected_img if os.path.isfile(expected_img) else ""
            out_files.append(
                {"name": file, "src": fullfile, "thumbnail": img})

print(json.dumps({'videos': out_files}))