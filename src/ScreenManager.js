import * as MAIN from './index.js';

let isVRModeUsed = true;
export let VRMode = "sbs";
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
				ui_name: "meshLeftSBS",
				save_as_name: "meshLeftSBS"
			},
			{
				ui_name: "mesh2dSBS",
				save_as_name: "mesh2dSBS"
			},
			{
				ui_name: "meshRightSBS",
				save_as_name: "meshRightSBS"
			},
			{
				ui_name: "meshForScreenMode",
				save_as_name: "meshForScreenMode"
			},
			{
				ui_name: "meshLeftTB",
				save_as_name: "meshLeftTB"
			},
			{
				ui_name: "mesh2dTB",
				save_as_name: "mesh2dTB"
			},
			{
				ui_name: "meshRightTB",
				save_as_name: "meshRightTB"
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
	currentZoom = MAIN.getCurrentZoom();
	switch (in_or_out) {
		case "in":
			if (currentZoom < 60) {
				for (let mesh in MAIN.meshes) {
					MAIN.meshes[mesh].position.z += step;
				};
			}
			break;
		case "out":
			if (currentZoom > -120) {
				for (let mesh in MAIN.meshes) {
					MAIN.meshes[mesh].position.z -= step;
				};
			}
			break;
		case "reset":
			for (let mesh in MAIN.meshes) {
				MAIN.meshes[mesh].position.z = positionsToSaveForVRExit.meshes[mesh].position.z;
			};
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
			};
			break;
		case "down":
			for (let mesh in MAIN.meshes) {
				MAIN.meshes[mesh].rotation.x += 0.01;
			};
			break;
		case "reset":
			for (let mesh in MAIN.meshes) {
				MAIN.meshes[mesh].rotation.x = positionsToSaveForVRExit.meshes[mesh].rotation.x;
			};
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
		case "sbs":
			MAIN.meshForScreenMode.visible = false;
			MAIN.meshLeftTB.visible = false;
			MAIN.meshRightTB.visible = false;
			MAIN.meshLeftSBS.visible = true;
			MAIN.meshRightSBS.visible = true;
			isVRModeUsed = true;
			VRMode = "sbs";
			break;
		case "tb":
			MAIN.meshForScreenMode.visible = false;
			MAIN.meshLeftSBS.visible = false;
			MAIN.meshRightSBS.visible = false;
			MAIN.meshLeftTB.visible = true;
			MAIN.meshRightTB.visible = true;
			isVRModeUsed = true;
			VRMode = "tb";
			break;
		case "screen":
			MAIN.meshLeftSBS.visible = false;
			MAIN.meshRightSBS.visible = false;
			MAIN.meshLeftTB.visible = false;
			MAIN.meshRightTB.visible = false;
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
				if (VRMode === 'sbs') {
					MAIN.meshRightSBS.visible = false;
					MAIN.mesh2dSBS.visible = true;
				} else if (VRMode === 'tb') {
					MAIN.meshRightTB.visible = false;
					MAIN.mesh2dTB.visible = true;
				}
				currently_3d = false;
				break;
			case "3d":
				if (VRMode === 'sbs') {
					MAIN.meshRightSBS.visible = true;
					MAIN.mesh2dSBS.visible = false;
				} else if (VRMode === 'tb') {
					MAIN.meshRightTB.visible = true;
					MAIN.mesh2dTB.visible = false;
				}
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
