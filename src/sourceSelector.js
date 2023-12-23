import { Color } from "../node_modules/three/build/three.module.js";
import {
    Block,
    Text,
} from "../node_modules/three-mesh-ui/build/three-mesh-ui.module.js";

import deepDelete from "../node_modules/three-mesh-ui/src/utils/deepDelete.js";

import FontJSON from "../assets/fonts/Roboto-Regular-msdf.json";
import FontImage from "../assets/fonts/Roboto-Regular.png";

import { fileBrowserPanel, scene } from "./index.js";
import { hideMenu, showMenu, registerNewObjectsToTest } from "./UI.js";
import { getWordFromLang } from "./Helpers.js";
import {
    registerObjectToDrag,
    registerPanel,
} from "./ScreenManager/ScreenManager.js";

export default class SourcesSelectorPanel {
    sources;
    sourcesSelectorContainerAttributes = {
        justifyContent: "start",
        contentDirection: "column",
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.12,
        padding: 0.02,
        borderRadius: 0,
        backgroundOpacity: 1,
        backgroundColor: new Color(0x292929),
        width: 3,
        height: 2,
    };
    sourcesSelectorContainer = new Block(
        this.sourcesSelectorContainerAttributes
    );
    sourcesObjectsToTest = [];
    sourceAttributes = {
        justifyContent: "center",
        contentDirection: "row",
        height: 0.2,
        offset: 0.05,
        margin: 0.02,
        width: 1,
        backgroundOpacity: 1,
    };
    buttonRefresh;
    buttonClose;
    btnAttrs = {
        justifyContent: "center",
        contentDirection: "row",
        height: 0.2,
        offset: 0.05,
        margin: 0.02,
        width: 1,
        backgroundOpacity: 1,
    };
    selectedAttributes = {
        offset: 0.02,
        backgroundColor: new Color(0x777777),
        backgroundOpacity: 1,
        fontColor: new Color(0x222222),
    };
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

    constructor(sources = []) {
        this.sources = sources;
        this.sourcesSelectorContainer.position.set(0, 1.3, -4.5);
        scene.add(this.sourcesSelectorContainer);
        registerPanel(
            this.sourcesSelectorContainer,
            "sourcesSelectorPanel",
            "sourcesSelectorContainer",
            "sourcesSelectorContainer"
        );
        registerObjectToDrag(
            this.sourcesSelectorContainer,
            "files",
            "fileBrowserPanel"
        );
        this.refreshSources(this.sources, false);
    }

    refreshFileBrowser(json, verifyVideoSRC) {
        fileBrowserPanel.rebuildFiles(json, verifyVideoSRC);
        fileBrowserPanel.regenerateFoldersButtons();
        fileBrowserPanel.regenerateFileBrowser();
        this.hideSourcesSelectorPanel();
        fileBrowserPanel.showFileMenuPanel();
    }

    refreshSources(deep_delete = true) {
        if (deep_delete) {
            deepDelete(this.sourcesSelectorContainer);
        }
        this.sourcesSelectorContainer.set(
            this.sourcesSelectorContainerAttributes
        );
        const sourcesSelectorInnerContainer = new Block(
            this.sourcesSelectorContainerAttributes
        );
        this.sourcesObjectsToTest = [];
        this.sourcesObjectsToTest.push(fileBrowserPanel.draggingBox);
        this.buttonClose = new Block(this.btnAttrs);

        // Button
        this.buttonClose.add(
            new Text({
                content: getWordFromLang("close"),
            })
        );
        this.buttonClose.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.hideSourcesSelectorPanel();
            },
        });
        this.buttonClose.setupState({
            state: "hovered",
            attributes: {
                offset: 0.035,
                backgroundColor: new Color(0xf44336),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });
        this.buttonClose.setupState({
            state: "idle",
            attributes: {
                offset: 0.035,
                backgroundColor: new Color(0xf88e86),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        this.buttonRefresh = new Block(this.btnAttrs);

        // Button
        this.buttonRefresh.add(
            new Text({
                content: getWordFromLang("refresh"),
            })
        );
        this.buttonRefresh.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.refreshSources();
            },
        });
        this.buttonRefresh.setupState({
            state: "hovered",
            attributes: {
                offset: 0.035,
                backgroundColor: new Color(0x008000),
                backgroundOpacity: 1,
                fontColor: new Color(0xffffff),
            },
        });
        this.buttonRefresh.setupState({
            state: "idle",
            attributes: {
                offset: 0.035,
                backgroundColor: new Color(0x98fb98),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        sourcesSelectorInnerContainer.add(this.buttonClose);
        sourcesSelectorInnerContainer.add(this.buttonRefresh);
        this.sourcesObjectsToTest.push(this.buttonClose, this.buttonRefresh);

        // Sources

        this.sources.forEach((entry) => {
            const sourceContainer = new Block(this.btnAttrs);

            sourceContainer.add(
                new Text({
                    content: entry.name,
                })
            );
            sourcesSelectorInnerContainer.add(sourceContainer);
            sourceContainer.setupState({
                state: "selected",
                onSet: () => {
                    this.selectSource(entry.data, entry.verifyVideoSRC);
                },
            });

            sourceContainer.setupState(this.hoveredState);
            sourceContainer.setupState(this.idleState);
            this.sourcesObjectsToTest.push(sourceContainer);
        });
        this.sourcesSelectorContainer.add(sourcesSelectorInnerContainer);
        registerNewObjectsToTest(this.sourcesObjectsToTest);
    }

    showSourcesSelectorPanel() {
        showMenu([this.sourcesSelectorContainer], this.sourcesObjectsToTest);
    }

    hideSourcesSelectorPanel() {
        hideMenu([this.sourcesSelectorContainer], []);
        registerNewObjectsToTest(fileBrowserPanel.fileBrowserObjectsToTest);
    }

    selectSource(data, verifyVideoSRC) {
        this.refreshFileBrowser(data, verifyVideoSRC);
    }

    selectFirstSourceIfOnlyOneAvailable() {
        if (this.sources.length === 1) {
            this.selectSource(
                this.sources[0].data,
                this.sources[0].verifyVideoSRC
            );
        }
    }
}
