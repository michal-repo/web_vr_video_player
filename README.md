# Web VR video player for 180° videos.

## Licenses

### Source code Licensed under MIT License

### Icons are licensed under "Free for commercial use with attribution license"

### Fonts are licensed under the Apache License, Version 2.0.

## Functionality
### Search in current folder
Search will filter current folder with provided phrase.
You can switch folders, search phrase will work until it's cleared.

![Search-box](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_4.png?raw=true)

![Search-box-keyboard](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_4_1.png?raw=true)
### Sorting
Sort by Name or Date, change order ascending/descending.

![Sorting](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_5.png?raw=true)
### Drag in Folders view
You can reposition Folders view by holding trigger and dragging view using bottom bar.

![drag](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_6.png?raw=true)
### Drag in Player view
You can reposition Player and Video Spheres by holding trigger and dragging view using bottom bar.

![drag](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_7.png?raw=true)

Second options is to reposition only Player controls

![drag](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_8.png?raw=true)

*Player controls and spheres will reset to default position on exit from current video playback*
### Gamepad controls
#### Playback control
Thumbstick: 
- up/down for zoom
- left/right for rewind and fast forward (10 seconds jumps)

*If there are two connected controllers pressing trigger switches active controller.*

#### Folders view
Thumbstick: 
- left/right for switching pages

## Requirements

- Linux server with installed and configured web server including https (WebXR requires https)
- Python 3 installed
- FFMPEG installed (required if thumbnails generator will be used)

## Setup

### Using JSON solution and provided Python scripts

- Edit `config.ini` providing correct paths

    `videos_location` => absolute path to folder containing videos folder and thumbnails folder (eg. for  `/media/videos` set this to `videos_location=/media/videos`)
  
    `videos_folder` => main folder where videos are located (eg. for /media/videos/vr set this to `videos_folder=vr`)
  
    `thumbnails_folder` => main folder where Thumbnails are located (eg. for /media/videos/thumbnails set this to `thumbnails_folder=thumbnails`)
  
    `videos_relative_path` => this is relative path from player folder to videos folder, must be inside www folder (eg. player is in `/var/www/html/web_vr_player` your videos are available via symlink from `/var/www/html/videos` then set this to `videos_relative_path=../videos`)
  
    To create symlink => 
        
        cd /var/www/html/
        ln /media/videos videos

- Make `init.sh` file executable `chmod u+x init.sh` and run it. This script downloads ini parser for bash
- If you don't have Thumbnails generated for your videos and want to use them run `generate_thumbnails.sh` script
- Finally run `generate_files_json.sh` script to generate `files.json` containing list of VR files for player

Script can set screen type based on file name. Add one of following at the end of file name: `_TB` (Top-Bottom), `_SCREEN`. Default screen type is Side-by-Side.

Supported tags:

`_SCREEN` - normal 2D screen

`_SBS` - Side by Side

`_TB` - Top Bottom 180

`_360` - Top Bottom 360

`_2D_180` - fisheye 180, not VR (one lens)

`_2D_360` - fisheye 360, not VR (one lens)

### Extensions

[Extensions](https://github.com/michal-repo/web_vr_video_player_extensions)

## Generating your own JSON file with video sources
Player is using locally stored JSON file with video sources. It's configured in `index.html`, where you can provide your JSON file name:
```
<span id="json_file" hidden>files.json</span>
```
### Structure for JSON file

```
{
    "videos": [
        {
            "name": "FOLDER_NAME",
            "list": [
                {
                    "name": "FILE NAME DISPLAYED IN UI",
                    "src": "SOURCE URL TO VIDEO FILE",
                    "thumbnail": "SOURCE URL TO THUMBNAIL FILE",
                    "screen_type": "TYPE OF SCREEN",
                    "date": "DATE TIME (Python format: %Y-%m-%d %H:%M:%S)",
                    "epoch": "(Python format: %s)"
                }
            ]
        }
    ]
}
```
#### Screen type
`"screen_type"` can be set to one of values:

`sbs` - Side by Side

`tb` - Top Bottom 180

`360` - Top Bottom 360

`sphere180` - fisheye 180, not VR (one lens)

`sphere360` - fisheye 360, not VR (one lens)

`screen` - normal 2D screen

#### JSON Example

```
{
    "videos": [
        {
            "name": "Music",
            "list": [
                {
                    "name": "K-POP COVER DANCE",
                    "src": "../videos/Music/K-POP%20COVER%20DANCE.mp4",
                    "thumbnail": "../videos/Thumbnails/Music/K-POP%20COVER%20DANCE.jpg",
                    "screen_type": "sbs",
                    "date": "2023-01-10 15:05:50",
                    "epoch": "1673359550.854825"
                },
                {
                    "name": "Live Music at the Miami Beach",
                    "src": "https://10.10.10.12/videos/Music/Live%20Music%20at%20the%20Miami%20Beach.mp4",
                    "thumbnail": "https://10.10.10.12/videos/Thumbnails/Music/Live%20Music%20at%20the%20Miami%20Beach.jpg",
                    "screen_type": "tb",
                    "date": "2022-12-27 21:13:20",
                    "epoch": "1672172000.0444932"
                },
                ....
                ]
        },
        {
            "name": "Nature",
            "list": [
                {
                    "name": "Sunset Baltic in Germany",
                    "src": "../videos/Nature/Sunset%20Baltic%20in%20Germany.mp4",
                    "thumbnail": "../videos/Thumbnails/Nature/Sunset%20Baltic%20in%20Germany.jpg",
                    "screen_type": "sbs",
                    "date": "2023-01-10 15:05:50",
                    "epoch": "1673359550.854825"
                },
                ....
                ]
        },
        {
            "name": "Movies",
            "list": [
                {
                    "name": "The Good the Bad and the Ugly",
                    "src": "../videos/Movies/The%20Good%20the%20Bad%20and%20the%20Ugly.mp4",
                    "thumbnail": "../videos/Thumbnails/Movies/The%20Good%20the%20Bad%20and%20the%20Ugly.jpg",
                    "screen_type": "screen",
                    "frame_height": "720",
                    "frame_width": "1280",
                    "date": "2023-01-10 15:05:50",
                    "epoch": "1673359550.854825"
                },
                ....
                ]
        },
        ....
    ]
}
```

## Troubleshooting

If videos or player can't be loaded make sure that this app files are owned by web server user (eg. www-data) and that web server user can read video and thumbnail files (eg. www-data is owner or permissions for others include read).

## Screenshots

![Print-screen-1](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_1.png?raw=true)

![Print-screen-2](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_2.png?raw=true)

![Print-screen-3](https://github.com/michal-repo/web_vr_video_player/blob/main/examples/Screenshot_VR_player_3.png?raw=true)

## Building
Save changes and run:
### Development mode
`npm run build-dev`
### Production mode
`npm run build`
