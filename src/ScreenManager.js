import * as MAIN from './index.js';

let isVRModeUsed = true;
let currently_3d = true;
export let force_2d_mode = false;
let positionsToSaveForVRExit = {};
let currentZoom = 0;

const panels = [
	{
		name: "cameras",
		panels: [
			{
				ui_name: "camera",
				save_as_name: "camera"
			}
		]
	},
	{
		name: "playMenuPanel",
		panels: [
			{
				ui_name: "playMenuContainer",
				save_as_name: "playMenuContainer"
			},
			{
				ui_name: "settingsMenuContainer",
				save_as_name: "settingsMenuContainer"
			},
			{
				ui_name: "draggingBox",
				save_as_name: "playerDraggingBox"
			},
		]
	},
	{
		name: "meshes",
		panels: [
			{
				ui_name: "mesh1",
				save_as_name: "mesh1"
			},
			{
				ui_name: "mesh1Clone",
				save_as_name: "mesh1Clone"
			},
			{
				ui_name: "mesh2",
				save_as_name: "mesh2"
			},
			{
				ui_name: "meshForScreenMode",
				save_as_name: "meshForScreenMode"
			},
		]
	},
	{
		name: "fileBrowserPanel",
		panels: [
			{
				ui_name: "fileBrowserContainer",
				save_as_name: "fileBrowserContainer"
			},
			{
				ui_name: "foldersContainer",
				save_as_name: "foldersContainer"
			},
			{
				ui_name: "draggingBox",
				save_as_name: "fileBrowserDraggingBox"
			},
		]
	},
];

export function vrsessionend() {
	resetPosition("cameras");
	resetPosition("playMenuPanel");
	resetPosition("fileBrowserPanel");
}

export function savePositions(ui) {
	positionsToSaveForVRExit[ui] = {};
	panels.forEach((element) => {
		if (element.name === ui) {
			positionsToSaveForVRExit[element.name] = {};
			element.panels.forEach((panel) => {
				positionsToSaveForVRExit[element.name][panel.save_as_name] = {};
				positionsToSaveForVRExit[element.name][panel.save_as_name]["position"] = MAIN[element.name][panel.ui_name].position.clone();
				positionsToSaveForVRExit[element.name][panel.save_as_name]["rotation"] = MAIN[element.name][panel.ui_name].rotation.clone();
			});
		}
	});
}

export function resetPosition(ui) {
	panels.forEach((element) => {
		if (element.name === ui) {
			element.panels.forEach((panel) => {
				MAIN[element.name][panel.ui_name].position.set(positionsToSaveForVRExit[element.name][panel.save_as_name]["position"].x, positionsToSaveForVRExit[element.name][panel.save_as_name]["position"].y, positionsToSaveForVRExit[element.name][panel.save_as_name]["position"].z);
				MAIN[element.name][panel.ui_name].rotation.set(positionsToSaveForVRExit[element.name][panel.save_as_name]["rotation"].x, positionsToSaveForVRExit[element.name][panel.save_as_name]["rotation"].y, positionsToSaveForVRExit[element.name][panel.save_as_name]["rotation"].z, positionsToSaveForVRExit[element.name][panel.save_as_name]["rotation"].order);
				positionsToSaveForVRExit[element.name][panel.save_as_name]["rotation"] = MAIN[element.name][panel.ui_name].rotation.clone();
			});
		}
	});
}

export function zoom(in_or_out, step = 10) {
	currentZoom = MAIN.mesh1.position.z;
	switch (in_or_out) {
		case "in":
			if (currentZoom < 60) {
				MAIN.mesh1.position.z += step;
				MAIN.mesh1Clone.position.z += step;
				MAIN.mesh2.position.z += step;
				MAIN.meshForScreenMode.position.z += step;
			}
			break;
		case "out":
			if (currentZoom > -120) {
				MAIN.mesh1.position.z -= step;
				MAIN.mesh1Clone.position.z -= step;
				MAIN.mesh2.position.z -= step;
				MAIN.meshForScreenMode.position.z -= step;
			}
			break;
		case "reset":
			MAIN.mesh1.position.z = positionsToSaveForVRExit.meshes.mesh1.position.z;
			MAIN.mesh1Clone.position.z = positionsToSaveForVRExit.meshes.mesh1Clone.position.z;
			MAIN.mesh2.position.z = positionsToSaveForVRExit.meshes.mesh2.position.z;
			MAIN.meshForScreenMode.position.z = positionsToSaveForVRExit.meshes.meshForScreenMode.position.z;
			break;
		default:
			break;
	}
}

export function tilt(up_or_down) {
	switch (up_or_down) {
		case "up":
			MAIN.mesh1.rotation.x -= 0.01;
			MAIN.mesh1Clone.rotation.x -= 0.01;
			MAIN.mesh2.rotation.x -= 0.01;
			MAIN.meshForScreenMode.rotation.x -= 0.01;
			break;
		case "down":
			MAIN.mesh1.rotation.x += 0.01;
			MAIN.mesh1Clone.rotation.x += 0.01;
			MAIN.mesh2.rotation.x += 0.01;
			MAIN.meshForScreenMode.rotation.x += 0.01;
			break;
		case "reset":
			MAIN.mesh1.rotation.x = positionsToSaveForVRExit.meshes.mesh1.rotation.x;
			MAIN.mesh1Clone.rotation.x = positionsToSaveForVRExit.meshes.mesh1Clone.rotation.x;
			MAIN.mesh2.rotation.x = positionsToSaveForVRExit.meshes.mesh2.rotation.x;
			MAIN.meshForScreenMode.rotation.x = positionsToSaveForVRExit.meshes.meshForScreenMode.rotation.x;
			break;
		default:
			break;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Switch between VR and Screen mode

export function switchModeVRScreen(vr_or_screen) {
	if (!currently_3d) {
		switch2d3d("3d", true);
	}
	switch (vr_or_screen) {
		case "vr":
			MAIN.meshForScreenMode.visible = false;
			MAIN.mesh1.visible = true;
			MAIN.mesh2.visible = true;
			isVRModeUsed = true;
			break;
		case "screen":
			MAIN.mesh1.visible = false;
			MAIN.mesh2.visible = false;
			MAIN.meshForScreenMode.visible = true;
			isVRModeUsed = false;
			break;
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Switch between 2D and 3D mode

export function switch2d3d(switch_2d_or_3d, forced = false) {
	if (isVRModeUsed && (!force_2d_mode || forced)) {
		switch (switch_2d_or_3d) {
			case "2d":
				MAIN.mesh2.visible = false;
				MAIN.mesh1Clone.visible = true;
				currently_3d = false;
				break;
			case "3d":
				MAIN.mesh1Clone.visible = false;
				MAIN.mesh2.visible = true;
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
	if (MAIN.renderer.xr.isPresenting && !dragging && view in MAIN.objectsToRecenter) {
		MAIN.objectsToRecenter[view].forEach((obj) => {
			MAIN.vrControl.controllers[MAIN.vrControlCurrentlyUsedController].attach(obj);
		});
		dragging = true;
	}
}

export function stopDrag(view) {
	if (MAIN.renderer.xr.isPresenting && dragging && view in MAIN.objectsToRecenter) {
		MAIN.objectsToRecenter[view].forEach((obj) => {
			MAIN.scene.attach(obj);
		});
		dragging = false;
	}
}
