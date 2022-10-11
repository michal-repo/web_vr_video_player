# Web VR video player for 180° videos.

## Licenses

### Source code Licensed under MIT License

### Icons are licensed under "Free for commercial use with attribution license"

### Fonts are licensed under the Apache License, Version 2.0.

## Requirements

- Linux server with installed and configured web server including https (WebXR requires https)
- Python 3 installed
- FFMPEG installed (required if thumbnails generator will be used)

## Setup

- Edit config.ini providing correct paths
- Make `init.sh` file executable `chmod u+x init.sh` and run it
- If you don't have Thumbnails generated for your videos and want to use them run `generate_thumbnails.sh` script
- Finally run `generate_files_json.sh` script to generate files.json containing list of VR files for player


## Troubleshooting

If videos or player can't be loaded make sure that this app files are owned by web server user (eg. www-data) and that web server user can read video and thumbnail files (eg. www-data is owner or permissions for others include read).