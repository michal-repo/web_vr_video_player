import { Color } from "../node_modules/three/build/three.module.js";
import {
    Block,
    Text,
} from "../node_modules/three-mesh-ui/build/three-mesh-ui.module.js";

import deepDelete from "../node_modules/three-mesh-ui/src/utils/deepDelete.js";

import FontJSON from "../assets/fonts/Roboto-Regular-msdf.json";
import FontImage from "../assets/fonts/Roboto-Regular.png";

import { fileBrowserPanel, scene, Extensions } from "./index.js";
import { hideMenu, showMenu, registerNewObjectsToTest } from "./UI.js";

export default class SourcesSelectorPanel {
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
        this.sourcesSelectorContainer.position.set(0, 1.3, -4.5);
        scene.add(this.sourcesSelectorContainer);
        this.refreshSources(sources, false);
    }

    refreshFileBrowser(json, verifyVideoSRC) {
        fileBrowserPanel.rebuildFiles(json, verifyVideoSRC);
        fileBrowserPanel.regenerateFoldersButtons();
        fileBrowserPanel.regenerateFileBrowser();
        hideMenu([this.sourcesSelectorContainer], []);
        fileBrowserPanel.showFileMenuPanel();
    }

    refreshSources(sources = [], deep_delete = true) {
        if (deep_delete) {
            deepDelete(this.sourcesSelectorContainer);
        }
        this.sourcesSelectorContainer.set(
            this.sourcesSelectorContainerAttributes
        );
        const sourcesSelectorInnerContainer = new Block(this.sourcesSelectorContainerAttributes);
        this.sourcesObjectsToTest = [];
        this.buttonRefresh = new Block({
            justifyContent: "center",
            contentDirection: "row",
            height: 0.2,
            offset: 0.05,
            margin: 0.02,
            width: 1,
            backgroundOpacity: 1,
        });

        // Button
        this.buttonRefresh.add(
            new Text({
                content: "Refresh",
            })
        );
        this.buttonRefresh.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.refreshSources(Extensions.registered);
            },
        });
        this.buttonRefresh.setupState(this.hoveredState);
        this.buttonRefresh.setupState(this.idleState);

        sourcesSelectorInnerContainer.add(this.buttonRefresh);
        this.sourcesObjectsToTest.push(this.buttonRefresh);

        // Sources

        sources.forEach((entry) => {
            const sourceContainer = new Block({
                justifyContent: "center",
                contentDirection: "row",
                height: 0.2,
                offset: 0.05,
                margin: 0.02,
                width: 1,
                backgroundOpacity: 1,
            });

            sourceContainer.add(
                new Text({
                    content: entry.name,
                })
            );
            sourcesSelectorInnerContainer.add(sourceContainer);
            sourceContainer.setupState({
                state: "selected",
                onSet: () => {
                    this.refreshFileBrowser(entry.data, entry.verifyVideoSRC);
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
}
