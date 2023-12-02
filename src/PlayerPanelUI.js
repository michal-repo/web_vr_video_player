import {
    Color,
    TextureLoader,
} from "../node_modules/three/build/three.module.js";
import {
    Block,
    Text,
    InlineBlock,
} from "../node_modules/three-mesh-ui/build/three-mesh-ui.module.js";

import FontJSON from "../assets/fonts/Roboto-Regular-msdf.json";
import FontImage from "../assets/fonts/Roboto-Regular.png";

import * as MAIN from "./index.js";

import * as ScreenManager from "./ScreenManager/ScreenManager.js";

import * as UI from "./UI.js";

import * as Helpers from "./Helpers.js";

// Import Icons
import PlayIcon from "../assets/icons/play.png";
import PauseIcon from "../assets/icons/pause.png";
import StopIcon from "../assets/icons/stop.png";
import FFIcon from "../assets/icons/fast-forward.png";
import RewIcon from "../assets/icons/rewind.png";
import MuteIcon from "../assets/icons/mute.png";
import VolumeIcon from "../assets/icons/volume.png";
import ExitIcon from "../assets/icons/logout.png";
import CloseIcon from "../assets/icons/close.png";
import SettingsIcon from "../assets/icons/setting.png";
import ZoomOutIcon from "../assets/icons/zoom-out.png";
import ZoomInIcon from "../assets/icons/zoom-in.png";
import UpIcon from "../assets/icons/up-arrow.png";
import DownIcon from "../assets/icons/down-arrow.png";
import VRIcon from "../assets/icons/vr-glasses.png";
import WideScreenIcon from "../assets/icons/wide.png";
import ResetIcon from "../assets/icons/reset.png";
import FullScreenIcon from "../assets/icons/fullscreen.png";

export class PlayerPanel {
    playMenuContainer;
    playMenuObjsToTest = [];
    settingsMenuObjsToTest = [];
    progressBar;
    progressBarContainer;
    settingsMenuContainer;
    buttonPlay;
    playIconElement;
    pauseIconElement;
    VR2DModeButtonText;
    VRSBSTBModeButtonText;
    draggingBox;

    loader = new TextureLoader();

    PLAYERPANELMAXWIDTH = 3;
    PROGRESSPANELMAXWIDTH = this.PLAYERPANELMAXWIDTH - 0.1;
    PROGRESSPANELHEIGHT = 0.08;
    PROGRESSPANELMINWIDTH = 0.01;

    SETTINGSPANELMAXWIDTH = this.PLAYERPANELMAXWIDTH / 1.5;
    BUTTONSPANELMAXWIDTH = this.PLAYERPANELMAXWIDTH - 0.2;

    videoElement;

    commonBlockAttributes = {
        justifyContent: "center",
        contentDirection: "row",
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11,
        backgroundOpacity: 0,
    };

    playbackContainerAttributes = {
        justifyContent: "center",
        contentDirection: "row",
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.11,
        backgroundOpacity: 0,
        height: 0.1,
        width: this.PLAYERPANELMAXWIDTH,
    };

    // Holds Play/Pause;FF;REW;Settings buttons
    centerContainerAttributes = {
        width: this.BUTTONSPANELMAXWIDTH / 3,
        height: 0.15,
        justifyContent: "center",
        contentDirection: "row",
        offset: 0,
        margin: 0,
        backgroundOpacity: 0,
    };

    exitButtonContainerAttributes = {
        width: this.BUTTONSPANELMAXWIDTH / 6,
        height: 0.15,
        justifyContent: "start",
        contentDirection: "row",
        offset: 0,
        margin: 0,
        backgroundOpacity: 0,
    };

    muteButtonContainerAttributes = {
        width: this.BUTTONSPANELMAXWIDTH / 6,
        height: 0.15,
        justifyContent: "end",
        contentDirection: "row",
        offset: 0,
        margin: 0,
        backgroundOpacity: 0,
    };

    moveButtonContainerAttributes = {
        width: this.BUTTONSPANELMAXWIDTH / 3,
        height: 0.15,
        justifyContent: "end",
        contentDirection: "row",
        offset: 0,
        margin: 0,
        backgroundOpacity: 0,
    };

