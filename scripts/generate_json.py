#!/usr/bin/python3

import os
import json
import configparser
import sys
import urllib.parse
from datetime import datetime
import sqlite3
import subprocess
import pipes

connection = sqlite3.connect("videos.db")
cursor = connection.cursor()

cursor.execute("CREATE TABLE IF NOT EXISTS videos(id INTEGER PRIMARY KEY AUTOINCREMENT, fullfile, title, extension, codec_name, frame_height, frame_width, framerate)")

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
        date = ""
        if ".mp4" in file[-4:]:
            title = file[:-4]
            extension = file[-4:]

            fullfile = (os.path.join(root, file))
            date = os.path.getmtime(fullfile)

            if "_SCREEN" in title[-7:]:
                # DB
                codec_name = ""
                frame_height = ""
                frame_width = ""
                framerate = ""
                existing_entry_query = cursor.execute(
                    "SELECT frame_height, frame_width FROM videos WHERE fullfile = :fullfile", {
                        "fullfile": fullfile,
                    })
                existing_entry = existing_entry_query.fetchone()
                if existing_entry is None:
                    cmd = [
                        "ffprobe -v quiet -print_format json -show_format -show_streams " + pipes.quote(fullfile)]
                    result = subprocess.run(
                        cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
                    metadataJson = result.stdout
                    d = json.loads(metadataJson)
                    streams = d.get("streams", [])
                    for stream in streams:
                        if "codec_type" in stream:
                            if stream["codec_type"] == "video":
                                codec_name = stream["codec_name"]
                                framerate = round(
                                    eval(stream["avg_frame_rate"]))
                                frame_height = stream["height"]
                                frame_width = stream["width"]
                                cursor.execute("insert into videos(fullfile, title, extension, codec_name, frame_height, frame_width, framerate) values (?, ?, ?, ?, ?, ?, ?)", (
                                    fullfile, title, extension, codec_name, frame_height, frame_width, framerate))
                                connection.commit()
                else:
                    frame_height = existing_entry[0]
                    frame_width = existing_entry[1]
                ##

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
            elif "_TB_SCREEN" in title[-10:]:
                screen_type = "tb_screen"
            elif "_SCREEN" in title[-7:]:
                screen_type = "screen"
            elif "_2D_180" in title[-7:]:
                screen_type = "sphere180"
            elif "_2D_360" in title[-7:]:
                screen_type = "sphere360"
            elif "_360" in title[-4:]:
                screen_type = "360"
            else:
                screen_type = "sbs"

            if screen_type == "screen" or screen_type == "tb_screen":
                out_files[subDir]["list"].append(
                    {"name": title,
                     "src": urllib.parse.quote(fullfile),
                     "thumbnail": urllib.parse.quote(img),
                     "screen_type": screen_type,
                     "frame_height": frame_height,
                     "frame_width": frame_width,
                     "date": datetime.fromtimestamp(date).strftime('%Y-%m-%d %H:%M:%S'),
                     "epoch": date
                     })
            else:
                out_files[subDir]["list"].append(
                    {"name": title,
                     "src": urllib.parse.quote(fullfile),
                     "thumbnail": urllib.parse.quote(img),
                     "screen_type": screen_type,
                     "date": datetime.fromtimestamp(date).strftime('%Y-%m-%d %H:%M:%S'),
                     "epoch": date
                     })

cursor.close()
out_json = []
for entry in out_files:
    if len(out_files[entry]["list"]) > 0:
        out_json.append(out_files[entry])

print(json.dumps({'videos': out_json}))
