import { Color, TextureLoader } from '../node_modules/three/build/three.module.js';
import { Block, Text, InlineBlock, Keyboard } from '../node_modules/three-mesh-ui/build/three-mesh-ui.module.js';

import Backspace from '../node_modules/three-mesh-ui/examples/assets/backspace.png';
import Enter from '../node_modules/three-mesh-ui/examples/assets/enter.png';
import Shift from '../node_modules/three-mesh-ui/examples/assets/shift.png';

import deepDelete from '../node_modules/three-mesh-ui/src/utils/deepDelete.js';

import FontJSON from '../assets/fonts/Roboto-Regular-msdf.json';
import FontImage from '../assets/fonts/Roboto-Regular.png';

import * as MAIN from './index.js';

import * as UI from './UI.js';

import * as Helpers from './Helpers.js';

import * as ScreenManager from './ScreenManager.js';

// Import Icons
import LeftIcon from '../assets/icons/left-arrow.png';
import RightIcon from '../assets/icons/right-arrow.png';
import VideoIcon from '../assets/icons/video.png';
import FolderIcon from '../assets/icons/folder.png';

export class FileBrowserPanel {

    fileBrowserContainer;
    foldersContainer;
    thumbsContainer;
    draggingBox;
    searchContainer;
    searchText;
    clearSearch;
    keyboard;
    defaultSearchText = "Search...";

    buttonLeft;
    buttonRight;

    fileThumbsToTest = [];
    foldersButtonsToTest = [];
    keyboardObjsToTest = [];

    VIDEOS = [];
    FILES = [];
    FOLDER;

    FILES_PER_ROW = 4;
    FILES_ROWS = 3;

    CURRENT_PAGE = 0;
    TOTAL_PAGES;

    loader = new TextureLoader();

    PANELMAXWIDTH = 4.5;
    PANELMAXHEIGHT = 3.2;

    BUTTONWIDTHHEIGHT = (this.PANELMAXHEIGHT / this.FILES_ROWS - 0.5);

    THUMBTEXTUREHEIGHT = ((this.PANELMAXHEIGHT / this.FILES_ROWS) - ((this.PANELMAXHEIGHT / this.FILES_ROWS) * 0.25));
    THUMBTEXTUREWIDTH = ((this.PANELMAXWIDTH - this.PANELMAXWIDTH / 16) / this.FILES_PER_ROW - 0.05);

    thumbRowContainerAttributes = {
        width: this.PANELMAXWIDTH,
        height: ((this.PANELMAXHEIGHT) / this.FILES_ROWS),
        contentDirection: 'row',
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        hiddenOverflow: true,
        backgroundOpacity: 1,
        borderRadius: 0.08
    };

    thumbsContainerAttributes = {
        justifyContent: 'center',
        contentDirection: 'column',
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0,
        borderRadius: 0,
        backgroundOpacity: 0,
        hiddenOverflow: true,
        width: this.PANELMAXWIDTH,
        height: this.PANELMAXHEIGHT
    };

    thumbButtonContainerAttributes = {
        height: (this.PANELMAXHEIGHT / this.FILES_ROWS),
        width: ((this.PANELMAXWIDTH - this.PANELMAXWIDTH / 16) / this.FILES_PER_ROW),
        justifyContent: 'start',
        contentDirection: 'column',
        padding: 0,
        hiddenOverflow: true,
        borderRadius: 0,
    };

    textureAttributes(texture) {
        return {
            height: this.THUMBTEXTUREHEIGHT,
            width: this.THUMBTEXTUREWIDTH,
            backgroundTexture: texture,
            borderRadius: 0
        }
    };

    thumbTextContainerAttributes = {
        height: (this.PANELMAXHEIGHT / this.FILES_ROWS) - this.THUMBTEXTUREHEIGHT - 0.025,
        width: this.THUMBTEXTUREWIDTH,
        backgroundOpacity: 0,
        bestFit: 'shrink'
    };

    thumbTextAttributes(name) {
        return {
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: this.PANELMAXHEIGHT * 0.029,
            content: name
        }
    };

