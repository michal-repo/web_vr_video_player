import { Color, TextureLoader } from '../node_modules/three/build/three.module.js';
import { Block, Text, InlineBlock } from '../node_modules/three-mesh-ui/build/three-mesh-ui.module.js';

import FontJSON from '../assets/fonts/Roboto-Regular-msdf.json';
import FontImage from '../assets/fonts/Roboto-Regular.png';

import * as MAIN from './index.js';

import * as ScreenManager from './ScreenManager.js';

import * as UI from './UI.js';

import * as Helpers from './Helpers.js';

// Import Icons
import PlayIcon from '../assets/icons/play.png';
import PauseIcon from '../assets/icons/pause.png';
import StopIcon from '../assets/icons/stop.png';
import FFIcon from '../assets/icons/fast-forward.png';
import RewIcon from '../assets/icons/rewind.png';
import MuteIcon from '../assets/icons/mute.png';
import VolumeIcon from '../assets/icons/volume.png';
import SilentIcon from '../assets/icons/silent.png';
import ExitIcon from '../assets/icons/logout.png';
import CloseIcon from '../assets/icons/close.png';
import HideIcon from '../assets/icons/hide.png';
import HelpIcon from '../assets/icons/help.png';
import MinimizeIcon from '../assets/icons/minimize.png';
import PowerIcon from '../assets/icons/power.png';
import TargetIcon from '../assets/icons/target.png';
import VideoIcon from '../assets/icons/video.png';
import WebIcon from '../assets/icons/website.png';
import MenuIcon from '../assets/icons/menu.png';
import SettingsIcon from '../assets/icons/setting.png';
import ZoomOutIcon from '../assets/icons/zoom-out.png';
import ZoomInIcon from '../assets/icons/zoom-in.png';
import UpIcon from '../assets/icons/up-arrow.png';
import DownIcon from '../assets/icons/down-arrow.png';
import VRIcon from '../assets/icons/vr-glasses.png';
import ComputerIcon from '../assets/icons/computer.png';
import WideScreenIcon from '../assets/icons/wide.png';
import ResetIcon from '../assets/icons/reset.png';

export class PlayerPanel {

	playMenuContainer;
	playMenuObjsToTest = [];
	settingsMenuObjsToTest = [];
	progressBar;
	progressBarContainer;
	settingsMenuContainer;
	showPlayMenuPanelDoubleClickPreventFlag = { prevent: false };
	buttonPlay;
	playIconElement;
	pauseIconElement;


	loader = new TextureLoader();

	PLAYERPANELMAXWIDTH = 4;
	PROGRESSPANELMAXWIDTH = this.PLAYERPANELMAXWIDTH - 0.1;
	PROGRESSPANELHEIGHT = 0.05;
	PROGRESSPANELMINWIDTH = 0.01;

	SETTINGSPANELMAXWIDTH = (this.PLAYERPANELMAXWIDTH / 2);

	commonBlockAttributes = {
		justifyContent: 'center',
		contentDirection: 'row',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.02,
		borderRadius: 0.11,
		backgroundOpacity: 0
	};

	playbackContainerAttributes = {
		justifyContent: 'center',
		contentDirection: 'row',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.02,
		borderRadius: 0.11,
		backgroundOpacity: 0,
		height: 0.1,
		width: this.PLAYERPANELMAXWIDTH
	};

	paddingOnRightContainerAttributes = {
		width: this.PLAYERPANELMAXWIDTH / 6,
		height: 0.15,
		justifyContent: 'start',
		contentDirection: 'row',
		offset: 0,
		margin: 0,
		backgroundOpacity: 0
	};

	hideButtonContainerAttributes = {
		width: this.PLAYERPANELMAXWIDTH / 6,
		height: 0.15,
		justifyContent: 'end',
		contentDirection: 'row',
		offset: 0,
		margin: 0,
		backgroundOpacity: 0
	};

	progressBarAttributes = {
		height: this.PROGRESSPANELHEIGHT,
		width: 0.001,
		margin: 0,
		borderRadius: 0,
		backgroundColor: new Color(0x0099ff),
		justifyContent: 'center',
		alignItems: 'center',
		offset: 0.005
	};

