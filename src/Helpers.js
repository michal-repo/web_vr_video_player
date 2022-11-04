let video_src = document.getElementById('video_src');

export function videoSrcExists() {
	if (typeof video_src !== 'undefined' && video_src.src != window.location.href) {
		return true;
	}
	return false;
}

export function setVideoSrc(src) {
	video_src.setAttribute('src', src);
	video_src.setAttribute('type', 'video/mp4');
    let video = document.getElementById('video');
    video.load();
	video.play().catch((e)=>{
		console.warn(e);
	 });
}

export function removeVideoSrc() {
	if (typeof video_src !== 'undefined' && video_src.src != window.location.href) {
		video.pause();
		video_src.setAttribute('src', "");
	}
}