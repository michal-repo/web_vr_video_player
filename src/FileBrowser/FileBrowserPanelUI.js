import {
    Color,
    TextureLoader,
    RingGeometry,
    MeshBasicMaterial,
    DoubleSide,
    Mesh,
    CircleGeometry,
} from "../../node_modules/three/build/three.module.js";
import {
    Block,
    Text,
    InlineBlock,
    Keyboard,
} from "../../node_modules/three-mesh-ui/build/three-mesh-ui.module.js";

import ThumbnailBlock from "./ThumbnailBlock.js";

import Backspace from "../../node_modules/three-mesh-ui/examples/assets/backspace.png";
import Enter from "../../node_modules/three-mesh-ui/examples/assets/enter.png";
import Shift from "../../node_modules/three-mesh-ui/examples/assets/shift.png";

import deepDelete from "../../node_modules/three-mesh-ui/src/utils/deepDelete.js";

import FontJSON from "../../assets/fonts/Roboto-Regular-msdf.json";
import FontImage from "../../assets/fonts/Roboto-Regular.png";

import * as MAIN from "../index.js";

import * as UI from "../UI.js";

import * as Helpers from "../Helpers.js";

import * as ScreenManager from "../ScreenManager/ScreenManager.js";

// Import Icons
import LeftIcon from "../../assets/icons/left-arrow.png";
import RightIcon from "../../assets/icons/right-arrow.png";
import VideoIcon from "../../assets/icons/video.png";

export class FileBrowserPanel {
    fileBrowserContainer;
    foldersContainer;
    folderIndex = 1;
    folderPageIndex = 0;
    currentFolderPageIndex = 0;
    MAXFOLDERSPERPAGE = 12;
    thumbsContainer;
    draggingBox;

    shouldVerifyVideoSRC;

    defaultVideoThumbnail;
    listOfVideoThumbnailTextures = [];

    searchContainer;
    searchText;
    clearSearch;
    keyboard;
    defaultSearchText = Helpers.getWordFromLang("search_in_folders");

    sortContainer;
    sortActiveColor = new Color(0xf9dc77);
    sortInactiveColor = new Color(0xc5d564);
    sourcesBtn;
    sortByName;
    sortByNameColorRef = this.sortActiveColor;
    sortByDate;
    sortByDateColorRef = this.sortInactiveColor;
    activeSorting = "name";
    sortDirectionBlock;
    sortDirection = "ASC";

    buttonLeft;
    buttonRight;

    loadingAnimatedObj;
    loadingAnimatedObjBackground;

    fileBrowserObjectsToTest = [];
    foldersButtons = [];
    keyboardObjsToTest = [];
    defaultObjsToTest = [];

    VIDEOS = [];
    FILES = [];
    FOLDER;
    ACTIVEFOLDER;

    FILES_PER_ROW = 4;
    FILES_ROWS = 3;

    CURRENT_PAGE = 0;
    TOTAL_PAGES;

    viewGeneratorThumbs = [];
    viewGeneratorThumbsIterator = 0;
    viewGeneratorInProgress = false;
    viewGeneratorFinished = true;

    loader = new TextureLoader();

    PANELMAXWIDTH = 4.5;
    PANELMAXHEIGHT = 3.2;
    CENTERPANELZDISTANCE = -5.2;
    SIDEPANELZDISTANCE = -5;
    KEYBOARDZDISTANCE = -5;

    BUTTONWIDTHHEIGHT = this.PANELMAXHEIGHT / this.FILES_ROWS - 0.5;

    THUMBTEXTUREHEIGHT =
        this.PANELMAXHEIGHT / this.FILES_ROWS -
        (this.PANELMAXHEIGHT / this.FILES_ROWS) * 0.25;
    THUMBTEXTUREWIDTH =
        (this.PANELMAXWIDTH - this.PANELMAXWIDTH / 16) / this.FILES_PER_ROW -
        0.05;

    thumbRowContainerAttributes = {
        width: this.PANELMAXWIDTH,
        height: this.PANELMAXHEIGHT / this.FILES_ROWS,
        contentDirection: "row",
        justifyContent: "center",
        offset: 0.05,
        margin: 0.02,
        hiddenOverflow: true,
        backgroundOpacity: 1,
        borderRadius: 0.08,
    };

    thumbsContainerAttributes = {
        justifyContent: "center",
        contentDirection: "column",
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0,
        borderRadius: 0,
        backgroundOpacity: 0,
        hiddenOverflow: true,
        width: this.PANELMAXWIDTH,
        height: this.PANELMAXHEIGHT,
    };

    thumbButtonContainerAttributes = {
        height: this.PANELMAXHEIGHT / this.FILES_ROWS,
        width:
            (this.PANELMAXWIDTH - this.PANELMAXWIDTH / 16) / this.FILES_PER_ROW,
        justifyContent: "start",
        contentDirection: "column",
        padding: 0,
        hiddenOverflow: true,
        borderRadius: 0,
    };

    textureAttributes(texture) {
        return {
            height: this.THUMBTEXTUREHEIGHT,
            width: this.THUMBTEXTUREWIDTH,
            backgroundTexture: texture,
            borderRadius: 0,
        };
    }

