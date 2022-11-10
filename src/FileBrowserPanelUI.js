import { Color, TextureLoader } from '../node_modules/three/build/three.module.js';
import { Block, Text, InlineBlock } from '../node_modules/three-mesh-ui/build/three-mesh-ui.module.js';

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

    buttonLeft;
    buttonRight;

    fileThumbsToTest = [];
    foldersButtonsToTest = [];

    VIDEOS = [];
    FILES = [];

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
            this.foldersContainer.position.set(-3.8, 1.4, -3);
            this.foldersContainer.rotation.y = 0.5;
        }


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

        this.fileBrowserContainer.position.set(0, 1.4, -3.5);

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
        this.draggingBox.position.set(0, -0.3, -3.5);
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

        MAIN.registerObjectToRecenter(this.draggingBox, "files");
        MAIN.registerObjectToRecenter(this.foldersContainer, "files");
        MAIN.registerObjectToRecenter(this.fileBrowserContainer, "files");

    }


    generateView() {
        let endOfFiles = false;
        let iterate = (this.CURRENT_PAGE > 0 ? ((this.FILES_PER_ROW * this.FILES_ROWS) * this.CURRENT_PAGE) : 0);
        for (let index = 0; index < this.FILES_ROWS; index++) {
            const thumbsContainerButtonsRow = new Block(this.thumbRowContainerAttributes);
            let addedThumbs = 0;
            for (let index = 0; index < this.FILES_PER_ROW; index++) {
                if (!this.FILES[iterate]) {
                    endOfFiles = true;
                    break;
                }
                const thumb = new Block(this.thumbButtonContainerAttributes);
                thumb.fileSRC = this.FILES[iterate].src;
                let name = this.FILES[iterate].name;
                this.loader.load((this.FILES[iterate].thumbnail == "" ? VideoIcon : this.FILES[iterate].thumbnail), (image) => {
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
                            this.hideFileMenuPanel();
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
        this.fileThumbsToTest.push(this.buttonLeft, this.buttonRight, this.draggingBox);

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
        UI.showMenu([this.fileBrowserContainer, this.foldersContainer, this.draggingBox], this.fileThumbsToTest, true);
        Helpers.removeVideoSrc();
        MAIN.playbackChange(false);
    }

    hideFileMenuPanel() {
        UI.hideMenu([this.fileBrowserContainer, this.foldersContainer, this.draggingBox], [], true);
        MAIN.playbackChange(true);
    }


}