    progressBarAttributes = {
        height: this.PROGRESSPANELHEIGHT,
        width: 0.001,
        margin: 0,
        borderRadius: 0,
        backgroundColor: new Color(0x0099ff),
        justifyContent: "center",
        alignItems: "center",
        offset: 0.005,
    };

    progressBarPointAttributes = {
        height: this.PROGRESSPANELHEIGHT,
        width: this.PROGRESSPANELMINWIDTH * 2,
        margin: 0,
        borderRadius: 0,
        backgroundColor: new Color(0xffffff),
        justifyContent: "center",
        alignItems: "center",
        offset: 0.005,
    };

    closeSettingsButtonAttributes = {
        width: 0.07,
        height: 0.07,
        justifyContent: "center",
        offset: 0.05,
        margin: 0.02,
        borderRadius: 0.035,
    };

    progressBarContainerAttributes = {
        height: this.PROGRESSPANELHEIGHT,
        width: this.PROGRESSPANELMAXWIDTH,
        margin: 0.04,
        offset: 0.045,
        borderRadius: 0,
        justifyContent: "start",
        contentDirection: "row",
        backgroundOpacity: 1,
        backgroundColor: new Color(0x5b5b5b),
    };

    settingsBlockAttributes = {
        justifyContent: "center",
        contentDirection: "column",
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0,
        backgroundOpacity: 1,
        width: this.SETTINGSPANELMAXWIDTH,
    };

    settingsRowBlockAttributes = {
        justifyContent: "start",
        contentDirection: "row",
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.005,
        borderRadius: 0.11,
        backgroundOpacity: 0,
        width: this.SETTINGSPANELMAXWIDTH,
    };

    iconElementAttributes = {
        width: 0.15,
        height: 0.15,
        justifyContent: "center",
        backgroundOpacity: 0,
        offset: 0,
        margin: 0.02,
        borderRadius: 0.08,
    };

    playbackLabelContainer;
    ////////////////////////////////////////////////////////////////////////////////////////
    // BUTTONS OPTIONS
    // We start by creating objects containing options that we will use with the two buttons,
    // in order to write less code.

    bigButtonOptions = {
        width: 0.4,
        height: 0.15,
        justifyContent: "center",
        offset: 0.05,
        margin: 0.02,
        backgroundOpacity: 1,
        borderRadius: 0.075,
    };

    buttonOptions = {
        width: 0.15,
        height: 0.15,
        justifyContent: "center",
        offset: 0.05,
        margin: 0.02,
        backgroundOpacity: 1,
        borderRadius: 0.08,
    };

    biggerButtonOptions = {
        width: 0.55,
        height: 0.15,
        justifyContent: "center",
        offset: 0.05,
        margin: 0.02,
        backgroundOpacity: 1,
        borderRadius: 0.08,
    };

    // Options for component.setupState().
    // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

    hoveredStateAttributes = {
        offset: 0.035,
        backgroundColor: new Color(0xffff00),
        backgroundOpacity: 1,
        fontColor: new Color(0x000000),
    };

    hoveredState = {
        state: "hovered",
        attributes: this.hoveredStateAttributes,
    };

    idleStateAttributes = {
        offset: 0.035,
        backgroundColor: new Color(0x999999),
        backgroundOpacity: 1,
        fontColor: new Color(0xffffff),
    };

    idleState = {
        state: "idle",
        attributes: this.idleStateAttributes,
    };

    selectedAttributes = {
        offset: 0.02,
        backgroundColor: new Color(0x777777),
        backgroundOpacity: 1,
        fontColor: new Color(0x222222),
    };

    textureAttributes(texture) {
        return {
            height: 0.1,
            width: 0.1,
            backgroundTexture: texture,
            borderRadius: 0,
        };
    }

    //////////////////////////////////////////////////////////////////////////////
    // CONSTRUCT
    //////////////////////////////////////////////////////////////////////////////