    thumbTextContainerAttributes = {
        height:
            this.PANELMAXHEIGHT / this.FILES_ROWS -
            this.THUMBTEXTUREHEIGHT -
            0.025,
        width: this.THUMBTEXTUREWIDTH,
        backgroundOpacity: 0,
        bestFit: "shrink",
    };

    thumbTextAttributes(name) {
        return {
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: this.PANELMAXHEIGHT * 0.029,
            content: name,
        };
    }

    bigButtonAttributes = {
        height: this.BUTTONWIDTHHEIGHT,
        width: this.BUTTONWIDTHHEIGHT,
        justifyContent: "center",
        offset: 0.05,
        margin: 0.02,
        backgroundColor: new Color(0x999999),
        backgroundOpacity: 1,
        borderRadius: 0.075,
    };

    bigButtonAttributesTextureAttributes(texture) {
        return {
            height: this.BUTTONWIDTHHEIGHT,
            width: this.BUTTONWIDTHHEIGHT,
            backgroundTexture: texture,
            borderRadius: 0,
        };
    }

    buttonOptions = {
        width: 0.15,
        height: 0.15,
        backgroundColor: new Color(0x999999),
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
        backgroundColor: new Color(0x4f4f4f),
        backgroundOpacity: 1,
        fontColor: new Color(0xffffff),
    };

    idleState = {
        state: "idle",
        attributes: this.idleStateAttributes,
    };

    folderActiveIdleStateAttributes = {
        offset: 0.035,
        backgroundColor: new Color(0x008e7f),
        backgroundOpacity: 1,
        fontColor: new Color(0xffffff),
    };

    folderActiveIdleState = {
        state: "idle",
        attributes: this.folderActiveIdleStateAttributes,
    };

    selectedAttributes = {
        offset: 0.02,
        backgroundColor: new Color(0x777777),
        backgroundOpacity: 1,
        fontColor: new Color(0x222222),
    };

    foldersContainerAttributes = {
        justifyContent: "start",
        contentDirection: "column",
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.12,
        padding: 0.02,
        borderRadius: 0,
        backgroundOpacity: 1,
        backgroundColor: new Color(0x292929),
        width: this.PANELMAXWIDTH / 3,
        height: this.PANELMAXHEIGHT,
    };

    //////////////////////////////////////////////////////////////////////////////
    // CONSTRUCT
    //////////////////////////////////////////////////////////////////////////////

