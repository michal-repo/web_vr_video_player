import { Color, TextureLoader } from '../node_modules/three/build/three.module.js';
import { Block, Text, InlineBlock } from '../node_modules/three-mesh-ui/build/three-mesh-ui.module.js';

import deepDelete from '../node_modules/three-mesh-ui/src/utils/deepDelete.js';

import FontJSON from '../assets/fonts/Roboto-Regular-msdf.json';
import FontImage from '../assets/fonts/Roboto-Regular.png';

import * as MAIN from './index.js';

import * as UI from './UI.js';

import * as Helpers from './Helpers.js';

// Import Icons
import LeftIcon from '../assets/icons/left-arrow.png';
import RightIcon from '../assets/icons/right-arrow.png';
import VideoIcon from '../assets/icons/video.png';

export class FileBrowserPanel {

    fileBrowserContainer;
    thumbsContainer;

    buttonLeft;
    buttonRight;

    fileThumbsToTest = [];

    FILES = [];

    FILES_PER_ROW = 5;
    FILES_ROWS = 3;

    CURRENT_PAGE = 0;
    TOTAL_PAGES;

    loader = new TextureLoader();

    PANELMAXWIDTH = 4;
    PANELMAXHEIGHT = 3;

    DoubleClickPreventFlag = { prevent: false };

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
        padding: 0.02,
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
        padding: 0.02,
        hiddenOverflow: true,
        borderRadius: 0,
    };

    textureAttributes(texture) {
        return {
            // height: ((this.PANELMAXHEIGHT / this.FILES_ROWS) - ((this.PANELMAXHEIGHT / this.FILES_ROWS) / 16)),
            height: ((this.PANELMAXWIDTH - this.PANELMAXWIDTH / 16) / this.FILES_PER_ROW - 0.05),
            width: ((this.PANELMAXWIDTH - this.PANELMAXWIDTH / 16) / this.FILES_PER_ROW - 0.05),
            backgroundTexture: texture,
            borderRadius: 0
        }
    };

    thumbTextAttributes(name) {
        return {
            height: ((this.PANELMAXHEIGHT / this.FILES_ROWS) / 16),
            width: ((this.PANELMAXWIDTH - this.PANELMAXWIDTH / 16) / this.FILES_PER_ROW - 0.05),
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.059,
            content: name
        }
    };

    bigButtonAttributes = {
        height: (this.PANELMAXHEIGHT / this.FILES_ROWS - 0.5),
        width: (this.PANELMAXHEIGHT / this.FILES_ROWS - 0.5),
        justifyContent: 'center',
        offset: 0.05,
        margin: 0.02,
        backgroundColor: new Color(0x999999),
        backgroundOpacity: 1,
        borderRadius: 0.075
    };

    bigButtonAttributesTextureAttributes(texture) {
        return {
            height: (this.PANELMAXHEIGHT / this.FILES_ROWS - 0.5),
            width: (this.PANELMAXHEIGHT / this.FILES_ROWS - 0.5),
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
            this.FILES = files.videos;
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
                if (this.CURRENT_PAGE > 0) {
                    this.CURRENT_PAGE--;
                    this.regenerateFileBrowser();
                }
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
                if (this.CURRENT_PAGE < this.TOTAL_PAGES) {
                    this.CURRENT_PAGE++;
                    this.regenerateFileBrowser();
                }
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
            backgroundOpacity: 0,
            width: this.PANELMAXWIDTH + 0.3,
            height: this.PANELMAXHEIGHT
        });

        MAIN.scene.add(this.fileBrowserContainer);

        this.thumbsContainer = new Block(this.thumbsContainerAttributes);

        ///////////////////////////
        // Add to main container

        this.fileBrowserContainer.add(this.buttonLeft);

        this.fileBrowserContainer.add(this.thumbsContainer);

        this.fileBrowserContainer.add(this.buttonRight);

        this.fileThumbsToTest.push(this.buttonLeft, this.buttonRight);

        if (this.FILES.length > 0) {
            this.generateView();
        }


        this.fileBrowserContainer.position.set(0, 1, -2);

        // objectsToRecenter.move.push(this.playMenuContainer);

    }


    generateView() {
        let endOfFiles = false;
        let iterate = (this.CURRENT_PAGE > 0 ? ((this.FILES_PER_ROW * this.FILES_ROWS) * this.CURRENT_PAGE) : 0);
        for (let index = 0; index < this.FILES_ROWS; index++) {
            const thumbsContainerButtonsRow = new Block(this.thumbRowContainerAttributes);
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
                        new Text(this.thumbTextAttributes(name))
                    );
                });

                //

                thumb.setupState({
                    state: 'selected',
                    attributes: this.selectedAttributes,
                    onSet: () => {
                        if (!this.DoubleClickPreventFlag.prevent) {
                            Helpers.setVideoSrc(thumb.fileSRC);
                            this.hideFileMenuPanel();
                        }
                    }
                });
                thumb.setupState(this.hoveredStateAttributes);
                thumb.setupState(this.idleStateAttributes);

                thumbsContainerButtonsRow.add(thumb);
                this.fileThumbsToTest.push(thumb);
                iterate++;
            }
            this.thumbsContainer.add(thumbsContainerButtonsRow);
            if (endOfFiles) {
                break;
            }
        }
    }

    regenerateFileBrowser() {
        deepDelete(this.thumbsContainer);
        this.thumbsContainer.set(this.thumbsContainerAttributes);
        this.fileThumbsToTest = [];
        this.fileThumbsToTest.push(this.buttonLeft, this.buttonRight);

        this.generateView();

        UI.registerNewObjectsToTest(this.fileThumbsToTest);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Hide / Show Menu

    showFileMenuPanel() {
        Helpers.preventDoubleClick(this.DoubleClickPreventFlag, 2);
        UI.showMenu(this.fileBrowserContainer, this.fileThumbsToTest, true);
        MAIN.hiddenSphere.buttonsVisible = true;
        Helpers.removeVideoSrc();
    }

    hideFileMenuPanel() {
        Helpers.preventDoubleClick(MAIN.playMenuPanel.showPlayMenuPanelDoubleClickPreventFlag, 2);
        UI.hideMenu(this.fileBrowserContainer, [], true);
        MAIN.hiddenSphere.buttonsVisible = false;
    }


}