    constructor(video) {
        this.videoElement = video;

        this.playMenuContainer = new Block({
            justifyContent: "center",
            contentDirection: "column-reverse",
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0,
            backgroundOpacity: 1,
            width: this.PLAYERPANELMAXWIDTH,
        });
        this.playMenuContainer.visible = false;
        MAIN.scene.add(this.playMenuContainer);
        const playMenuContainerButtons = new Block(this.commonBlockAttributes);

        this.playMenuContainer.position.set(0, 0.6, -3);
        this.playMenuContainer.add(playMenuContainerButtons);

        this.playMenuContainer.setupState({ state: "selected" });
        this.playMenuContainer.setupState({ state: "hovered" });
        this.playMenuContainer.setupState({ state: "idle" });

        ScreenManager.registerPanel(
            this.playMenuContainer,
            "playMenuPanel",
            "playMenuContainer",
            "playMenuContainer"
        );

        ////////////////////////////////////////

        // Time elapsed and duration info label
        const playbackContainer = new Block(this.playbackContainerAttributes);
        this.playbackLabelContainer = new Text({
            content: "0:00",
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
        const buttonMuteContainer = new Block(
            this.muteButtonContainerAttributes
        ).add(buttonMute, dummyButtonMute);
        const buttonExitToMain = new Block(this.buttonOptions);
        const buttonExitToMainContainer = new Block(
            this.exitButtonContainerAttributes
        ).add(buttonExitToMain);

        const settingsButton = new Block(this.buttonOptions);
        const buttonsPlaybackContainer = new Block(
            this.centerContainerAttributes
        ).add(
            buttonPause,
            buttonRew,
            this.buttonPlay,
            buttonFF,
            settingsButton
        );

        const moveButton = new Block(this.buttonOptions);
        const moveResetButton = new Block(this.buttonOptions);
        const moveButtonContainer = new Block(
            this.moveButtonContainerAttributes
        ).add(moveResetButton, moveButton);

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
            buttonStop.add(new InlineBlock(this.textureAttributes(texture)));
        });

        this.loader.load(FFIcon, (texture) => {
            buttonFF.add(new InlineBlock(this.textureAttributes(texture)));
        });

        this.loader.load(RewIcon, (texture) => {
            buttonRew.add(new InlineBlock(this.textureAttributes(texture)));
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

        this.loader.load(SettingsIcon, (texture) => {
            settingsButton.add(
                new InlineBlock(this.textureAttributes(texture))
            );
        });

        this.loader.load(FullScreenIcon, (texture) => {
            moveButton.add(new InlineBlock(this.textureAttributes(texture)));
        });

        // Create states for the buttons.
        // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

        this.buttonPlay.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.playPause();
            },
        });
        this.buttonPlay.setupState(this.hoveredState);
        this.buttonPlay.setupState(this.idleState);

        this.buttonPlay.playbackStarted = () => {
            this.buttonPlay.remove(this.playIconElement);
            this.buttonPlay.add(this.pauseIconElement);
        };

