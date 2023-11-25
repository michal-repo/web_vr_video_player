export default class VideoEntry {
    name;
    src;
    thumbnail;
    screen_type;
    frame_height;
    frame_width;
    date;
    epoch;

    constructor(
        name,
        src,
        thumbnail,
        screen_type,
        frame_height,
        frame_width,
        date,
        epoch
    ) {
        this.name = name;
        this.src = src;
        this.thumbnail = thumbnail;
        this.screen_type = screen_type;
        this.frame_height = frame_height;
        this.frame_width = frame_width;
        this.date = date;
        this.epoch = epoch;
    }
}