    constructor(files, shouldVerifyVideoSRC = false) {
        this.defaultVideoThumbnail = this.loader.load(VideoIcon);
        this.rebuildFiles(files, shouldVerifyVideoSRC);

        const circle = new CircleGeometry(2, 32);
        const loadingAnimatedObjBackgroundMaterial = new MeshBasicMaterial({
            color: 0x000000,
        });
        this.loadingAnimatedObjBackground = new Mesh(
            circle,
            loadingAnimatedObjBackgroundMaterial
        );
        MAIN.scene.add(this.loadingAnimatedObjBackground);
        this.loadingAnimatedObjBackground.position.set(
            0,
            1.4,
            this.CENTERPANELZDISTANCE + 0.18
        );
        this.loadingAnimatedObjBackground.scale.set(0.1, 0.1, 0.1);
        this.loadingAnimatedObjBackground.visible = false;

        const ring = new RingGeometry(
            1,
            1.5,
            32,
            1,
            Math.PI * 0.5,
            Math.PI * 1.5
        );
        const loadingAnimatedObjMaterial = new MeshBasicMaterial({
            color: 0xffff00,
            side: DoubleSide,
        });
        this.loadingAnimatedObj = new Mesh(ring, loadingAnimatedObjMaterial);
        MAIN.scene.add(this.loadingAnimatedObj);
        this.loadingAnimatedObj.position.set(
            0,
            1.4,
            this.CENTERPANELZDISTANCE + 0.2
        );
        this.loadingAnimatedObj.scale.set(0.1, 0.1, 0.1);
        this.loadingAnimatedObj.visible = false;

        // Buttons

        // Left
        this.buttonLeft = new Block(this.bigButtonAttributes);

        this.loader.load(LeftIcon, (texture) => {
            this.buttonLeft.add(
                new InlineBlock(
                    this.bigButtonAttributesTextureAttributes(texture)
                )
            );
        });

        this.buttonLeft.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.PreviousPage();
            },
        });
        this.buttonLeft.setupState(this.hoveredState);
        this.buttonLeft.setupState(this.idleState);

        // Right
        this.buttonRight = new Block(this.bigButtonAttributes);

        this.loader.load(RightIcon, (texture) => {
            this.buttonRight.add(
                new InlineBlock(
                    this.bigButtonAttributesTextureAttributes(texture)
                )
            );
        });

        this.buttonRight.setupState({
            state: "selected",
            attributes: this.selectedAttributes,
            onSet: () => {
                this.NextPage();
            },
        });
        this.buttonRight.setupState(this.hoveredState);
        this.buttonRight.setupState(this.idleState);

        //////////////////////////////////////////////////

        this.fileBrowserContainer = new Block({
            justifyContent: "center",
            contentDirection: "row",
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0,
            backgroundOpacity: 1,
            backgroundColor: new Color(0x292929),
            width: this.PANELMAXWIDTH + 0.3 + this.BUTTONWIDTHHEIGHT * 2,
            height: this.PANELMAXHEIGHT,
        });

        MAIN.scene.add(this.fileBrowserContainer);

        this.thumbsContainer = new Block(this.thumbsContainerAttributes);

        this.foldersContainer = new Block(this.foldersContainerAttributes);
        if (this.VIDEOS.length > 0) {
            this.generateFoldersButtons();
        }
        MAIN.scene.add(this.foldersContainer);
        this.foldersContainer.position.set(-3.8, 1.4, this.SIDEPANELZDISTANCE);
        this.foldersContainer.rotation.y = 0.5;

        //////////////////////////////////////////////////////////////////////
        // Search

        this.searchContainer = new Block({
            justifyContent: "end",
            contentDirection: "row",
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0x292929),
            width: 2,
            height: 0.2,
            hiddenOverflow: true,
        });

        const textContainer = new Block({
            justifyContent: "start",
            contentDirection: "row",
            width: 1.9,
            height: 0.15,
            padding: 0.02,
            backgroundOpacity: 0,
            alignItems: "start",
            textAlign: "left",
        });

        this.searchText = new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: this.defaultSearchText,
        });

        textContainer.add(this.searchText);

        this.searchContainer.add(textContainer);

        MAIN.scene.add(this.searchContainer);
        this.searchContainer.position.set(-2, 3.2, this.CENTERPANELZDISTANCE);

        this.searchContainer.setupState({
            state: "selected",
            onSet: () => {
                if (!this.keyboard.visible) {
                    if (this.searchText.content === this.defaultSearchText) {
                        this.searchText.set({ content: "" });
                    }
                    this.keyboard.visible = true;
                    let objectsToTest = this.keyboardObjsToTest.slice();
                    objectsToTest.push(this.searchContainer);
                    objectsToTest.push(this.draggingBox);
                    objectsToTest.push(this.clearSearch);
                    UI.registerNewObjectsToTest(objectsToTest);
                } else {
                    if (this.searchText.content === "") {
                        this.searchText.set({
                            content: this.defaultSearchText,
                        });
                        this.CURRENT_PAGE = 0;
                        this.FILES = this.VIDEOS[this.FOLDER].list;
                        this.sortFiles(
                            this.activeSorting,
                            this.sortDirection.sortDirection
                        );
                    } else {
                        this.prepareFilesWithSearchPhrase();
                    }
                    this.keyboard.visible = false;
                    UI.registerNewObjectsToTest(this.fileBrowserObjectsToTest);
                    this.regenerateFileBrowser();
                }
            },
        });

        this.searchContainer.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xffff00),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });
        this.searchContainer.setupState({
            state: "idle",
            attributes: {
                backgroundColor: new Color(0x5c5c5c),
                backgroundOpacity: 1,
                fontColor: new Color(0xffffff),
            },
        });

        ///////////////////////////

        this.clearSearch = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xf88e86),
            width: 0.7,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000),
        });
        this.clearSearch.add(
            new Text({
                fontFamily: FontJSON,
                fontTexture: FontImage,
                fontSize: 0.12,
                content: Helpers.getWordFromLang("clear"),
            })
        );

        this.clearSearch.setupState({
            state: "selected",
            onSet: () => {
                if (
                    !this.keyboard.visible &&
                    this.searchText.content !== this.defaultSearchText
                ) {
                    this.searchText.set({ content: this.defaultSearchText });
                    this.CURRENT_PAGE = 0;
                    this.FILES = this.VIDEOS[this.FOLDER].list;
                    this.TOTAL_PAGES =
                        Math.ceil(
                            this.FILES.length /
                                (this.FILES_PER_ROW * this.FILES_ROWS)
                        ) - 1;
                    this.sortFiles(
                        this.activeSorting,
                        this.sortDirection.sortDirection
                    );
                    this.regenerateFileBrowser();
                } else if (this.keyboard.visible) {
                    this.searchText.set({ content: "" });
                }
            },
        });

        this.clearSearch.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xf44336),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });
        this.clearSearch.setupState({
            state: "idle",
            attributes: {
                backgroundColor: new Color(0xf88e86),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        this.clearSearch.position.set(-0.5, 3.2, this.CENTERPANELZDISTANCE);
        MAIN.scene.add(this.clearSearch);

        //////////////////////////////////////////////////////////////////////

        this.sortDirectionBlock = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            margin: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xc5d564),
            width: 0.4,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000),
        });

        this.sortDirection = new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: Helpers.getWordFromLang("ascending"),
            sortDirection: "asc",
        });

        this.sortDirectionBlock.add(this.sortDirection);

        this.sortDirectionBlock.setupState({
            state: "selected",
            onSet: () => {
                switch (this.sortDirection.sortDirection) {
                    case "desc":
                        this.sortDirection.set({
                            content: Helpers.getWordFromLang("ascending"),
                        });
                        this.sortDirection.sortDirection = "asc";
                        break;
                    default:
                    case "asc":
                        this.sortDirection.set({
                            content: Helpers.getWordFromLang("descending"),
                        });
                        this.sortDirection.sortDirection = "desc";
                        break;
                }
                this.sortFiles(
                    this.activeSorting,
                    this.sortDirection.sortDirection
                );
                this.regenerateFileBrowser();
            },
        });

        this.sortDirectionBlock.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xdcf63f),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });
        this.sortDirectionBlock.setupState({
            state: "idle",
            attributes: {
                backgroundColor: new Color(0xc5d564),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        ////////////

        this.sourcesBtn = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            margin: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xc5d564),
            width: 0.5,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000),
        });
        this.sourcesBtn.add(
            new Text({
                fontFamily: FontJSON,
                fontTexture: FontImage,
                fontSize: 0.12,
                content: Helpers.getWordFromLang("sources"),
            })
        );

        this.sourcesBtn.setupState({
            state: "selected",
            onSet: () => {
                MAIN.sourcesSelectorPanel.showSourcesSelectorPanel();
            },
        });

        this.sourcesBtn.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xdcf63f),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        this.sourcesBtn.setupState({
            state: "idle",
            attributes: {
                backgroundColor: new Color(0xc5d564),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        ///////////////
        this.sortByName = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            margin: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xc5d564),
            width: 0.4,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000),
        });
        this.sortByName.add(
            new Text({
                fontFamily: FontJSON,
                fontTexture: FontImage,
                fontSize: 0.12,
                content: Helpers.getWordFromLang("name"),
            })
        );

        this.sortByName.setupState({
            state: "selected",
            onSet: () => {
                if (this.activeSorting !== "name") {
                    this.sortByNameColorRef = this.sortActiveColor;
                    this.sortByDateColorRef = this.sortInactiveColor;
                    this.sortSetButtonsIdleState();
                    this.activeSorting = "name";
                    this.sortFiles(
                        this.activeSorting,
                        this.sortDirection.sortDirection
                    );
                    this.regenerateFileBrowser();
                }
            },
        });

        this.sortByName.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xdcf63f),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        ///////////////

        this.sortByDate = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            margin: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xc5d564),
            width: 0.4,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000),
        });
        this.sortByDate.add(
            new Text({
                fontFamily: FontJSON,
                fontTexture: FontImage,
                fontSize: 0.12,
                content: Helpers.getWordFromLang("date"),
            })
        );

        this.sortByDate.setupState({
            state: "selected",
            onSet: () => {
                if (this.activeSorting !== "date") {
                    this.sortByDateColorRef = this.sortActiveColor;
                    this.sortByNameColorRef = this.sortInactiveColor;
                    this.sortSetButtonsIdleState();
                    this.activeSorting = "date";
                    this.sortFiles(
                        this.activeSorting,
                        this.sortDirection.sortDirection
                    );
                    this.regenerateFileBrowser();
                }
            },
        });

        this.sortByDate.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xdcf63f),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        ///////////////

        this.sortSetButtonsIdleState();

        ///////////////

        this.sortContainer = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            width: 2.7,
            height: 0.3,
            hiddenOverflow: true,
            fontColor: new Color(0x000000),
        });
        let label = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            width: 0.7,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0xffffff),
        });
        label.add(
            new Text({
                fontFamily: FontJSON,
                fontTexture: FontImage,
                fontSize: 0.12,
                content: Helpers.getWordFromLang("sorting") + ":",
            })
        );
        this.sortContainer.add(this.sourcesBtn);
        this.sortContainer.add(label);
        this.sortContainer.add(this.sortByName);
        this.sortContainer.add(this.sortByDate);
        this.sortContainer.add(this.sortDirectionBlock);
        this.sortContainer.position.set(1.52, 3.2, this.CENTERPANELZDISTANCE);
        MAIN.scene.add(this.sortContainer);

        //////////////////////////////////////////////////////////////////////

        ///////////////////////////
        // Add to main container

        this.fileBrowserContainer.add(this.buttonLeft);

        this.fileBrowserContainer.add(this.thumbsContainer);

        this.fileBrowserContainer.add(this.buttonRight);

        this.defaultObjsToTest.push(this.buttonLeft, this.buttonRight);

        this.fileBrowserContainer.position.set(
            0,
            1.4,
            this.CENTERPANELZDISTANCE
        );

        this.draggingBox = new Block({
            justifyContent: "center",
            contentDirection: "row",
            padding: 0.02,
            borderRadius: 0.06,
            backgroundOpacity: 1,
            backgroundColor: new Color(0x5c5c5c),
            width: this.PANELMAXWIDTH / 3,
            height: 0.1,
        });

        MAIN.scene.add(this.draggingBox);
        this.draggingBox.position.set(0, -0.35, this.CENTERPANELZDISTANCE);
        this.draggingBox.setupState({
            state: "selected",
            onSet: () => {
                ScreenManager.startDrag("files");
            },
        });

        this.draggingBox.setupState({
            state: "hovered",
            attributes: {
                backgroundColor: new Color(0xffff00),
                backgroundOpacity: 1,
            },
            onSet: () => {
                ScreenManager.stopDrag("files");
            },
        });
        this.draggingBox.setupState({
            state: "idle",
            attributes: {
                backgroundColor: new Color(0x5c5c5c),
                backgroundOpacity: 1,
            },
            onSet: () => {
                ScreenManager.stopDrag("files");
            },
        });
        this.defaultObjsToTest.push(this.draggingBox);

        this.defaultObjsToTest.push(this.searchContainer);
        this.defaultObjsToTest.push(this.clearSearch);
        this.defaultObjsToTest.push(this.sortByDate);
        this.defaultObjsToTest.push(this.sortByName);
        this.defaultObjsToTest.push(this.sortDirectionBlock);
        this.defaultObjsToTest.push(this.sourcesBtn);

        // Finally add defaultObjsToTest to main array used for testing.
        this.resetFileBrowserObjectsToTest();
        //////////////////////////////////////////////////////////////////////

        this.keyboardObjsToTest = this.makeKeyboard(
            this.searchText,
            this.searchTextSetContent
        );

        this.keyboard.visible = false;
        this.keyboard.position.set(0, 2, this.KEYBOARDZDISTANCE);
        MAIN.scene.add(this.keyboard);

        //////////////////////////////////////////////////////////////////////

        ScreenManager.registerPanel(
            this.draggingBox,
            "fileBrowserPanel",
            "draggingBox",
            "draggingBox"
        );
        ScreenManager.registerPanel(
            this.searchContainer,
            "fileBrowserPanel",
            "searchContainer",
            "searchContainer"
        );
        ScreenManager.registerPanel(
            this.clearSearch,
            "fileBrowserPanel",
            "clearSearch",
            "clearSearch"
        );
        ScreenManager.registerPanel(
            this.keyboard,
            "fileBrowserPanel",
            "keyboard",
            "keyboard"
        );
        ScreenManager.registerPanel(
            this.foldersContainer,
            "fileBrowserPanel",
            "foldersContainer",
            "foldersContainer"
        );
        ScreenManager.registerPanel(
            this.fileBrowserContainer,
            "fileBrowserPanel",
            "fileBrowserContainer",
            "fileBrowserContainer"
        );
        ScreenManager.registerPanel(
            this.sortContainer,
            "fileBrowserPanel",
            "sortContainer",
            "sortContainer"
        );
        ScreenManager.registerPanel(
            this.loadingAnimatedObj,
            "fileBrowserPanel",
            "loadingAnimatedObj",
            "loadingAnimatedObj"
        );
        ScreenManager.registerPanel(
            this.loadingAnimatedObjBackground,
            "fileBrowserPanel",
            "loadingAnimatedObjBackground",
            "loadingAnimatedObjBackground"
        );

        ScreenManager.registerObjectToDrag(
            this.draggingBox,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.searchContainer,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.clearSearch,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.keyboard,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.foldersContainer,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.fileBrowserContainer,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.sortContainer,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.loadingAnimatedObj,
            "files",
            "fileBrowserPanel"
        );
        ScreenManager.registerObjectToDrag(
            this.loadingAnimatedObjBackground,
            "files",
            "fileBrowserPanel"
        );

        if (this.FILES.length > 0 && this.defaultVideoThumbnail !== undefined) {
            this.generateView();
        }
    }

    prepareFilesWithSearchPhrase() {
        let filesList = [];
        this.FILES = this.VIDEOS[this.FOLDER].list;
        this.FILES.forEach((file) => {
            if (
                file.name
                    .replace(
                        /[^ qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890,\.\/\?;:\'"\[\{\}\]=\+-_!@#\$%\^\&\*\(\)\\\|\`\~]+/,
                        ""
                    )
                    .toLowerCase()
                    .includes(this.searchText.content.toLowerCase())
            ) {
                filesList.push(file);
            }
        });
        this.FILES = filesList;
        this.TOTAL_PAGES =
            Math.ceil(
                this.FILES.length / (this.FILES_PER_ROW * this.FILES_ROWS)
            ) - 1;
        this.sortFiles(this.activeSorting, this.sortDirection.sortDirection);
    }

    generateView() {
        let endOfFiles = false;
        this.viewGeneratorThumbs = [];
        this.listOfVideoThumbnailTextures = [];
        this.viewGeneratorThumbsIterator = 0;
        let iterate =
            this.CURRENT_PAGE > 0
                ? this.FILES_PER_ROW * this.FILES_ROWS * this.CURRENT_PAGE
                : 0;
        for (let index = 0; index < this.FILES_ROWS; index++) {
            const thumbsContainerButtonsRow = new Block(
                this.thumbRowContainerAttributes
            );
            let addedThumbs = 0;
            for (let index = 0; index < this.FILES_PER_ROW; index++) {
                if (!this.FILES[iterate]) {
                    endOfFiles = true;
                    break;
                }

                const thumb = new ThumbnailBlock(
                    this.thumbButtonContainerAttributes,
                    this.FILES[iterate].src,
                    this.FILES[iterate].name.replace(
                        /[^ qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890,\.\/\?;:\'"\[\{\}\]=\+-_!@#\$%\^\&\*\(\)\\\|\`\~]+/,
                        ""
                    ),
                    this.FILES[iterate].thumbnail,
                    this.FILES[iterate].screen_type,
                    this.FILES[iterate].frame_height
                        ? this.FILES[iterate].frame_height
                        : "1",
                    this.FILES[iterate].frame_width
                        ? this.FILES[iterate].frame_width
                        : "1",
                    this.selectedAttributes,
                    this.hoveredStateAttributes,
                    this.idleStateAttributes,
                    this.shouldVerifyVideoSRC
                );

                thumbsContainerButtonsRow.add(thumb);
                this.fileBrowserObjectsToTest.push(thumb);
                this.viewGeneratorThumbs.push(thumb);
                iterate++;
                addedThumbs++;
            }
            if (addedThumbs > 0) {
                this.thumbsContainer.add(thumbsContainerButtonsRow);
            }
            if (endOfFiles) {
                break;
            }
        }
        this.viewGeneratorFinished = false;
    }

    generateThumbnails() {
        if (this.viewGeneratorInProgress === false) {
            if (
                this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator] &&
                this.viewGeneratorFinished === false
            ) {
                this.viewGeneratorInProgress = true;
                let thumb =
                    this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator]
                        .fileThumbnail;
                this.loader
                    .loadAsync(thumb, undefined)
                    .then((image) => {
                        if (
                            thumb ===
                            this.viewGeneratorThumbs[
                                this.viewGeneratorThumbsIterator
                            ].fileThumbnail
                        ) {
                            let inlineBlock = new InlineBlock(
                                this.textureAttributes(image)
                            );
                            this.listOfVideoThumbnailTextures.push(
                                inlineBlock.getBackgroundTexture()
                            );
                            this.viewGeneratorThumbs[
                                this.viewGeneratorThumbsIterator
                            ].add(
                                inlineBlock,
                                new Block(
                                    this.thumbTextContainerAttributes
                                ).add(
                                    new Text(
                                        this.thumbTextAttributes(
                                            this.viewGeneratorThumbs[
                                                this.viewGeneratorThumbsIterator
                                            ].fileNameButton
                                        )
                                    )
                                )
                            );
                            this.viewGeneratorThumbsIterator++;
                        }
                        this.viewGeneratorInProgress = false;
                    })
                    .catch(() => {
                        this.viewGeneratorThumbs[
                            this.viewGeneratorThumbsIterator
                        ].add(
                            new InlineBlock(
                                this.textureAttributes(
                                    this.defaultVideoThumbnail
                                )
                            ),
                            new Block(this.thumbTextContainerAttributes).add(
                                new Text(
                                    this.thumbTextAttributes(
                                        this.viewGeneratorThumbs[
                                            this.viewGeneratorThumbsIterator
                                        ].fileNameButton
                                    )
                                )
                            )
                        );
                        this.viewGeneratorThumbsIterator++;
                        this.viewGeneratorInProgress = false;
                    });
            } else {
                this.viewGeneratorFinished = true;
            }
        }
    }

    sortFiles(by, order) {
        switch (by) {
            case "date":
                switch (order) {
                    case "desc":
                        this.FILES.sort((a, b) => b.epoch - a.epoch);
                        break;

                    default:
                    case "asc":
                        this.FILES.sort((a, b) => a.epoch - b.epoch);
                        break;
                }
                break;
            default:
            case "name":
                switch (order) {
                    case "desc":
                        this.FILES.sort((a, b) => {
                            const nameA = a.name.toUpperCase();
                            const nameB = b.name.toUpperCase();
                            if (nameA < nameB) {
                                return 1;
                            }
                            if (nameA > nameB) {
                                return -1;
                            }
                        });
                        break;

                    default:
                    case "asc":
                        this.FILES.sort((a, b) => {
                            const nameA = a.name.toUpperCase();
                            const nameB = b.name.toUpperCase();
                            if (nameA < nameB) {
                                return -1;
                            }
                            if (nameA > nameB) {
                                return 1;
                            }
                        });
                        break;
                }
                break;
        }
    }

    regenerateFileBrowser() {
        this.viewGeneratorFinished = true;
        deepDelete(this.thumbsContainer);
        this.listOfVideoThumbnailTextures.forEach((texture) => {
            texture.dispose();
        });
        this.thumbsContainer.set(this.thumbsContainerAttributes);
        this.resetFileBrowserObjectsToTest();

        this.generateView();

        UI.registerNewObjectsToTest(this.fileBrowserObjectsToTest);
    }

    resetFileBrowserObjectsToTest() {
        this.fileBrowserObjectsToTest = [];
        this.fileBrowserObjectsToTest = this.defaultObjsToTest.slice();
        this.fileBrowserObjectsToTest = this.fileBrowserObjectsToTest.concat(
            this.foldersButtons.slice()
        );
    }

    PreviousPage() {
        if (this.CURRENT_PAGE > 0) {
            this.CURRENT_PAGE--;
            this.regenerateFileBrowser();
        }
    }

    NextPage() {
        if (this.CURRENT_PAGE < this.TOTAL_PAGES) {
            this.CURRENT_PAGE++;
            this.regenerateFileBrowser();
        }
    }

    generateFoldersButtons() {
        let folderIndex = this.folderPageIndex;
        // for (let index = 0; index < this.VIDEOS.length; index++) {
        let index = 0;
        while (index < this.MAXFOLDERSPERPAGE) {
            if (folderIndex !== 0 && index === 0) {
                const folderButton = this.createFolderButton(
                    index++,
                    0,
                    true,
                    Helpers.getWordFromLang("previous_page"),
                    "prev"
                );
                this.foldersContainer.add(folderButton);
                this.foldersButtons.push(folderButton);
            }
            const folderButton = this.createFolderButton(
                index++,
                folderIndex++
            );
            this.foldersContainer.add(folderButton);
            this.foldersButtons.push(folderButton);
            if (folderIndex >= this.VIDEOS.length) {
                break;
            }
        }
        if (folderIndex < this.VIDEOS.length) {
            const folderButton = this.createFolderButton(
                index,
                folderIndex,
                true,
                Helpers.getWordFromLang("next_page"),
                "next"
            );
            this.foldersContainer.add(folderButton);
            this.foldersButtons.push(folderButton);
        }
        this.foldersButtonsIdleState();
    }

    createFolderButton(
        id,
        index,
        isPageSwitcher = false,
        pageText = "",
        pageDirection = ""
    ) {
        const folderButton = new Block({
            justifyContent: "center",
            contentDirection: "row",
            height: 0.2,
            offset: 0.05,
            margin: 0.02,
            bestFit: "shrink",
            width: this.PANELMAXWIDTH / 3 - 0.1,
            backgroundOpacity: 1,
        }).add(
            new Text({
                content: isPageSwitcher ? pageText : this.VIDEOS[index].name,
            })
        );
        folderButton.folderId = id;
        folderButton.folderIndex = index;
        if (isPageSwitcher) {
            folderButton.setupState({
                state: "selected",
                attributes: this.selectedAttributes,
                onSet: () => {
                    switch (pageDirection) {
                        case "prev":
                            this.folderPageIndex =
                                this.folderPageIndex - this.MAXFOLDERSPERPAGE;
                            break;

                        default:
                        case "next":
                            this.folderPageIndex =
                                this.folderPageIndex + this.MAXFOLDERSPERPAGE;
                            break;
                    }
                    this.regenerateFoldersButtons();
                },
            });
        } else {
            folderButton.setupState({
                state: "selected",
                attributes: this.selectedAttributes,
                onSet: () => {
                    if (
                        this.ACTIVEFOLDER !== id ||
                        this.currentFolderPageIndex !== this.folderPageIndex
                    ) {
                        this.CURRENT_PAGE = 0;
                        this.FOLDER = index;
                        this.ACTIVEFOLDER = id;
                        this.currentFolderPageIndex = this.folderPageIndex;
                        if (
                            this.searchText.content !== this.defaultSearchText
                        ) {
                            this.prepareFilesWithSearchPhrase();
                        } else {
                            this.FILES = this.VIDEOS[index].list;
                            this.TOTAL_PAGES =
                                Math.ceil(
                                    this.FILES.length /
                                        (this.FILES_PER_ROW * this.FILES_ROWS)
                                ) - 1;
                            this.sortFiles(
                                this.activeSorting,
                                this.sortDirection.sortDirection
                            );
                        }
                        this.foldersButtonsIdleState();
                        this.regenerateFileBrowser();
                    }
                },
            });
        }
        folderButton.setupState(this.hoveredState);
        return folderButton;
    }

    regenerateFoldersButtons() {
        deepDelete(this.foldersContainer);
        this.foldersContainer.set(this.foldersContainerAttributes);
        this.foldersButtons = [];
        this.generateFoldersButtons();

        this.resetFileBrowserObjectsToTest();

        UI.registerNewObjectsToTest(this.fileBrowserObjectsToTest);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Hide / Show Menu

    showFileMenuPanel() {
        UI.showMenu(
            [
                this.fileBrowserContainer,
                this.foldersContainer,
                this.draggingBox,
                this.searchContainer,
                this.clearSearch,
                this.sortContainer,
            ],
            this.fileBrowserObjectsToTest,
            true
        );
        Helpers.removeVideoSrc();
        MAIN.playbackChange(false);
    }

    hideFileMenuPanel(screen_type = null) {
        UI.hideMenu(
            [
                this.fileBrowserContainer,
                this.foldersContainer,
                this.draggingBox,
                this.searchContainer,
                this.clearSearch,
                this.keyboard,
                this.sortContainer,
            ],
            [],
            true
        );
        MAIN.playbackChange(true, screen_type);
    }

    searchTextSetContent(target, newContent) {
        let width = 0;
        if (target.inlines !== null && target.inlines !== undefined) {
            target.inlines.forEach((line) => {
                width += line.width;
            });
            if (width >= 1.7) {
                target.parent.set({ width: width + 0.2 });
            } else {
                target.parent.set({ width: 1.9 });
            }
        }
        target.set({ content: newContent });
    }

    makeKeyboard(target, targetSetContentFoo, language = "eng") {
        const keyboardColors = {
            keyboardBack: 0x858585,
            panelBack: 0x262626,
            button: 0x363636,
            hovered: 0x1c1c1c,
            selected: 0x109c5d,
        };

        let keyObjsToTest = [];

        this.keyboard = new Keyboard({
            language: language,
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            width: 4,
            height: 1.6,
            backgroundColor: new Color(keyboardColors.keyboardBack),
            backgroundOpacity: 1,
            backspaceTexture: Backspace,
            shiftTexture: Shift,
            enterTexture: Enter,
        });

        // this.keyboard.position.set(0, 0, -1);
        // keyboard.rotation.x = -0.55;

        //

        this.keyboard.keys.forEach((key) => {
            keyObjsToTest.push(key);

            key.setupState({
                state: "idle",
                attributes: {
                    offset: 0,
                    backgroundColor: new Color(keyboardColors.button),
                    backgroundOpacity: 1,
                },
            });

            key.setupState({
                state: "hovered",
                attributes: {
                    offset: 0,
                    backgroundColor: new Color(keyboardColors.hovered),
                    backgroundOpacity: 1,
                },
            });

            key.setupState({
                state: "selected",
                attributes: {
                    offset: -0.009,
                    backgroundColor: new Color(keyboardColors.selected),
                    backgroundOpacity: 1,
                },
                // triggered when the user clicked on a keyboard's key
                onSet: () => {
                    // if the key have a command (eg: 'backspace', 'switch', 'enter'...)
                    // special actions are taken
                    if (key.info.command) {
                        switch (key.info.command) {
                            // switch between panels
                            case "switch":
                                this.keyboard.setNextPanel();
                                break;

                            // switch between panel charsets (eg: russian/english)
                            case "switch-set":
                                this.keyboard.setNextCharset();
                                break;

                            case "enter":
                                this.keyboard.visible = false;
                                this.CURRENT_PAGE = 0;
                                if (target.content === "") {
                                    target.set({
                                        content: this.defaultSearchText,
                                    });
                                    this.FILES = this.VIDEOS[this.FOLDER].list;
                                    this.sortFiles(
                                        this.activeSorting,
                                        this.sortDirection.sortDirection
                                    );
                                } else {
                                    this.prepareFilesWithSearchPhrase();
                                }
                                UI.registerNewObjectsToTest(
                                    this.fileBrowserObjectsToTest
                                );
                                this.regenerateFileBrowser();
                                break;

                            case "space":
                                targetSetContentFoo(
                                    target,
                                    target.content + " "
                                );
                                break;

                            case "backspace":
                                if (!target.content.length) break;
                                targetSetContentFoo(
                                    target,
                                    target.content.substring(
                                        0,
                                        target.content.length - 1
                                    ) || ""
                                );
                                break;

                            case "shift":
                                this.keyboard.toggleCase();
                                break;
                        }

                        // print a glyph, if any
                    } else if (key.info.input) {
                        targetSetContentFoo(
                            target,
                            target.content + key.info.input
                        );
                    }
                },
            });
        });

        return keyObjsToTest;
    }

    foldersButtonsIdleState() {
        this.foldersButtons.forEach((folder) => {
            if (folder.folderIndex === this.FOLDER) {
                folder.setupState(this.folderActiveIdleState);
                folder.set({ backgroundColor: this.sortActiveColor });
            } else {
                folder.setupState(this.idleState);
                folder.set({ backgroundColor: new Color(0x4f4f4f) });
            }
        });
    }

    sortSetButtonsIdleState() {
        this.sortByName.setupState({
            state: "idle",
            attributes: {
                backgroundColor: this.sortByNameColorRef,
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        this.sortByDate.setupState({
            state: "idle",
            attributes: {
                backgroundColor: this.sortByDateColorRef,
                backgroundOpacity: 1,
                fontColor: new Color(0x000000),
            },
        });

        this.sortByName.set({ backgroundColor: this.sortByNameColorRef });
        this.sortByDate.set({ backgroundColor: this.sortByDateColorRef });
    }

    loadingAnimation() {
        if (this.viewGeneratorFinished === false) {
            this.loadingAnimatedObj.visible = true;
            this.loadingAnimatedObjBackground.visible = true;
            this.loadingAnimatedObj.rotation.z =
                this.loadingAnimatedObj.rotation.z - 0.2;
        } else {
            this.loadingAnimatedObj.visible = false;
            this.loadingAnimatedObjBackground.visible = false;
        }
    }

    rebuildFiles(files, shouldVerifyVideoSRC) {
        this.shouldVerifyVideoSRC = shouldVerifyVideoSRC;

        if (files.videos) {
            this.VIDEOS = files.videos;
            this.FILES = this.VIDEOS[0].list;
            this.FOLDER = 0;
            this.ACTIVEFOLDER = 0;
            this.folderIndex = 1;
            this.folderPageIndex = 0;
            this.currentFolderPageIndex = 0;
            this.CURRENT_PAGE = 0;
            this.TOTAL_PAGES =
                Math.ceil(
                    this.FILES.length / (this.FILES_PER_ROW * this.FILES_ROWS)
                ) - 1;
        }
    }
}
