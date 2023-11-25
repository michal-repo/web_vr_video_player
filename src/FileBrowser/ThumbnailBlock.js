import { Block } from "../../node_modules/three-mesh-ui/build/three-mesh-ui.module.js";

import * as Helpers from "../Helpers.js";
import { fileBrowserPanel } from "../index.js";

import * as MAIN from "../index.js";

export default class ThumbnailBlock extends Block {
    fileSRC;
    fileNameButton;
    fileThumbnail;
    screen_type;
    shouldVerifyVideoSRC = false;

    constructor(
        options,
        fileSRC,
        fileNameButton,
        fileThumbnail,
        screen_type,
        frame_height,
        frame_width,
        selectedAttributes,
        hoveredStateAttributes,
        idleStateAttributes,
        shouldVerifyVideoSRC = false
    ) {
        super(options);

        this.fileSRC = fileSRC;
        this.fileNameButton = fileNameButton;
        this.fileThumbnail = fileThumbnail;
        this.screen_type = screen_type;
        this.frame_height = frame_height;
        this.frame_width = frame_width;
        this.shouldVerifyVideoSRC = shouldVerifyVideoSRC;

        if (this.shouldVerifyVideoSRC) {
            this.setupState({
                state: "selected",
                attributes: selectedAttributes,
                onSet: () => {
                    const response = Helpers.testIfFileExist(this.fileSRC);
                    if (response) {
                        if (screen_type === "screen")
                            MAIN.scaleScreenMesh(
                                this.frame_width / this.frame_height
                            );
                        Helpers.setVideoSrc(this.fileSRC);
                        fileBrowserPanel.hideFileMenuPanel(this.screen_type);
                    } else {
                        MAIN.showPopupMessage(
                            Helpers.getWordFromLang("video_not_found")
                        );
                    }
                },
            });
        } else {
            this.setupState({
                state: "selected",
                attributes: selectedAttributes,
                onSet: () => {
                    if (screen_type === "screen")
                        MAIN.scaleScreenMesh(
                            this.frame_width / this.frame_height
                        );
                    Helpers.setVideoSrc(this.fileSRC);
                    fileBrowserPanel.hideFileMenuPanel(this.screen_type);
                },
            });
        }

        this.setupState({
            state: "hovered",
            attributes: hoveredStateAttributes,
        });
        this.setupState({
            state: "idle",
            attributes: idleStateAttributes,
        });
    }
}