    bigButtonAttributes = {
        height: this.BUTTONWIDTHHEIGHT,
        width: this.BUTTONWIDTHHEIGHT,
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        backgroundColor: new Color(0x999999),
        backgroundOpacity: 1,
        borderRadius: 0.075
    };

    bigButtonAttributesTextureAttributes(texture) {
        return {
            height: this.BUTTONWIDTHHEIGHT,
            width: this.BUTTONWIDTHHEIGHT,
            backgroundTexture: texture,
            borderRadius: 0
        }
    };

    buttonOptions = {
        width: 0.15,
        height: 0.15,
        backgroundColor: new Color(0x999999),
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
            // backgroundColor: new Color(0x666666),
            backgroundColor: new Color(0x4f4f4f),
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

    //////////////////////////////////////////////////////////////////////////////
    // CONSTRUCT
    //////////////////////////////////////////////////////////////////////////////

    constructor(files) {
        if (files.videos) {
            this.VIDEOS = files.videos;
            this.FILES = this.VIDEOS[0].list;
            this.FOLDER = 0;
            this.TOTAL_PAGES = (Math.ceil(this.FILES.length / (this.FILES_PER_ROW * this.FILES_ROWS))) - 1;
        }


        // Buttons

        // Left
        this.buttonLeft = new Block(this.bigButtonAttributes);

        this.loader.load(LeftIcon, (texture) => {
            this.buttonLeft.add(
                new InlineBlock(this.bigButtonAttributesTextureAttributes(texture))
            );
        });

        this.buttonLeft.setupState({
            state: 'selected',
            attributes: this.selectedAttributes,
            onSet: () => {
                this.PreviousPage();
            }
        });
        this.buttonLeft.setupState(this.hoveredStateAttributes);
        this.buttonLeft.setupState(this.idleStateAttributes);

        // Right
        this.buttonRight = new Block(this.bigButtonAttributes);

        this.loader.load(RightIcon, (texture) => {
            this.buttonRight.add(
                new InlineBlock(this.bigButtonAttributesTextureAttributes(texture))
            );
        });

        this.buttonRight.setupState({
            state: 'selected',
            attributes: this.selectedAttributes,
            onSet: () => {
                this.NextPage();
            }
        });
        this.buttonRight.setupState(this.hoveredStateAttributes);
        this.buttonRight.setupState(this.idleStateAttributes);

        //////////////////////////////////////////////////

        this.fileBrowserContainer = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0,
            backgroundOpacity: 1,
            backgroundColor: new Color(0x292929),
            width: this.PANELMAXWIDTH + 0.3 + (this.BUTTONWIDTHHEIGHT * 2),
            height: this.PANELMAXHEIGHT
        });

        MAIN.scene.add(this.fileBrowserContainer);

        this.thumbsContainer = new Block(this.thumbsContainerAttributes);

        if (this.VIDEOS.length > 0) {
            this.foldersContainer = new Block({
                justifyContent: 'start',
                contentDirection: 'column',
                fontFamily: FontJSON,
                fontTexture: FontImage,
                fontSize: 0.12,
                padding: 0.02,
                borderRadius: 0,
                backgroundOpacity: 1,
                backgroundColor: new Color(0x292929),
                width: this.PANELMAXWIDTH / 3,
                height: this.PANELMAXHEIGHT
            });

            for (let index = 0; index < this.VIDEOS.length; index++) {
                const folderButton = new Block({
                    justifyContent: 'center',
                    contentDirection: 'row',
                    height: 0.2,
                    offset: 0.05,
                    margin: 0.02,
                    bestFit: 'shrink',
                    width: (this.PANELMAXWIDTH / 3) - 0.1,
                    backgroundOpacity: 1
                }).add(new Text({ content: this.VIDEOS[index].name }));
                folderButton.setupState({
                    state: 'selected',
                    attributes: this.selectedAttributes,
                    onSet: () => {
                        this.CURRENT_PAGE = 0;
                        this.FILES = this.VIDEOS[index].list;
                        this.FOLDER = index;
                        this.TOTAL_PAGES = (Math.ceil(this.FILES.length / (this.FILES_PER_ROW * this.FILES_ROWS))) - 1;
                        this.regenerateFileBrowser();
                    }
                });
                folderButton.setupState(this.hoveredStateAttributes);
                folderButton.setupState(this.idleStateAttributes);
                this.foldersContainer.add(folderButton);
                this.foldersButtonsToTest.push(folderButton);
            }

            MAIN.scene.add(this.foldersContainer);
            this.foldersContainer.position.set(-3.8, 1.4, -4);
            this.foldersContainer.rotation.y = 0.5;
        }

