import * as MAIN from './index.js';

let isVRModeUsed = true;
let currently_3d = true;
export let force_2d_mode = false;
let positionsToSaveForVRExit = {};
let positionsToResetZoomTilt = {};
let currentZoom = 0;

export function saveMeshPositionAndRotation() {
	positionsToResetZoomTilt = {
		mesh1: {
			position: { z: MAIN.mesh1.position.z },
			rotation: { x: MAIN.mesh1.rotation.x }
		},
		mesh1Clone: {
			position: { z: MAIN.mesh1Clone.position.z },
			rotation: { x: MAIN.mesh1Clone.rotation.x }
		},
		mesh2: {
			position: { z: MAIN.mesh2.position.z },
			rotation: { x: MAIN.mesh2.rotation.x }
		},
		meshForScreenMode: {
			position: { z: MAIN.meshForScreenMode.position.z },
			rotation: { x: MAIN.meshForScreenMode.rotation.x }
		}
	};
}

export function vrsessionstart() {
	positionsToSaveForVRExit.camera_position = MAIN.camera.position.clone();
	positionsToSaveForVRExit.playMenuContainer_position = MAIN.playMenuPanel.playMenuContainer.position.clone();
	positionsToSaveForVRExit.playMenuContainer_rotation = MAIN.playMenuPanel.playMenuContainer.rotation.clone();
	positionsToSaveForVRExit.settingsMenuContainer_position = MAIN.playMenuPanel.settingsMenuContainer.position.clone();
	positionsToSaveForVRExit.settingsMenuContainer_rotation = MAIN.playMenuPanel.settingsMenuContainer.rotation.clone();
	positionsToSaveForVRExit.fileBrowserContainer_position = MAIN.fileBrowserPanel.fileBrowserContainer.position.clone();
	positionsToSaveForVRExit.fileBrowserContainer_rotation = MAIN.fileBrowserPanel.fileBrowserContainer.rotation.clone();
	positionsToSaveForVRExit.foldersContainer_position = MAIN.fileBrowserPanel.foldersContainer.position.clone();
	positionsToSaveForVRExit.foldersContainer_rotation = MAIN.fileBrowserPanel.foldersContainer.rotation.clone();
}

export function vrsessionend() {
	MAIN.camera.position.set(positionsToSaveForVRExit.camera_position.x, positionsToSaveForVRExit.camera_position.y, positionsToSaveForVRExit.camera_position.z);
	MAIN.playMenuPanel.playMenuContainer.position.set(positionsToSaveForVRExit.playMenuContainer_position.x, positionsToSaveForVRExit.playMenuContainer_position.y, positionsToSaveForVRExit.playMenuContainer_position.z);
	MAIN.playMenuPanel.playMenuContainer.rotation.set(positionsToSaveForVRExit.playMenuContainer_rotation.x, positionsToSaveForVRExit.playMenuContainer_rotation.y, positionsToSaveForVRExit.playMenuContainer_rotation.z, positionsToSaveForVRExit.playMenuContainer_rotation.order);
	MAIN.playMenuPanel.settingsMenuContainer.position.set(positionsToSaveForVRExit.settingsMenuContainer_position.x, positionsToSaveForVRExit.settingsMenuContainer_position.y, positionsToSaveForVRExit.settingsMenuContainer_position.z);
	MAIN.playMenuPanel.settingsMenuContainer.rotation.set(positionsToSaveForVRExit.settingsMenuContainer_rotation.x, positionsToSaveForVRExit.settingsMenuContainer_rotation.y, positionsToSaveForVRExit.settingsMenuContainer_rotation.z, positionsToSaveForVRExit.settingsMenuContainer_rotation.order);
	MAIN.fileBrowserPanel.fileBrowserContainer.position.set(positionsToSaveForVRExit.fileBrowserContainer_position.x, positionsToSaveForVRExit.fileBrowserContainer_position.y, positionsToSaveForVRExit.fileBrowserContainer_position.z);
	MAIN.fileBrowserPanel.fileBrowserContainer.rotation.set(positionsToSaveForVRExit.fileBrowserContainer_rotation.x, positionsToSaveForVRExit.fileBrowserContainer_rotation.y, positionsToSaveForVRExit.fileBrowserContainer_rotation.z, positionsToSaveForVRExit.fileBrowserContainer_rotation.order);
	MAIN.fileBrowserPanel.foldersContainer.position.set(positionsToSaveForVRExit.foldersContainer_position.x, positionsToSaveForVRExit.foldersContainer_position.y, positionsToSaveForVRExit.foldersContainer_position.z);
	MAIN.fileBrowserPanel.foldersContainer.rotation.set(positionsToSaveForVRExit.foldersContainer_rotation.x, positionsToSaveForVRExit.foldersContainer_rotation.y, positionsToSaveForVRExit.foldersContainer_rotation.z, positionsToSaveForVRExit.foldersContainer_rotation.order);
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
			MAIN.mesh1.position.z = positionsToResetZoomTilt.mesh1.position.z;
			MAIN.mesh1Clone.position.z = positionsToResetZoomTilt.mesh1Clone.position.z;
			MAIN.mesh2.position.z = positionsToResetZoomTilt.mesh2.position.z;
			MAIN.meshForScreenMode.position.z = positionsToResetZoomTilt.meshForScreenMode.position.z;
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
			MAIN.mesh1.rotation.x = positionsToResetZoomTilt.mesh1.rotation.x;
			MAIN.mesh1Clone.rotation.x = positionsToResetZoomTilt.mesh1Clone.rotation.x;
			MAIN.mesh2.rotation.x = positionsToResetZoomTilt.mesh2.rotation.x;
			MAIN.meshForScreenMode.rotation.x = positionsToResetZoomTilt.meshForScreenMode.rotation.x;
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
// Recenter

export async function recenter() {
	if (MAIN.renderer.xr.isPresenting) {
		// Exit and enter VR session
		let session = MAIN.renderer.xr.getSession();
		let buttonVR = document.getElementById("VRButton");
		await session.end();
		buttonVR.click();
	} else {
		restoreCamera(MAIN.camToSave.position, MAIN.camToSave.rotation, MAIN.camToSave.controlCenter);
	}
}


function restoreCamera(position, rotation, controlCenter) {
	MAIN.camera.position.set(position.x, position.y, position.z);
	MAIN.camera.rotation.set(rotation.x, rotation.y, rotation.z);

	MAIN.controls.target.set(controlCenter.x, controlCenter.y, controlCenter.z);
	MAIN.controls.update();
}