	progressBarPointAttributes = {
		height: this.PROGRESSPANELHEIGHT,
		width: this.PROGRESSPANELMINWIDTH * 2,
		margin: 0,
		borderRadius: 0,
		backgroundColor: new Color(0xffffff),
		justifyContent: 'center',
		alignItems: 'center',
		offset: 0.005
	};

	closeSettingsButtonAttributes = {
		width: 0.07,
		height: 0.07,
		justifyContent: 'center',
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.035
	};

	progressBarContainerAttributes = {
		height: this.PROGRESSPANELHEIGHT,
		width: this.PROGRESSPANELMAXWIDTH,
		offset: 0.045,
		borderRadius: 0,
		justifyContent: 'start',
		contentDirection: 'row',
		backgroundOpacity: 1,
		backgroundColor: new Color(0x5b5b5b)
	};

	settingsBlockAttributes = {
		justifyContent: 'center',
		contentDirection: 'column',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.02,
		borderRadius: 0,
		backgroundOpacity: 1,
		width: this.SETTINGSPANELMAXWIDTH
	};

	settingsRowBlockAttributes = {
		justifyContent: 'start',
		contentDirection: 'row',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.005,
		borderRadius: 0.11,
		backgroundOpacity: 0,
		width: this.SETTINGSPANELMAXWIDTH
	};


	iconElementAttributes = {
		width: 0.15,
		height: 0.15,
		justifyContent: 'center',
		backgroundOpacity: 0,
		offset: 0,
		margin: 0.02,
		borderRadius: 0.08
	};

	consoleOut;
	playbackLabelContainer;
	////////////////////////////////////////////////////////////////////////////////////////
	// BUTTONS OPTIONS
	// We start by creating objects containing options that we will use with the two buttons,
	// in order to write less code.

	bigButtonOptions = {
		width: 0.4,
		height: 0.15,
		justifyContent: 'center',
		offset: 0.05,
		margin: 0.02,
		backgroundOpacity: 1,
		borderRadius: 0.075
	};

	buttonOptions = {
		width: 0.15,
		height: 0.15,
		justifyContent: 'center',
		offset: 0.05,
		margin: 0.02,
		backgroundOpacity: 1,
		borderRadius: 0.08
	};

	// Options for component.setupState().
	// It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

	hoveredStateAttributes = {
		state: 'hovered',
		attributes: {
			offset: 0.035,
			backgroundColor: new Color(0xffff00),
			backgroundOpacity: 1,
			fontColor: new Color(0x000000)
		},
	};

	idleStateAttributes = {
		state: 'idle',
		attributes: {
			offset: 0.035,
			backgroundColor: new Color(0x999999),
			backgroundOpacity: 1,
			fontColor: new Color(0xffffff)
		},
	};

	selectedAttributes = {
		offset: 0.02,
		backgroundColor: new Color(0x777777),
		backgroundOpacity: 1,
		fontColor: new Color(0x222222)
	};

	textureAttributes(texture) {
		return {
			height: 0.1,
			width: 0.1,
			backgroundTexture: texture,
			borderRadius: 0
		}
	};

	//////////////////////////////////////////////////////////////////////////////
	// CONSTRUCT
	//////////////////////////////////////////////////////////////////////////////