        buttonFF.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.videoPlaybackFFRew("FF");
            },
        });
        buttonFF.setupState(this.hoveredState);
        buttonFF.setupState(this.idleState);

        //

        buttonRew.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.videoPlaybackFFRew("Rew");
            },
        });
        buttonRew.setupState(this.hoveredState);
        buttonRew.setupState(this.idleState);

        //

        buttonExitToMain.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.ExitToMain();
            },
        });
        buttonExitToMain.setupState(this.hoveredState);
        buttonExitToMain.setupState(this.idleState);

        //

        buttonMute.setupState({
            state: "selected",
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
            },
        });
        buttonMute.setupState(this.hoveredState);
        buttonMute.setupState(this.idleState);
        buttonMute.setupState({
            state: "idlemuted",
            attributes: {
                offset: 0.035,
                backgroundColor: new Color(0xff0000),
                backgroundOpacity: 1,
                fontColor: new Color(0xffffff),
            },
        });

        //

        settingsButton.setupState({
            state: "selected",
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
            },
        });
        settingsButton.setupState(this.hoveredState);
        settingsButton.setupState(this.idleState);

        //

        moveButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.startDrag("playerControls");
            },
        });

        moveButton.setupState({
            state: "hovered",
            attributes: this.hoveredStateAttributes,
            onSet: () => {
                ScreenManager.stopDrag("playerControls");
            },
        });
        moveButton.setupState({
            state: "idle",
            attributes: this.idleStateAttributes,
            onSet: () => {
                ScreenManager.stopDrag("playerControls");
            },
        });

        moveResetButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.resetDrag("player");
            },
        });

        moveResetButton.setupState({
            state: "hovered",
            attributes: this.hoveredStateAttributes,
        });

        moveResetButton.setupState({
            state: "idle",
            attributes: this.idleStateAttributes,
        });

        // Progress Bar

        this.progressBar = new Block(this.progressBarAttributes);
        let parent = this;
        this.progressBar.onAfterUpdate = function () {
            parent.progressBar.frame.layers.set(1);
            parent.progressBar.frame.layers.enable(2);
        };

        const progressBarPoint = new Block(this.progressBarPointAttributes);
        progressBarPoint.onAfterUpdate = function () {
            progressBarPoint.frame.layers.set(1);
            progressBarPoint.frame.layers.enable(2);
        };

        this.progressBarContainer = new Block(
            this.progressBarContainerAttributes
        ).add(this.progressBar, progressBarPoint);
        this.progressBarContainer.name = "progressBarContainer";

        this.progressBarContainer.setupState({
            state: "selected",
            onSet: () => {
                video.currentTime =
                    video.duration * this.progressBarContainer.uv.x;
            },
        });
        this.progressBarContainer.setupState({
            state: "hovered",
            attributes: {
                height: this.PROGRESSPANELHEIGHT * 1.5,
            },
            onSet: () => {},
        });
        this.progressBarContainer.setupState({
            state: "idle",
            attributes: {
                height: this.PROGRESSPANELHEIGHT,
            },
        });

        this.playMenuContainer.add(this.progressBarContainer);

        playMenuContainerButtons.add(
            buttonExitToMainContainer,
            buttonMuteContainer,
            buttonsPlaybackContainer,
            moveButtonContainer
        );
        this.playMenuObjsToTest.push(
            moveResetButton,
            moveButton,
            buttonExitToMain,
            buttonRew,
            this.buttonPlay,
            buttonFF,
            buttonMute,
            settingsButton,
            this.progressBarContainer,
            this.playMenuContainer,
            MAIN.hiddenSphere
        );

        // Settings container

        this.settingsMenuContainer = new Block(this.settingsBlockAttributes);
        this.settingsMenuContainer.visible = false;
        MAIN.scene.add(this.settingsMenuContainer);
        this.settingsMenuContainer.settingsVisible = false;
        this.settingsMenuContainer.position.set(0, 1, -2.95);
        this.settingsMenuContainer.setupState({ state: "selected" });
        this.settingsMenuContainer.setupState({ state: "hovered" });
        this.settingsMenuContainer.setupState({ state: "idle" });
        ScreenManager.registerPanel(
            this.settingsMenuContainer,
            "playMenuPanel",
            "settingsMenuContainer",
            "settingsMenuContainer"
        );

        const settingsMenuTopBar = new Block(this.settingsRowBlockAttributes);
        settingsMenuTopBar.set({
            justifyContent: "end",
            width: this.SETTINGSPANELMAXWIDTH - this.SETTINGSPANELMAXWIDTH / 16,
        });
        const settingsMenuZoom = new Block(this.settingsRowBlockAttributes);
        const settingsMenuTilt = new Block(this.settingsRowBlockAttributes);
        const settingsMenuModes = new Block(this.settingsRowBlockAttributes);

        const closeSettingsButton = new Block(
            this.closeSettingsButtonAttributes
        );
        const zoomOutButton = new Block(this.buttonOptions);
        const zoomInButton = new Block(this.buttonOptions);
        const zoomResetButton = new Block(this.buttonOptions);
        const tiltUpButton = new Block(this.buttonOptions);
        const tiltDownButton = new Block(this.buttonOptions);
        const tiltResetButton = new Block(this.buttonOptions);
        const VRModeButton = new Block(this.buttonOptions);
        const ScreenModeButton = new Block(this.buttonOptions);
        const VR2DModeButton = new Block(this.buttonOptions);
        const VRSBSTBModeButton = new Block(this.biggerButtonOptions);

        this.VR2DModeButtonText = new Text({
            content: "3D",
            fontSize: 0.07,
        });
        VR2DModeButton.add(this.VR2DModeButtonText);

        this.VRSBSTBModeButtonText = new Text({
            content: Helpers.getWordFromLang("side_by_side"),
            fontSize: 0.07,
        });
        VRSBSTBModeButton.add(this.VRSBSTBModeButtonText);

        this.loader.load(CloseIcon, (texture) => {
            closeSettingsButton.add(
                new InlineBlock({
                    height: 0.06,
                    width: 0.06,
                    backgroundTexture: texture,
                    borderRadius: 0,
                })
            );
        });

        this.loader.load(ZoomOutIcon, (texture) => {
            zoomOutButton.add(new InlineBlock(this.textureAttributes(texture)));
        });

        this.loader.load(ZoomInIcon, (texture) => {
            zoomInButton.add(new InlineBlock(this.textureAttributes(texture)));
        });

        this.loader.load(ResetIcon, (texture) => {
            zoomResetButton.add(
                new InlineBlock(this.textureAttributes(texture))
            );
            moveResetButton.add(
                new InlineBlock(this.textureAttributes(texture))
            );
        });

        this.loader.load(UpIcon, (texture) => {
            tiltUpButton.add(new InlineBlock(this.textureAttributes(texture)));
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
            VRModeButton.add(new InlineBlock(this.textureAttributes(texture)));
        });

        this.loader.load(WideScreenIcon, (texture) => {
            ScreenModeButton.add(
                new InlineBlock(this.textureAttributes(texture))
            );
        });

        closeSettingsButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.hideSettingsMenuContainer();
            },
        });
        closeSettingsButton.setupState(this.hoveredState);
        closeSettingsButton.setupState(this.idleState);

        zoomOutButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.zoom("out");
            },
        });
        zoomOutButton.setupState(this.hoveredState);
        zoomOutButton.setupState(this.idleState);

        zoomInButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.zoom("in");
            },
        });
        zoomInButton.setupState(this.hoveredState);
        zoomInButton.setupState(this.idleState);

        zoomResetButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.zoom("reset");
            },
        });
        zoomResetButton.setupState(this.hoveredState);
        zoomResetButton.setupState(this.idleState);

        tiltUpButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.tilt("up");
            },
        });
        tiltUpButton.setupState(this.hoveredState);
        tiltUpButton.setupState(this.idleState);

        tiltDownButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.tilt("down");
            },
        });
        tiltDownButton.setupState(this.hoveredState);
        tiltDownButton.setupState(this.idleState);

        tiltResetButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.tilt("reset");
            },
        });
        tiltResetButton.setupState(this.hoveredState);
        tiltResetButton.setupState(this.idleState);

        VRModeButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.switchModeVRScreen(ScreenManager.VRMode);
            },
        });
        VRModeButton.setupState(this.hoveredState);
        VRModeButton.setupState(this.idleState);

        ScreenModeButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                ScreenManager.switchModeVRScreen("screen");
            },
        });
        ScreenModeButton.setupState(this.hoveredState);
        ScreenModeButton.setupState(this.idleState);

        VR2DModeButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                if (ScreenManager.force_2d_mode) {
                    ScreenManager.force2DMode(false);
                    this.VR2DModeButtonText.set({ content: "3D" });
                } else {
                    ScreenManager.force2DMode(true);
                    this.VR2DModeButtonText.set({ content: "2D" });
                }
            },
        });
        VR2DModeButton.setupState(this.hoveredState);
        VR2DModeButton.setupState(this.idleState);

        VRSBSTBModeButton.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                if (ScreenManager.VRMode === "sbs") {
                    ScreenManager.switchModeVRScreen("tb");
                    this.VRSBSTBModeButtonText.set({
                        content: Helpers.getWordFromLang("top_bottom"),
                    });
                } else if (ScreenManager.VRMode === "tb") {
                    ScreenManager.switchModeVRScreen("360");
                    this.VRSBSTBModeButtonText.set({
                        content: Helpers.getWordFromLang("top_bottom_360"),
                    });
                } else if (ScreenManager.VRMode === "360") {
                    ScreenManager.switchModeVRScreen("sphere180");
                    this.VRSBSTBModeButtonText.set({ content: "2D 180" });
                } else if (ScreenManager.VRMode === "sphere180") {
                    ScreenManager.switchModeVRScreen("sphere360");
                    this.VRSBSTBModeButtonText.set({ content: "2D 360" });
                } else if (ScreenManager.VRMode === "sphere360") {
                    ScreenManager.switchModeVRScreen("sbs");
                    this.VRSBSTBModeButtonText.set({
                        content: Helpers.getWordFromLang("side_by_side"),
                    });
                }
            },
        });
        VRSBSTBModeButton.setupState(this.hoveredState);
        VRSBSTBModeButton.setupState(this.idleState);

        // Labels
        const zoomLabel = new Block(this.bigButtonOptions).add(
            new Text({
                content: Helpers.getWordFromLang("zoom_video"),
                fontSize: 0.05,
            })
        );

        const tiltLabel = new Block(this.bigButtonOptions).add(
            new Text({
                content: Helpers.getWordFromLang("tilt_video"),
                fontSize: 0.05,
            })
        );

        const modeLabel = new Block(this.bigButtonOptions).add(
            new Text({
                content: Helpers.getWordFromLang("switch_mode"),
                fontSize: 0.05,
            })
        );

        settingsMenuTopBar.add(closeSettingsButton);
        settingsMenuZoom.add(
            zoomLabel,
            zoomOutButton,
            zoomInButton,
            zoomResetButton
        );
        settingsMenuTilt.add(
            tiltLabel,
            tiltDownButton,
            tiltUpButton,
            tiltResetButton
        );
        settingsMenuModes.add(
            modeLabel,
            ScreenModeButton,
            VRModeButton,
            VR2DModeButton,
            VRSBSTBModeButton
        );
        this.settingsMenuContainer.add(
            settingsMenuTopBar,
            settingsMenuModes,
            settingsMenuZoom,
            settingsMenuTilt
        );
        this.settingsMenuObjsToTest.push(
            closeSettingsButton,
            zoomInButton,
            zoomOutButton,
            zoomResetButton,
            tiltUpButton,
            tiltDownButton,
            tiltResetButton,
            ScreenModeButton,
            VRModeButton,
            VR2DModeButton,
            VRSBSTBModeButton,
            settingsButton,
            this.settingsMenuContainer,
            this.playMenuContainer,
            MAIN.hiddenSphere
        );

        this.draggingBox = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            borderRadius: 0.06,
            backgroundOpacity: 1,
            backgroundColor: new Color(0x5c5c5c),
            width: this.PLAYERPANELMAXWIDTH / 2,
            height: 0.1,
        });
        this.draggingBox.visible = false;
        MAIN.scene.add(this.draggingBox);
        this.draggingBox.position.set(0, 0.25, -3);
        this.draggingBox.setupState({
            state: "selected",
            onSet: () => {
                ScreenManager.startDrag("player");
            },
        });

        this.draggingBox.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xffff00),
                backgroundOpacity: 1,
            },
            onSet: () => {
                ScreenManager.stopDrag("player");
            },
        });
        this.draggingBox.setupState({
            state: "idle",
            attributes: {
                backgroundColor: new Color(0x5c5c5c),
                backgroundOpacity: 1,
            },
            onSet: () => {
                ScreenManager.stopDrag("player");
            },
        });
        ScreenManager.registerPanel(
            this.draggingBox,
            "playMenuPanel",
            "draggingBox",
            "draggingBox"
        );
        this.playMenuObjsToTest.push(this.draggingBox);

        ScreenManager.registerObjectToDrag(
            this.draggingBox,
            "player",
            "playMenuPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.playMenuContainer,
            "player",
            "playMenuPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.settingsMenuContainer,
            "player",
            "playMenuPanel"
        );

        ScreenManager.registerObjectToDrag(
            this.draggingBox,
            "playerControls",
            "playMenuPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.playMenuContainer,
            "playerControls",
            "playMenuPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.settingsMenuContainer,
            "playerControls",
            "playMenuPanel"
        );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Hide / Show Menu

    showPlayMenuPanel() {
        UI.showMenu(
            [this.playMenuContainer, this.draggingBox],
            this.playMenuObjsToTest,
            true
        );
        MAIN.hiddenSphere.buttonsVisible = true;
    }

    hidePlayMenuPanel() {
        if (this.settingsMenuContainer.settingsVisible) {
            this.hideSettingsMenuContainer();
        }
        UI.hideMenu([this.playMenuContainer, this.draggingBox], [], true);
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
        ScreenManager.force2DMode(false);
        this.VR2DModeButtonText.set({ content: "3D" });
        this.VRSBSTBModeButtonText.set({
            content: Helpers.getWordFromLang("side_by_side"),
        });
        ScreenManager.resetPosition("playMenuPanel");
        ScreenManager.resetPosition("meshes");
        MAIN.fileBrowserPanel.showFileMenuPanel();
    }

    /////////////////////////////////////////////////////////////////
    // progressbar and duration time
    videoCantEndBug = false;

    progressBarAndDuration() {
        if (Helpers.videoSrcExists()) {
            if (MAIN.hiddenSphere.buttonsVisible) {
                let progressBarLength =
                    ((this.PROGRESSPANELMAXWIDTH -
                        (this.PROGRESSPANELMINWIDTH * 2 - 0.001)) *
                        ((MAIN.video.currentTime * 100) /
                            MAIN.video.duration)) /
                    100;
                this.progressBar.set({
                    width:
                        progressBarLength < this.PROGRESSPANELMINWIDTH
                            ? this.PROGRESSPANELMINWIDTH
                            : progressBarLength,
                });
                let playbackHelper = new Date(null);
                playbackHelper.setSeconds(MAIN.video.currentTime);
                let result = playbackHelper.toISOString().substring(11, 19);
                result += " / ";
                playbackHelper = new Date(null);
                if (MAIN.video.duration) {
                    playbackHelper.setSeconds(MAIN.video.duration);
                    result += playbackHelper.toISOString().substring(11, 19);
                    this.playbackLabelContainer.set({ content: result });
                } else {
                    this.playbackLabelContainer.set({
                        content: Helpers.getWordFromLang("not_available"),
                    });
                }
            }

            if (MAIN.video.ended == false) {
                // Some videos can't stop playing, meaning they almost reach the end eg. video.duration: 51.985691 but when video reaches end video.currentTime is 51.98569
                // almost the end but playback can't end by itself which causes screen to flip between few last frames
                if (
                    (MAIN.video.currentTime * 100) / MAIN.video.duration >
                    99.9999
                ) {
                    if (this.videoCantEndBug) {
                        MAIN.video.pause();
                        MAIN.video.currentTime += 10;
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

    videoPlaybackFFRew(direction, seconds = 10) {
        if (Helpers.videoSrcExists()) {
            switch (direction) {
                case "FF":
                    this.videoElement.currentTime += seconds;
                    break;
                case "Rew":
                    this.videoElement.currentTime -= seconds;
                    break;
                default:
                    break;
            }
        }
    }

    playPause() {
        if (Helpers.videoSrcExists()) {
            switch (this.videoElement.paused) {
                case false:
                    this.videoElement.pause();
                    this.buttonPlay.remove(this.pauseIconElement);
                    this.buttonPlay.add(this.playIconElement);
                    break;
                default:
                case true:
                    this.buttonPlay.remove(this.playIconElement);
                    this.buttonPlay.add(this.pauseIconElement);
                    this.videoElement.play().catch((e) => {
                        console.warn(e);
                    });
                    break;
            }
        }
    }
}
