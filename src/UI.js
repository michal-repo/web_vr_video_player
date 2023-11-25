import * as THREE from "../node_modules/three/build/three.module.js";

import * as MAIN from "./index.js";

import * as ScreenManager from "./ScreenManager/ScreenManager.js";

import * as Helpers from "./Helpers.js";

export let objsToTest = [];

export function hideMenu(
    menuContainer,
    passedObjsToTest = [],
    shouldSwitch2d3d = false
) {
    if (shouldSwitch2d3d) {
        ScreenManager.switch2d3d("3d");
    }
    if (menuContainer.constructor === Array) {
        menuContainer.forEach((element) => {
            element.visible = false;
        });
    } else {
        menuContainer.visible = false;
    }
    objsToTest = [];
    if (passedObjsToTest.length > 0) {
        objsToTest = passedObjsToTest.slice();
    } else {
        objsToTest.push(MAIN.hiddenSphere);
        MAIN.vrControl.controllers[
            MAIN.vrControlCurrentlyUsedController
        ].point.visible = false;
    }
}

export function showMenu(
    menuContainer,
    passedObjsToTest,
    shouldSwitch2d3d = false
) {
    if (shouldSwitch2d3d) {
        ScreenManager.switch2d3d("2d");
    }
    if (menuContainer.constructor === Array) {
        menuContainer.forEach((element) => {
            element.visible = true;
        });
    } else {
        menuContainer.visible = true;
    }
    objsToTest = [];
    objsToTest = passedObjsToTest.slice();
    MAIN.vrControl.controllers[
        MAIN.vrControlCurrentlyUsedController
    ].point.visible = true;
}

export function registerNewObjectsToTest(passedObjsToTest) {
    objsToTest = [];
    objsToTest = passedObjsToTest.slice();
}

export class HiddenSphere {
    hiddenSphere;

    constructor() {
        //////////
        // Hidden Sphere
        //////////
        const hiddenGeometry = new THREE.SphereGeometry(100, 60, 40);
        const hiddenMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            opacity: 0,
            transparent: true,
        });
        hiddenMaterial.side = THREE.BackSide;
        this.hiddenSphere = new THREE.Mesh(hiddenGeometry, hiddenMaterial);
        this.hiddenSphere.name = "hiddenSphere";
        this.hiddenSphere.isUI = true;
        this.hiddenSphere.currentState = undefined;
        this.hiddenSphere.states = {};
        this.hiddenSphere.buttonsVisible = false;
        this.hiddenSphere.setupState = function (options) {
            this.states[options.state] = {
                onSet: options.onSet,
            };
        };
        this.hiddenSphere.setState = function (state) {
            const savedState = this.states[state];

            if (!savedState) {
                console.warn(
                    `state "${state}" does not exist within this component:`,
                    this.name
                );
                return;
            }
            if (state === this.currentState) return;
            this.currentState = state;
            if (savedState.onSet) savedState.onSet();
        };
        this.hiddenSphere.setupState({
            state: "hovered",
        });
        this.hiddenSphere.setupState({
            state: "selected",
            onSet: () => {
                if (
                    Helpers.videoSrcExists() &&
                    !this.hiddenSphere.buttonsVisible
                ) {
                    MAIN.playMenuPanel.showPlayMenuPanel();
                } else if (Helpers.videoSrcExists()) {
                    MAIN.playMenuPanel.hidePlayMenuPanel();
                }
            },
        });

        // ScreenManager.registerObjectToDrag(this.hiddenSphere, "player", "meshes");
        // ??????

        return this.hiddenSphere;
    }
}