	constructor(video) {

		this.playMenuContainer = new Block({
			justifyContent: 'center',
			contentDirection: 'column-reverse',
			fontFamily: FontJSON,
			fontTexture: FontImage,
			fontSize: 0.07,
			padding: 0.02,
			borderRadius: 0,
			backgroundOpacity: 1,
			width: this.PLAYERPANELMAXWIDTH
		});
		this.playMenuContainer.visible = false;
		MAIN.scene.add(this.playMenuContainer);
		const playMenuContainerButtons = new Block(this.commonBlockAttributes);

		this.playMenuContainer.position.set(0, 1.2, -1.6);
		this.playMenuContainer.add(playMenuContainerButtons);

		this.playMenuContainer.setupState({ state: 'selected' });
		this.playMenuContainer.setupState({ state: 'hovered' });
		this.playMenuContainer.setupState({ state: 'idle' });

		////////////////////////////////////////

		// Time elapsed and duration info label
		const playbackContainer = new Block(this.playbackContainerAttributes);
		this.playbackLabelContainer = new Text({
			content: '0:00'
		});
		playbackContainer.add(this.playbackLabelContainer);
		this.playMenuContainer.add(playbackContainer);

		////////////////////////////////////////


		// BUTTONS

		// Buttons creation, with the options objects passed in parameters.

		this.buttonPlay = new Block(this.buttonOptions);
		const buttonPause = new Block(this.buttonOptions);
		buttonPause.visible = false;
		const buttonStop = new Block(this.buttonOptions);
		const buttonFF = new Block(this.buttonOptions);
		const buttonRew = new Block(this.buttonOptions);
		const buttonMute = new Block(this.buttonOptions);
		const dummyButtonMute = new Block(this.buttonOptions);
		dummyButtonMute.visible = false;
		const buttonMuteContainer = new Block(this.paddingOnRightContainerAttributes).add(buttonMute, dummyButtonMute);
		const buttonExitToMain = new Block(this.buttonOptions);
		const buttonExitToMainContainer = new Block(this.paddingOnRightContainerAttributes).add(buttonExitToMain);
		const recenterButton = new Block(this.buttonOptions);

		const settingsButton = new Block(this.buttonOptions);
		const hideButton = new Block(this.buttonOptions);
		const hideButtonContainer = new Block(this.hideButtonContainerAttributes).add(hideButton);

		/////////////////////////////////////////////////////////////////////////////////

		this.playIconElement = new Block(this.iconElementAttributes);

		this.pauseIconElement = new Block(this.iconElementAttributes);

		this.loader.load(PlayIcon, (texture) => {
			this.playIconElement.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(PauseIcon, (texture) => {
			this.pauseIconElement.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});
		this.buttonPlay.add(this.pauseIconElement);
		buttonPause.add(this.playIconElement);

		this.loader.load(StopIcon, (texture) => {
			buttonStop.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(FFIcon, (texture) => {
			buttonFF.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(RewIcon, (texture) => {
			buttonRew.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(ExitIcon, (texture) => {
			buttonExitToMain.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});
		//////////////////////////////////////

		const muteIconElement = new Block(this.iconElementAttributes);

		const unmuteIconElement = new Block(this.iconElementAttributes);

		this.loader.load(VolumeIcon, (texture) => {
			muteIconElement.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});
		this.loader.load(MuteIcon, (texture) => {
			unmuteIconElement.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});
		buttonMute.add(muteIconElement);
		dummyButtonMute.add(unmuteIconElement);
		buttonMute.muted = false;

		///////////////////////////////////////////////

		this.loader.load(TargetIcon, (texture) => {
			recenterButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(SettingsIcon, (texture) => {
			settingsButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(HideIcon, (texture) => {
			hideButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		// Create states for the buttons.
		// In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

		this.buttonPlay.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				if (Helpers.videoSrcExists()) {
					switch (video.paused) {
						case false:
							video.pause();
							this.buttonPlay.remove(this.pauseIconElement);
							this.buttonPlay.add(this.playIconElement);
							break;
						default:
						case true:
							this.buttonPlay.remove(this.playIconElement);
							this.buttonPlay.add(this.pauseIconElement);
							video.play();
							break;
					}
				}
			}
		});
		this.buttonPlay.setupState(this.hoveredStateAttributes);
		this.buttonPlay.setupState(this.idleStateAttributes);

		buttonFF.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				if (Helpers.videoSrcExists()) {
					video.currentTime += 10;
				}

			}
		});
		buttonFF.setupState(this.hoveredStateAttributes);
		buttonFF.setupState(this.idleStateAttributes);

		//

		buttonRew.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				if (Helpers.videoSrcExists()) {
					video.currentTime -= 10;
				}
			}
		});
		buttonRew.setupState(this.hoveredStateAttributes);
		buttonRew.setupState(this.idleStateAttributes);

		//

		buttonExitToMain.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				this.ExitToMain();
			}
		});
		buttonExitToMain.setupState(this.hoveredStateAttributes);
		buttonExitToMain.setupState(this.idleStateAttributes);

		//

		buttonMute.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				if (Helpers.videoSrcExists()) {
					switch (video.muted) {
						case true:
							buttonMute.muted = video.muted = false;
							buttonMute.remove(unmuteIconElement);
							buttonMute.add(muteIconElement);
							break;
						case false:
							buttonMute.muted = video.muted = true;
							buttonMute.remove(muteIconElement);
							buttonMute.add(unmuteIconElement);
							break;
					}
				}
			}
		});
		buttonMute.setupState(this.hoveredStateAttributes);
		buttonMute.setupState(this.idleStateAttributes);
		buttonMute.setupState({
			state: 'idlemuted',
			attributes: {
				offset: 0.035,
				backgroundColor: new Color(0xff0000),
				backgroundOpacity: 1,
				fontColor: new Color(0xffffff)
			},
		});

