import * as MAIN from "../index.js";
import PanelsList from "./Panels.js";

let isVRModeUsed = true;
export let VRMode = "sbs";
let currently_3d = true;
export let force_2d_mode = false;
let positionsToSaveForVRExit = {};
let currentZoom = 0;

const panels = new PanelsList();

export function registerPanel(container, ui_name, save_as_name) {
    panels.addPanel(container, ui_name, save_as_name);
}

export function registerMeshPanel(
    ui_name,
    save_as_name,
    mode,
    screen_type,
    eye
) {
    panels.addMesh(ui_name, save_as_name, mode, screen_type, eye);
}

export function vrsessionend() {
    resetPosition("cameras");
    resetPosition("playMenuPanel");
    resetPosition("fileBrowserPanel");
}

export function savePositions(ui) {
    positionsToSaveForVRExit[ui] = {};
    for (const [name, elements] of Object.entries(panels)) {
        if (name === ui) {
            positionsToSaveForVRExit[name] = {};
            elements.panels.forEach((panel) => {
                positionsToSaveForVRExit[name][panel.save_as_name] = {};
                positionsToSaveForVRExit[name][panel.save_as_name]["position"] =
                    MAIN[name][panel.ui_name].position.clone();
                positionsToSaveForVRExit[name][panel.save_as_name]["rotation"] =
                    MAIN[name][panel.ui_name].rotation.clone();
            });
        }
    }
}

export function resetPosition(ui) {
    for (const [name, elements] of Object.entries(panels)) {
        if (name === ui) {
            elements.panels.forEach((panel) => {
                MAIN[name][panel.ui_name].position.set(
                    positionsToSaveForVRExit[name][panel.save_as_name][
                        "position"
                    ].x,
                    positionsToSaveForVRExit[name][panel.save_as_name][
                        "position"
                    ].y,
                    positionsToSaveForVRExit[name][panel.save_as_name][
                        "position"
                    ].z
                );
                MAIN[name][panel.ui_name].rotation.set(
                    positionsToSaveForVRExit[name][panel.save_as_name][
                        "rotation"
                    ].x,
                    positionsToSaveForVRExit[name][panel.save_as_name][
                        "rotation"
                    ].y,
                    positionsToSaveForVRExit[name][panel.save_as_name][
                        "rotation"
                    ].z,
                    positionsToSaveForVRExit[name][panel.save_as_name][
                        "rotation"
                    ].order
                );
                positionsToSaveForVRExit[name][panel.save_as_name]["rotation"] =
                    MAIN[name][panel.ui_name].rotation.clone();
            });
        }
    }
}

export function zoom(in_or_out, step = 10) {
    currentZoom = MAIN.getCurrentZoom();
    switch (in_or_out) {
        case "in":
            if (currentZoom < 60) {
                for (let mesh in MAIN.meshes) {
                    MAIN.meshes[mesh].position.z += step;
                }
            }
            break;
        case "out":
            if (currentZoom > -120) {
                for (let mesh in MAIN.meshes) {
                    MAIN.meshes[mesh].position.z -= step;
                }
            }
            break;
        case "reset":
            for (let mesh in MAIN.meshes) {
                MAIN.meshes[mesh].position.z =
                    positionsToSaveForVRExit.meshes[mesh].position.z;
            }
            break;
        default:
            break;
    }
}

export function tilt(up_or_down) {
    switch (up_or_down) {
        case "up":
            for (let mesh in MAIN.meshes) {
                MAIN.meshes[mesh].rotation.x -= 0.01;
            }
            break;
        case "down":
            for (let mesh in MAIN.meshes) {
                MAIN.meshes[mesh].rotation.x += 0.01;
            }
            break;
        case "reset":
            for (let mesh in MAIN.meshes) {
                MAIN.meshes[mesh].rotation.x =
                    positionsToSaveForVRExit.meshes[mesh].rotation.x;
            }
            break;
        default:
            break;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Switch between VR and Screen mode

export function switchModeVRScreen(vr_or_screen) {
	console.log(vr_or_screen);
    if (!currently_3d) {
        switch2d3d("3d", true);
    }
    panels.meshes.panels.forEach((mesh) => {
        mesh.switchModeVRScreen(vr_or_screen);
    });
    switch (vr_or_screen) {
        case "vr":
        case "sbs":
            isVRModeUsed = true;
            VRMode = "sbs";
            break;
        case "tb":
            isVRModeUsed = true;
            VRMode = "tb";
            break;
        case "360":
            isVRModeUsed = true;
            VRMode = "360";
            break;
        case "sphere180":
            VRMode = "sphere180";
            isVRModeUsed = false;
			break;
        case "sphere360":
            VRMode = "sphere360";
            isVRModeUsed = false;
			break;
        case "screen":
            isVRModeUsed = false;
            break;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Switch between 2D and 3D mode

export function switch2d3d(switch_2d_or_3d, forced = false) {
    if (isVRModeUsed && (!force_2d_mode || forced)) {
        panels.meshes.panels.forEach((mesh) => {
            mesh.switch2d3d(switch_2d_or_3d, VRMode);
        });
        switch (switch_2d_or_3d) {
            case "2d":
                currently_3d = false;
                break;
            case "3d":
                currently_3d = true;
                break;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Force 2D mode

export function force2DMode(bool) {
    force_2d_mode = bool;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export let dragging = false;

export function startDrag(view) {
    if (
        MAIN.renderer.xr.isPresenting &&
        !dragging &&
        view in MAIN.objectsToDrag
    ) {
        MAIN.objectsToDrag[view].forEach((obj) => {
            MAIN.vrControl.controllers[
                MAIN.vrControlCurrentlyUsedController
            ].attach(obj);
        });
        dragging = true;
    }
}

export function stopDrag(view) {
    if (
        MAIN.renderer.xr.isPresenting &&
        dragging &&
        view in MAIN.objectsToDrag
    ) {
        MAIN.objectsToDrag[view].forEach((obj) => {
            MAIN.scene.attach(obj);
        });
        dragging = false;
    }
}
