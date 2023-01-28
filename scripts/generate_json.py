#!/usr/bin/python3

import os
import json
import configparser
import sys
import urllib.parse


if not len(sys.argv) > 1:
    print("Usage: pass config ini file as first parameter, you can force metadata rescan by setting second parameter to true (false by default)\neg.\npython3 generateJson.py config.ini\npython3 generateJson.py config.ini true")
    quit()

configFile = sys.argv[1]


if not os.path.isfile(configFile):
    print("Passed ini file do not exist")
    quit()

config = configparser.ConfigParser()
config.read(configFile)

out_files = {"main dir": {"name": "main dir", "list": []}}

for (root, dirs, files) in os.walk(config['videos']['videos_relative_path']+"/"+config['videos']['videos_folder']):
    for dir in dirs:
        directory = (os.path.join(root, dir))
        dumpDir = directory.replace(
            config['videos']['videos_relative_path'] + "/" + config['videos']['videos_folder'] + "/", "")
        out_files[dumpDir] = {"name": dumpDir, "list": []}
    for file in sorted(files, key=str.casefold):
        title = ""
        extension = ""
        if ".mp4" in file[-4:]:
            title = file[:-4]
            extension = file[-4:]

            fullfile = (os.path.join(root, file))

            entry = fullfile.replace(
                config['videos']['videos_relative_path'], "")
            expected_img = config['videos']['videos_relative_path'] + \
                "/"+config['videos']['thumbnails_folder']+entry+".jpg"
            img = expected_img if os.path.isfile(expected_img) else ""

            subDir = fullfile.replace(
                config['videos']['videos_relative_path'] + "/" + config['videos']['videos_folder'] + "/", "")
            subDir = subDir.replace("/" + file, "")

            if not subDir in out_files:
                subDir = "main dir"

            if "_TB" in title[-3:]:
                screen_type = "tb"
            elif "_SCREEN" in title[-7:]:
                screen_type = "screen"
            else:
                screen_type = "sbs"

            out_files[subDir]["list"].append(
                {"name": title,
                 "src": urllib.parse.quote(fullfile),
                 "thumbnail": urllib.parse.quote(img),
                 "screen_type": screen_type
                 })

out_json = []
for entry in out_files:
    if len(out_files[entry]["list"]) > 0:
        out_json.append(out_files[entry])

print(json.dumps({'videos': out_json}))