		//

		recenterButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {

				setTimeout(ScreenManager.recenter, 2000);

			}
		});
		recenterButton.setupState(this.hoveredStateAttributes);
		recenterButton.setupState(this.idleStateAttributes);

		//

		settingsButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				switch (this.settingsMenuContainer.settingsVisible) {
					case true:
						this.hideSettingsMenuContainer();
						break;
					case false:
						this.showSettingsMenuContainer();
						break;
				}
			}
		});
		settingsButton.setupState(this.hoveredStateAttributes);
		settingsButton.setupState(this.idleStateAttributes);

		//

		hideButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				if (MAIN.hiddenSphere.buttonsVisible && !this.showPlayMenuPanelDoubleClickPreventFlag.prevent) {
					this.hidePlayMenuPanel();
				}
			}
		});
		hideButton.setupState(this.hoveredStateAttributes);
		hideButton.setupState(this.idleStateAttributes);

		// Progress Bar

		this.progressBar = new Block(this.progressBarAttributes);
		var parent = this;
		this.progressBar.onAfterUpdate = function () {
			parent.progressBar.frame.layers.set(1);
			parent.progressBar.frame.layers.enable(2);
		};

		const progressBarPoint = new Block(this.progressBarPointAttributes);
		progressBarPoint.onAfterUpdate = function () {
			progressBarPoint.frame.layers.set(1);
			progressBarPoint.frame.layers.enable(2);
		};

		this.progressBarContainer = new Block(this.progressBarContainerAttributes).add(this.progressBar, progressBarPoint);
		this.progressBarContainer.name = "progressBarContainer";

		this.progressBarContainer.setupState({
			state: 'selected',
			onSet: () => {
				video.currentTime = video.duration * this.progressBarContainer.uv.x;
			}
		});
		this.progressBarContainer.setupState({
			state: 'hovered',
			attributes: {
				height: (this.PROGRESSPANELHEIGHT * 1.5)
			},
			onSet: () => {

			}
		});
		this.progressBarContainer.setupState({
			state: 'idle',
			attributes: {
				height: this.PROGRESSPANELHEIGHT
			},
		});

		this.playMenuContainer.add(this.progressBarContainer);

		playMenuContainerButtons.add(buttonExitToMainContainer, buttonMuteContainer, buttonRew, this.buttonPlay, buttonFF, recenterButton, settingsButton, hideButtonContainer);
		this.playMenuObjsToTest.push(hideButton, buttonExitToMain, buttonRew, this.buttonPlay, buttonFF, buttonMute, recenterButton, settingsButton, this.progressBarContainer, this.playMenuContainer, MAIN.hiddenSphere);

		// Settings container

		this.settingsMenuContainer = new Block(this.settingsBlockAttributes);
		this.settingsMenuContainer.visible = false;
		MAIN.scene.add(this.settingsMenuContainer);
		this.settingsMenuContainer.settingsVisible = false;
		this.settingsMenuContainer.position.set(0.5, 1.8, -1.55);
		this.settingsMenuContainer.setupState({ state: 'selected' });
		this.settingsMenuContainer.setupState({ state: 'hovered' });
		this.settingsMenuContainer.setupState({ state: 'idle' });

		const settingsMenuTopBar = new Block(this.settingsRowBlockAttributes);
		settingsMenuTopBar.set({ justifyContent: 'end', width: (this.SETTINGSPANELMAXWIDTH - this.SETTINGSPANELMAXWIDTH / 16) });
		const settingsMenuZoom = new Block(this.settingsRowBlockAttributes);
		const settingsMenuTilt = new Block(this.settingsRowBlockAttributes);
		const settingsMenuModes = new Block(this.settingsRowBlockAttributes);


		const closeSettingsButton = new Block(this.closeSettingsButtonAttributes);
		const zoomOutButton = new Block(this.buttonOptions);
		const zoomInButton = new Block(this.buttonOptions);
		const zoomResetButton = new Block(this.buttonOptions);
		const tiltUpButton = new Block(this.buttonOptions);
		const tiltDownButton = new Block(this.buttonOptions);
		const tiltResetButton = new Block(this.buttonOptions);
		const VRModeButton = new Block(this.buttonOptions);
		const ScreenModeButton = new Block(this.buttonOptions);

		this.loader.load(CloseIcon, (texture) => {
			closeSettingsButton.add(
				new InlineBlock({
					height: 0.06,
					width: 0.06,
					backgroundTexture: texture,
					borderRadius: 0
				})
			);
		});

		this.loader.load(ZoomOutIcon, (texture) => {
			zoomOutButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(ZoomInIcon, (texture) => {
			zoomInButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(ResetIcon, (texture) => {
			zoomResetButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(UpIcon, (texture) => {
			tiltUpButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(DownIcon, (texture) => {
			tiltDownButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(ResetIcon, (texture) => {
			tiltResetButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(VRIcon, (texture) => {
			VRModeButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		this.loader.load(WideScreenIcon, (texture) => {
			ScreenModeButton.add(
				new InlineBlock(this.textureAttributes(texture))
			);
		});

		closeSettingsButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				this.hideSettingsMenuContainer();
			}
		});
		closeSettingsButton.setupState(this.hoveredStateAttributes);
		closeSettingsButton.setupState(this.idleStateAttributes);

		zoomOutButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.zoom("out");
			}
		});
		zoomOutButton.setupState(this.hoveredStateAttributes);
		zoomOutButton.setupState(this.idleStateAttributes);

		zoomInButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.zoom("in");
			}
		});
		zoomInButton.setupState(this.hoveredStateAttributes);
		zoomInButton.setupState(this.idleStateAttributes);

		zoomResetButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.zoom("reset");
			}
		});
		zoomResetButton.setupState(this.hoveredStateAttributes);
		zoomResetButton.setupState(this.idleStateAttributes);

		tiltUpButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.tilt("up");
			}
		});
		tiltUpButton.setupState(this.hoveredStateAttributes);
		tiltUpButton.setupState(this.idleStateAttributes);

		tiltDownButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.tilt("down");
			}
		});
		tiltDownButton.setupState(this.hoveredStateAttributes);
		tiltDownButton.setupState(this.idleStateAttributes);

		tiltResetButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.tilt("reset");
			}
		});
		tiltResetButton.setupState(this.hoveredStateAttributes);
		tiltResetButton.setupState(this.idleStateAttributes);

		VRModeButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.switchModeVRScreen("vr");
			}
		});
		VRModeButton.setupState(this.hoveredStateAttributes);
		VRModeButton.setupState(this.idleStateAttributes);

		ScreenModeButton.setupState({
			state: 'selected',
			attributes: this.selectedAttributes,
			onSet: () => {
				ScreenManager.switchModeVRScreen("screen");
			}
		});
		ScreenModeButton.setupState(this.hoveredStateAttributes);
		ScreenModeButton.setupState(this.idleStateAttributes);

		// Labels
		const zoomLabel = new Block(this.bigButtonOptions).add(new Text({
			content: 'Zoom video', fontSize: 0.05
		}));

		const tiltLabel = new Block(this.bigButtonOptions).add(new Text({
			content: 'Tilt video', fontSize: 0.05
		}));

		const modeLabel = new Block(this.bigButtonOptions).add(new Text({
			content: 'Switch mode', fontSize: 0.05
		}));

		settingsMenuTopBar.add(closeSettingsButton);
		settingsMenuZoom.add(zoomLabel, zoomOutButton, zoomInButton, zoomResetButton);
		settingsMenuTilt.add(tiltLabel, tiltDownButton, tiltUpButton, tiltResetButton);
		settingsMenuModes.add(modeLabel, ScreenModeButton, VRModeButton);
		this.settingsMenuContainer.add(settingsMenuTopBar, settingsMenuModes, settingsMenuZoom, settingsMenuTilt);
		this.settingsMenuObjsToTest.push(closeSettingsButton, zoomInButton, zoomOutButton, zoomResetButton, tiltUpButton, tiltDownButton, tiltResetButton, ScreenModeButton, VRModeButton, settingsButton, this.settingsMenuContainer, this.playMenuContainer, MAIN.hiddenSphere);

	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Hide / Show Menu

	showPlayMenuPanel() {
		Helpers.preventDoubleClick(this.showPlayMenuPanelDoubleClickPreventFlag, 1);
		UI.showMenu(this.playMenuContainer, this.playMenuObjsToTest, true);
		MAIN.hiddenSphere.buttonsVisible = true;
	}

	hidePlayMenuPanel() {
		Helpers.preventDoubleClick(this.showPlayMenuPanelDoubleClickPreventFlag, 1);
		if (this.settingsMenuContainer.settingsVisible) {
			this.hideSettingsMenuContainer();
		}
		UI.hideMenu(this.playMenuContainer, [], true);
		MAIN.hiddenSphere.buttonsVisible = false;
	}

	showSettingsMenuContainer() {
		UI.showMenu(this.settingsMenuContainer, this.settingsMenuObjsToTest);
		this.settingsMenuContainer.settingsVisible = true;
	}

	hideSettingsMenuContainer() {
		UI.hideMenu(this.settingsMenuContainer, this.playMenuObjsToTest);
		this.settingsMenuContainer.settingsVisible = false;
	}

	ExitToMain() {
		this.hidePlayMenuPanel();
		MAIN.fileBrowserPanel.showFileMenuPanel();
	}

	/////////////////////////////////////////////////////////////////
	// progressbar and duration time
	videoCantEndBug = false;

	progressBarAndDuration() {

		if (Helpers.videoSrcExists()) {
			if (MAIN.hiddenSphere.buttonsVisible) {
				let progressBarLength = (((this.PROGRESSPANELMAXWIDTH - (this.PROGRESSPANELMINWIDTH * 2 - 0.001)) * ((video.currentTime * 100) / video.duration)) / 100)
				this.progressBar.set({ width: ((progressBarLength < this.PROGRESSPANELMINWIDTH) ? this.PROGRESSPANELMINWIDTH : progressBarLength) });
				let playbackHelper = new Date(null);
				playbackHelper.setSeconds(video.currentTime);
				let result = playbackHelper.toISOString().substr(11, 8);
				result += " / ";
				playbackHelper = new Date(null);
				playbackHelper.setSeconds(video.duration);
				result += playbackHelper.toISOString().substr(11, 8);
				this.playbackLabelContainer.set({ content: result });
			}

			if (video.ended == false) {
				// Some videos can't stop playing, meaning they almost reach the end eg. video.duration: 51.985691 but when video reaches end video.currentTime is 51.98569
				// almost the end but playback can't end by itself which causes screen to flip between few last frames
				if (((video.currentTime * 100) / video.duration) > 99.9999) {
					if (this.videoCantEndBug) {
						video.pause();
						video.currentTime += 10;
						this.buttonPlay.remove(this.pauseIconElement);
						this.buttonPlay.add(this.playIconElement);
						this.videoCantEndBug = false;
					} else {
						this.videoCantEndBug = true;
					}
				}
			} else {
				this.videoCantEndBug = false;
				this.buttonPlay.remove(this.pauseIconElement);
				this.buttonPlay.add(this.playIconElement);
			}
		}
	}
}