        //////////////////////////////////////////////////////////////////////
        // Search

        this.searchContainer = new Block({
            justifyContent: 'end',
            contentDirection: 'row',
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0x292929),
            width: 2,
            height: 0.2,
            hiddenOverflow: true
        });

        const textContainer = new Block({
            justifyContent: 'start',
            contentDirection: 'row',
            width: 1.9,
            height: 0.15,
            padding: 0.02,
            backgroundOpacity: 0,
            alignItems: 'start',
            textAlign: 'left'
        });

        this.searchText = new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: this.defaultSearchText
        });

        textContainer.add(this.searchText);

        this.searchContainer.add(textContainer);

        MAIN.scene.add(this.searchContainer);
        this.searchContainer.position.set(-2, 3.2, -4.2);

        this.searchContainer.setupState({
            state: 'selected',
            onSet: () => {
                if (!this.keyboard.visible) {
                    if (this.searchText.content === this.defaultSearchText) {
                        this.searchText.set({ content: '' });
                    }
                    this.keyboard.visible = true;
                    let objectsToTest = this.keyboardObjsToTest.slice();
                    objectsToTest.push(this.searchContainer);
                    objectsToTest.push(this.draggingBox);
                    objectsToTest.push(this.clearSearch);
                    UI.registerNewObjectsToTest(objectsToTest);
                } else {
                    if (this.searchText.content === "") {
                        this.searchText.set({ content: this.defaultSearchText });
                        this.CURRENT_PAGE = 0;
                        this.FILES = this.VIDEOS[this.FOLDER].list;
                    }
                    this.keyboard.visible = false;
                    UI.registerNewObjectsToTest(this.fileThumbsToTest);
                }
            }
        });

        this.searchContainer.setupState({
            state: 'hovered',
            attributes: {
                backgroundColor: new Color(0xffff00),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });
        this.searchContainer.setupState({
            state: 'idle',
            attributes: {
                backgroundColor: new Color(0x5c5c5c),
                backgroundOpacity: 1,
                fontColor: new Color(0xffffff)
            }
        });

        ///////////////////////////

        this.clearSearch = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xf88e86),
            width: 0.7,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000)
        });
        this.clearSearch.add(new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: "Clear"
        }));

        this.clearSearch.setupState({
            state: 'selected',
            onSet: () => {
                if (!this.keyboard.visible && this.searchText.content !== this.defaultSearchText) {
                    this.searchText.set({ content: this.defaultSearchText });
                    this.CURRENT_PAGE = 0;
                    this.FILES = this.VIDEOS[this.FOLDER].list;
                    this.regenerateFileBrowser();
                } else if (this.keyboard.visible) {
                    this.searchText.set({ content: '' });
                }
            }
        });

        this.clearSearch.setupState({
            state: 'hovered',
            attributes: {
                backgroundColor: new Color(0xf44336),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });
        this.clearSearch.setupState({
            state: 'idle',
            attributes: {
                backgroundColor: new Color(0xf88e86),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });

        this.clearSearch.position.set(-0.5, 3.2, -4.2);
        MAIN.scene.add(this.clearSearch);

        //////////////////////////////////////////////////////////////////////

        ///////////////////////////
        // Add to main container

        this.fileBrowserContainer.add(this.buttonLeft);

        this.fileBrowserContainer.add(this.thumbsContainer);

        this.fileBrowserContainer.add(this.buttonRight);

        this.fileThumbsToTest = this.foldersButtonsToTest.slice();
        this.fileThumbsToTest.push(this.buttonLeft, this.buttonRight);

        if (this.FILES.length > 0) {
            this.generateView();
        }

        this.fileBrowserContainer.position.set(0, 1.4, -4.2);

        this.draggingBox = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            padding: 0.02,
            borderRadius: 0.06,
            backgroundOpacity: 1,
            backgroundColor: new Color(0x5c5c5c),
            width: this.PANELMAXWIDTH / 3,
            height: 0.1
        });

        MAIN.scene.add(this.draggingBox);
        this.draggingBox.position.set(0, -0.35, -4.2);
        this.draggingBox.setupState({
            state: 'selected',
            onSet: () => {
                ScreenManager.startDrag("files");
            }
        });

        this.draggingBox.setupState({
            state: 'hovered',
            attributes: {
                backgroundColor: new Color(0xffff00),
                backgroundOpacity: 1
            },
            onSet: () => {
                ScreenManager.stopDrag("files");
            }
        });
        this.draggingBox.setupState({
            state: 'idle',
            attributes: {
                backgroundColor: new Color(0x5c5c5c),
                backgroundOpacity: 1
            },
            onSet: () => {
                ScreenManager.stopDrag("files");
            }
        });
        this.fileThumbsToTest.push(this.draggingBox);

        this.fileThumbsToTest.push(this.searchContainer);
        this.fileThumbsToTest.push(this.clearSearch);
        //////////////////////////////////////////////////////////////////////

        this.keyboardObjsToTest = this.makeKeyboard(this.searchText, this.searchTextSetContent);



        this.keyboard.visible = false;
        this.keyboard.position.set(0, 2, -4);
        MAIN.scene.add(this.keyboard);

        //////////////////////////////////////////////////////////////////////

        MAIN.registerObjectToRecenter(this.draggingBox, "files");
        MAIN.registerObjectToRecenter(this.searchContainer, "files");
        MAIN.registerObjectToRecenter(this.clearSearch, "files");
        MAIN.registerObjectToRecenter(this.keyboard, "files");
        MAIN.registerObjectToRecenter(this.foldersContainer, "files");
        MAIN.registerObjectToRecenter(this.fileBrowserContainer, "files");

    }


    generateView() {
        let filesList = [];
        if (this.searchText.content !== this.defaultSearchText) {
            this.FILES.forEach((file) => {
                if (file.name.toLowerCase().includes(this.searchText.content.toLowerCase())) {
                    filesList.push(file);
                }
            });
            this.FILES = filesList;
        } else {
            filesList = this.FILES;
        }
        let endOfFiles = false;
        let iterate = (this.CURRENT_PAGE > 0 ? ((this.FILES_PER_ROW * this.FILES_ROWS) * this.CURRENT_PAGE) : 0);
        for (let index = 0; index < this.FILES_ROWS; index++) {
            const thumbsContainerButtonsRow = new Block(this.thumbRowContainerAttributes);
            let addedThumbs = 0;
            for (let index = 0; index < this.FILES_PER_ROW; index++) {
                if (!filesList[iterate]) {
                    endOfFiles = true;
                    break;
                }
                const thumb = new Block(this.thumbButtonContainerAttributes);
                thumb.fileSRC = filesList[iterate].src;
                let name = filesList[iterate].name;
                const screen_type = filesList[iterate].screen_type;
                this.loader.load((filesList[iterate].thumbnail == "" ? VideoIcon : filesList[iterate].thumbnail), (image) => {
                    thumb.add(
                        new InlineBlock(this.textureAttributes(image)),
                        new Block(this.thumbTextContainerAttributes).add(
                            new Text(this.thumbTextAttributes(name))
                        )
                    );
                });

                //

                thumb.setupState({
                    state: 'selected',
                    attributes: this.selectedAttributes,
                    onSet: () => {
                        const response = Helpers.testIfFileExist(thumb.fileSRC);
                        if (response) {
                            Helpers.setVideoSrc(thumb.fileSRC);
                            this.hideFileMenuPanel(screen_type);
                        } else {
                            MAIN.showPopupMessage("Video file not found.");
                        }
                    }
                });
                thumb.setupState(this.hoveredStateAttributes);
                thumb.setupState(this.idleStateAttributes);

                thumbsContainerButtonsRow.add(thumb);
                this.fileThumbsToTest.push(thumb);
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
    }

    regenerateFileBrowser() {
        deepDelete(this.thumbsContainer);
        this.thumbsContainer.set(this.thumbsContainerAttributes);
        this.fileThumbsToTest = [];
        this.fileThumbsToTest = this.foldersButtonsToTest.slice();
        this.fileThumbsToTest.push(this.buttonLeft, this.buttonRight, this.draggingBox, this.searchContainer, this.clearSearch);

        this.generateView();

        UI.registerNewObjectsToTest(this.fileThumbsToTest);
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Hide / Show Menu

    showFileMenuPanel() {
        UI.showMenu([this.fileBrowserContainer, this.foldersContainer, this.draggingBox, this.searchContainer, this.clearSearch], this.fileThumbsToTest, true);
        Helpers.removeVideoSrc();
        MAIN.playbackChange(false);
    }

    hideFileMenuPanel(screen_type = null) {
        UI.hideMenu([this.fileBrowserContainer, this.foldersContainer, this.draggingBox, this.searchContainer, this.clearSearch, this.keyboard], [], true);
        MAIN.playbackChange(true, screen_type);
    }

    searchTextSetContent(target, newContent) {
        let width = 0;
        if (target.inlines !== null && target.inlines !== undefined) {
            target.inlines.forEach((line) => { width += line.width });
            if (width >= 1.7) {
                target.parent.set({ width: width + 0.2 });
            } else {
                target.parent.set({ width: 1.9 });
            }
        }
        target.set({ content: newContent });
    };

    makeKeyboard(target, targetSetContentFoo, language = 'eng') {

        const keyboardColors = {
            keyboardBack: 0x858585,
            panelBack: 0x262626,
            button: 0x363636,
            hovered: 0x1c1c1c,
            selected: 0x109c5d
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
            enterTexture: Enter
        });

        this.keyboard.position.set(0, 0, -1);
        // keyboard.rotation.x = -0.55;

        //

        this.keyboard.keys.forEach((key) => {

            keyObjsToTest.push(key);

            key.setupState({
                state: 'idle',
                attributes: {
                    offset: 0,
                    backgroundColor: new Color(keyboardColors.button),
                    backgroundOpacity: 1
                }
            });

            key.setupState({
                state: 'hovered',
                attributes: {
                    offset: 0,
                    backgroundColor: new Color(keyboardColors.hovered),
                    backgroundOpacity: 1
                }
            });

            key.setupState({
                state: 'selected',
                attributes: {
                    offset: -0.009,
                    backgroundColor: new Color(keyboardColors.selected),
                    backgroundOpacity: 1
                },
                // triggered when the user clicked on a keyboard's key
                onSet: () => {

                    // if the key have a command (eg: 'backspace', 'switch', 'enter'...)
                    // special actions are taken
                    if (key.info.command) {

                        switch (key.info.command) {

                            // switch between panels
                            case 'switch':
                                this.keyboard.setNextPanel();
                                break;

                            // switch between panel charsets (eg: russian/english)
                            case 'switch-set':
                                this.keyboard.setNextCharset();
                                break;

                            case 'enter':
                                if (target.content === "") {
                                    target.set({ content: this.defaultSearchText });
                                    this.FILES = this.VIDEOS[this.FOLDER].list;
                                }
                                this.keyboard.visible = false;
                                this.CURRENT_PAGE = 0;
                                this.regenerateFileBrowser();
                                break;

                            case 'space':
                                targetSetContentFoo(target, (target.content + ' '));
                                break;

                            case 'backspace':
                                if (!target.content.length) break;
                                targetSetContentFoo(target, (target.content.substring(0, target.content.length - 1) || ''));
                                break;

                            case 'shift':
                                this.keyboard.toggleCase();
                                break;

                        }

                        // print a glyph, if any
                    } else if (key.info.input) {

                        targetSetContentFoo(target, (target.content + key.info.input));

                    }

                }
            });

        });

        return keyObjsToTest;
    }
}