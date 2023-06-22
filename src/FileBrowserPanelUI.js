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

    defaultVideoThumbnail;

    searchContainer;
    searchText;
    clearSearch;
    keyboard;
    defaultSearchText = "Search in folder...";

    sortContainer;
    sortActiveColor = new Color(0xF9DC77);
    sortInactiveColor = new Color(0xC5D564);
    sortByName;
    sortByNameColorRef = this.sortActiveColor;
    sortByDate;
    sortByDateColorRef = this.sortInactiveColor;
    activeSorting = 'name';
    sortDirectionBlock;
    sortDirection = 'ASC';

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
            backgroundColor: new Color(0x4f4f4f),
            backgroundOpacity: 1,
            fontColor: new Color(0xffffff)
        },
    };

    folderActiveIdleStateAttributes = {
        state: 'idle',
        attributes: {
            offset: 0.035,
            backgroundColor: new Color(0x008e7f),
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

        this.defaultVideoThumbnail = this.loader.load(VideoIcon);

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
                folderButton.folderIndex = index
                folderButton.setupState({
                    state: 'selected',
                    attributes: this.selectedAttributes,
                    onSet: () => {
                        if (this.FOLDER !== index) {
                            this.CURRENT_PAGE = 0;
                            this.FOLDER = index;
                            if (this.searchText.content !== this.defaultSearchText) {
                                this.prepareFilesWithSearchPhrase();
                            } else {
                                this.FILES = this.VIDEOS[index].list;
                                this.TOTAL_PAGES = (Math.ceil(this.FILES.length / (this.FILES_PER_ROW * this.FILES_ROWS))) - 1;
                                this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
                            }
                            this.foldersButtonsIdleState();
                            this.regenerateFileBrowser();
                        }
                    }
                });
                folderButton.setupState(this.hoveredStateAttributes);
                this.foldersContainer.add(folderButton);
                this.foldersButtonsToTest.push(folderButton);
            }
            this.foldersButtonsIdleState();

            MAIN.scene.add(this.foldersContainer);
            this.foldersContainer.position.set(-3.8, 1.4, this.SIDEPANELZDISTANCE);
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
        this.searchContainer.position.set(-2, 3.2, this.CENTERPANELZDISTANCE);

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
                        this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
                    } else {
                        this.prepareFilesWithSearchPhrase();
                    }
                    this.keyboard.visible = false;
                    UI.registerNewObjectsToTest(this.fileThumbsToTest);
                    this.regenerateFileBrowser();
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
                    this.TOTAL_PAGES = (Math.ceil(this.FILES.length / (this.FILES_PER_ROW * this.FILES_ROWS))) - 1;
                    this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
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

        this.clearSearch.position.set(-0.5, 3.2, this.CENTERPANELZDISTANCE);
        MAIN.scene.add(this.clearSearch);

        //////////////////////////////////////////////////////////////////////

        this.sortDirectionBlock = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            padding: 0.02,
            margin: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xC5D564),
            width: 0.4,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000)
        });

        this.sortDirection = new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: "ASC"
        });

        this.sortDirectionBlock.add(this.sortDirection);

        this.sortDirectionBlock.setupState({
            state: 'selected',
            onSet: () => {
                switch (this.sortDirection.content) {
                    case 'DESC':
                        this.sortDirection.set({ content: 'ASC' });
                        break;
                    default:
                    case 'ASC':
                        this.sortDirection.set({ content: 'DESC' });
                        break;
                }
                this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
                this.regenerateFileBrowser();
            }
        });

        this.sortDirectionBlock.setupState({
            state: 'hovered',
            attributes: {
                backgroundColor: new Color(0xDCF63F),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });
        this.sortDirectionBlock.setupState({
            state: 'idle',
            attributes: {
                backgroundColor: new Color(0xC5D564),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });

        ////////////

        this.sortByName = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            padding: 0.02,
            margin: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xC5D564),
            width: 0.4,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000)
        });
        this.sortByName.add(new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: "Name"
        }));

        this.sortByName.setupState({
            state: 'selected',
            onSet: () => {
                if (this.activeSorting !== 'name') {
                    this.sortByNameColorRef = this.sortActiveColor;
                    this.sortByDateColorRef = this.sortInactiveColor;
                    this.sortSetButtonsIdleState();
                    this.activeSorting = 'name';
                    this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
                    this.regenerateFileBrowser();
                }
            }
        });

        this.sortByName.setupState({
            state: 'hovered',
            attributes: {
                backgroundColor: new Color(0xDCF63F),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });

        ///////////////

        this.sortByDate = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            padding: 0.02,
            margin: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            backgroundColor: new Color(0xC5D564),
            width: 0.4,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0x000000)
        });
        this.sortByDate.add(new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: "Date"
        }));

        this.sortByDate.setupState({
            state: 'selected',
            onSet: () => {
                if (this.activeSorting !== 'date') {
                    this.sortByDateColorRef = this.sortActiveColor;
                    this.sortByNameColorRef = this.sortInactiveColor;
                    this.sortSetButtonsIdleState();
                    this.activeSorting = 'date';
                    this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
                    this.regenerateFileBrowser();
                }
            }
        });

        this.sortByDate.setupState({
            state: 'hovered',
            attributes: {
                backgroundColor: new Color(0xDCF63F),
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });

        ///////////////

        this.sortSetButtonsIdleState();

        ///////////////

        this.sortContainer = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            width: 2,
            height: 0.3,
            hiddenOverflow: true,
            fontColor: new Color(0x000000)
        });
        let label = new Block({
            justifyContent: 'center',
            contentDirection: 'row',
            padding: 0.02,
            borderRadius: 0.08,
            backgroundOpacity: 1,
            width: 0.7,
            height: 0.2,
            hiddenOverflow: true,
            fontColor: new Color(0xffffff)
        });
        label.add(new Text({
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.12,
            content: "Sorting:"
        }));
        this.sortContainer.add(label);
        this.sortContainer.add(this.sortByName);
        this.sortContainer.add(this.sortByDate);
        this.sortContainer.add(this.sortDirectionBlock);
        this.sortContainer.position.set(1.98, 3.2, this.CENTERPANELZDISTANCE);
        MAIN.scene.add(this.sortContainer);

        //////////////////////////////////////////////////////////////////////

        ///////////////////////////
        // Add to main container

        this.fileBrowserContainer.add(this.buttonLeft);

        this.fileBrowserContainer.add(this.thumbsContainer);

        this.fileBrowserContainer.add(this.buttonRight);

        this.fileThumbsToTest = this.foldersButtonsToTest.slice();
        this.fileThumbsToTest.push(this.buttonLeft, this.buttonRight);

        if (this.FILES.length > 0 && this.defaultVideoThumbnail !== undefined) {
            this.generateView();
        }

        this.fileBrowserContainer.position.set(0, 1.4, this.CENTERPANELZDISTANCE);

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
        this.draggingBox.position.set(0, -0.35, this.CENTERPANELZDISTANCE);
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
        this.fileThumbsToTest.push(this.sortByDate);
        this.fileThumbsToTest.push(this.sortByName);
        this.fileThumbsToTest.push(this.sortDirectionBlock);
        //////////////////////////////////////////////////////////////////////

        this.keyboardObjsToTest = this.makeKeyboard(this.searchText, this.searchTextSetContent);



        this.keyboard.visible = false;
        this.keyboard.position.set(0, 2, this.KEYBOARDZDISTANCE);
        MAIN.scene.add(this.keyboard);

        //////////////////////////////////////////////////////////////////////

        MAIN.registerObjectToRecenter(this.draggingBox, "files");
        MAIN.registerObjectToRecenter(this.searchContainer, "files");
        MAIN.registerObjectToRecenter(this.clearSearch, "files");
        MAIN.registerObjectToRecenter(this.keyboard, "files");
        MAIN.registerObjectToRecenter(this.foldersContainer, "files");
        MAIN.registerObjectToRecenter(this.fileBrowserContainer, "files");
        MAIN.registerObjectToRecenter(this.sortContainer, "files");

    }

    prepareFilesWithSearchPhrase() {
        let filesList = [];
        this.FILES = this.VIDEOS[this.FOLDER].list;
        this.FILES.forEach((file) => {
            if (file.name.replace(/[^ qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890,\.\/\?;:\'"\[\{\}\]=\+-_!@#\$%\^\&\*\(\)\\\|\`\~]+/, '').toLowerCase().includes(this.searchText.content.toLowerCase())) {
                filesList.push(file);
            }
        });
        this.FILES = filesList;
        this.TOTAL_PAGES = (Math.ceil(this.FILES.length / (this.FILES_PER_ROW * this.FILES_ROWS))) - 1;
        this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
    }

    generateView() {
        let endOfFiles = false;
        this.viewGeneratorThumbs = [];
        this.viewGeneratorThumbsIterator = 0;
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
                thumb.fileNameButton = this.FILES[iterate].name.replace(/[^ qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890,\.\/\?;:\'"\[\{\}\]=\+-_!@#\$%\^\&\*\(\)\\\|\`\~]+/, '');
                thumb.fileThumbnail = this.FILES[iterate].thumbnail;
                const screen_type = this.FILES[iterate].screen_type;

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
            if (this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator] && this.viewGeneratorFinished === false) {
                this.viewGeneratorInProgress = true;
                let thumb = this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator].fileThumbnail
                this.loader.loadAsync(
                    thumb, undefined).then((image) => {
                        if (thumb === this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator].fileThumbnail) {
                            this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator].add(
                                new InlineBlock(this.textureAttributes(image)),
                                new Block(this.thumbTextContainerAttributes).add(
                                    new Text(this.thumbTextAttributes(this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator].fileNameButton))
                                )
                            );
                            this.viewGeneratorThumbsIterator++;
                        }
                        this.viewGeneratorInProgress = false;
                    }).catch(() => {
                        this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator].add(
                            new InlineBlock(this.textureAttributes(this.defaultVideoThumbnail)),
                            new Block(this.thumbTextContainerAttributes).add(
                                new Text(this.thumbTextAttributes(this.viewGeneratorThumbs[this.viewGeneratorThumbsIterator].fileNameButton))
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
            case 'date':
                switch (order) {
                    case 'desc':
                        this.FILES.sort((a, b) => b.epoch - a.epoch);
                        break;

                    default:
                    case 'asc':
                        this.FILES.sort((a, b) => a.epoch - b.epoch);
                        break;
                }
                break;
            default:
            case 'name':
                switch (order) {
                    case 'desc':
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
                    case 'asc':
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
        this.thumbsContainer.set(this.thumbsContainerAttributes);
        this.fileThumbsToTest = [];
        this.fileThumbsToTest = this.foldersButtonsToTest.slice();
        this.fileThumbsToTest.push(this.buttonLeft, this.buttonRight, this.draggingBox, this.searchContainer, this.clearSearch, this.sortByDate, this.sortByName, this.sortDirectionBlock);

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
        UI.showMenu([this.fileBrowserContainer, this.foldersContainer, this.draggingBox, this.searchContainer, this.clearSearch, this.sortContainer], this.fileThumbsToTest, true);
        Helpers.removeVideoSrc();
        MAIN.playbackChange(false);
    }

    hideFileMenuPanel(screen_type = null) {
        UI.hideMenu([this.fileBrowserContainer, this.foldersContainer, this.draggingBox, this.searchContainer, this.clearSearch, this.keyboard, this.sortContainer], [], true);
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
                                this.keyboard.visible = false;
                                this.CURRENT_PAGE = 0;
                                if (target.content === "") {
                                    target.set({ content: this.defaultSearchText });
                                    this.FILES = this.VIDEOS[this.FOLDER].list;
                                    this.sortFiles(this.activeSorting, this.sortDirection.content.toLowerCase());
                                } else {
                                    this.prepareFilesWithSearchPhrase();
                                }
                                UI.registerNewObjectsToTest(this.fileThumbsToTest);
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

    foldersButtonsIdleState() {
        this.foldersButtonsToTest.forEach((folder) => {
            if (folder.folderIndex === this.FOLDER) {
                folder.setupState(this.folderActiveIdleStateAttributes);
                folder.set({ backgroundColor: this.sortActiveColor });
            } else {
                folder.setupState(this.idleStateAttributes);
                folder.set({ backgroundColor: new Color(0x4f4f4f) });
            }
        });
    }

    sortSetButtonsIdleState() {
        this.sortByName.setupState({
            state: 'idle',
            attributes: {
                backgroundColor: this.sortByNameColorRef,
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });

        this.sortByDate.setupState({
            state: 'idle',
            attributes: {
                backgroundColor: this.sortByDateColorRef,
                backgroundOpacity: 1,
                fontColor: new Color(0x000000)
            }
        });

        this.sortByName.set({ backgroundColor: this.sortByNameColorRef });
        this.sortByDate.set({ backgroundColor: this.sortByDateColorRef });
    }
}