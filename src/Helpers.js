let video_src = document.getElementById("video_src");

const LANG = require("./lang.json");

let selected_lang = "en";

export function videoSrcExists() {
    if (
        typeof video_src !== "undefined" &&
        video_src.src != window.location.href
    ) {
        return true;
    }
    return false;
}

export function setVideoSrc(src) {
    video_src.setAttribute("src", src);
    video_src.setAttribute("type", "video/mp4");
    let video = document.getElementById("video");
    video.load();
    video.play().catch((e) => {
        console.warn(e);
    });
}

export function removeVideoSrc() {
    if (
        typeof video_src !== "undefined" &&
        video_src.src != window.location.href
    ) {
        video.pause();
        video_src.setAttribute("src", "");
    }
}

export function testIfFileExist(url) {
    try {
        let xhr = new XMLHttpRequest();
        xhr.open("HEAD", url, false);
        xhr.send();
        if (xhr.status !== 200) {
            return false;
        } else {
            return true;
        }
    } catch (e) {
        console.warn(e);
        return false;
    }
}

export function getWordFromLang(key) {
    return LANG[selected_lang][key];
}
