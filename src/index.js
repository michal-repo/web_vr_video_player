import * as THREE from '../node_modules/three/build/three.module.js';
import { VRButton } from '../node_modules/three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

import WebGL from '../node_modules/three/examples/jsm/capabilities/WebGL.js';

import ThreeMeshUI from '../node_modules/three-mesh-ui/build/three-mesh-ui.module.js';
import VRControl from '../node_modules/three-mesh-ui/examples/utils/VRControl.js';

import { PlayerPanel } from './PlayerPanelUI.js';
import { FileBrowserPanel } from './FileBrowserPanelUI.js';
import * as ScreenManager from './ScreenManager.js';
import * as UI from './UI.js';

export let scene, camera, cameras, renderer, orbitControls, vrControl, vrControlCurrentlyUsedController, gamepad, video, video_src, videoTexture, mesh1, mesh2, mesh1Clone, meshForScreenMode, meshes;
export let clickedButton = undefined;
export let playMenuPanel;
export let fileBrowserPanel;
export let camToSave = {};
export const objectsToRecenter = {};

let popupMessage, popupContainer;
import FontJSON from '../assets/fonts/Roboto-Regular-msdf.json';
import FontImage from '../assets/fonts/Roboto-Regular.png';

export let hiddenSphere;
const CAMERAPOSITIONY = 1.6;

// compute mouse position in normalized device coordinates
// (-1 to +1) for both directions.
// Used to raycasting against the interactive elements

const raycaster = new THREE.Raycaster();
raycaster.layers.set(0);

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

window.addEventListener('pointermove', (event) => {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('pointerdown', () => {
	selectState = true;
});

window.addEventListener('pointerup', () => {
	selectState = false;
	clickedButton = undefined;
});

window.addEventListener('touchstart', (event) => {
	selectState = true;
	mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('touchend', () => {
	selectState = false;
	clickedButton = undefined;
	mouse.x = null;
	mouse.y = null;
});

//

function init() {

	////////////////////////
	//  Basic Three Setup
	////////////////////////

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x101010);

	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
	camera.layers.enable(1);
	camera.position.y = CAMERAPOSITIONY;
	scene.add(camera);
	cameras = { camera: camera };

	renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
	renderer.localClippingEnabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	document.body.appendChild(VRButton.createButton(renderer));
	document.body.appendChild(renderer.domElement);

	// Orbit controls for no-vr

	orbitControls = new OrbitControls(camera, renderer.domElement);
	orbitControls.target = new THREE.Vector3(0, 1, -1.8);

	/////////
	// Room
	/////////

	video = document.getElementById('video');

	videoTexture = new THREE.VideoTexture(video);

	// screen mode

	const geometryScreen = new THREE.SphereGeometry(120, 60, 40, (Math.PI / 16 + Math.PI / 4 + Math.PI), (Math.PI / 4 + Math.PI / 8), (Math.PI / 4 + Math.PI / 8), Math.PI / 4);
	// invert the geometry on the x-axis so that all of the faces point inward
	geometryScreen.scale(- 1, 1, 1);

	const materialScreen = new THREE.MeshBasicMaterial({ map: videoTexture });

	meshForScreenMode = new THREE.Mesh(geometryScreen, materialScreen);
	meshForScreenMode.visible = false;
	scene.add(meshForScreenMode);

	// left eye

	const geometry1 = new THREE.SphereGeometry(120, 60, 40, Math.PI, Math.PI);
	// invert the geometry on the x-axis so that all of the faces point inward
	geometry1.scale(- 1, 1, 1);

	const uvs1 = geometry1.attributes.uv.array;

	for (let i = 0; i < uvs1.length; i += 2) {

		uvs1[i] *= 0.5;

	}

	const material1 = new THREE.MeshBasicMaterial({ map: videoTexture });

	mesh1 = new THREE.Mesh(geometry1, material1);
	mesh1.layers.set(1); // display in left eye only
	mesh1.visible = false;
	scene.add(mesh1);

	// mesh for 2d mode

	mesh1Clone = mesh1.clone();
	mesh1Clone.layers.set(2);
	mesh1Clone.visible = false;
	scene.add(mesh1Clone);

	// right eye

	const geometry2 = new THREE.SphereGeometry(120, 60, 40, Math.PI, Math.PI);
	geometry2.scale(- 1, 1, 1);

	const uvs2 = geometry2.attributes.uv.array;

	for (let i = 0; i < uvs2.length; i += 2) {

		uvs2[i] *= 0.5;
		uvs2[i] += 0.5;

	}

	const material2 = new THREE.MeshBasicMaterial({ map: videoTexture });

	mesh2 = new THREE.Mesh(geometry2, material2);
	mesh2.layers.set(2); // display in right eye only
	mesh2.visible = false;
	scene.add(mesh2);


	registerObjectToRecenter(mesh1, "player");
	registerObjectToRecenter(mesh2, "player");
	registerObjectToRecenter(mesh1Clone, "player");
	registerObjectToRecenter(meshForScreenMode, "player");
	meshes = { mesh1: mesh1, mesh2: mesh2, mesh1Clone: mesh1Clone, meshForScreenMode: meshForScreenMode };

	//////////
	// Light
	//////////

	const color = 0xFFFFFF;
	const intensity = 1;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 2, 4);
	scene.add(light);

	////////////////
	// Controllers
	////////////////

	vrControl = VRControl(renderer);
	vrControlCurrentlyUsedController = 0;
	scene.add(vrControl.controllerGrips[0], vrControl.controllers[0]);
	scene.add(vrControl.controllerGrips[1], vrControl.controllers[1]);

	vrControl.controllers[0].addEventListener('selectstart', () => {

		vrControlSelected(0);

	});
	vrControl.controllers[0].addEventListener('selectend', () => {

		vrControlUnselected(0);

	});

	vrControl.controllers[1].addEventListener('selectstart', () => {

		vrControlSelected(1);

	});
	vrControl.controllers[1].addEventListener('selectend', () => {

		vrControlUnselected(1);

	});

	function vrControlSelected(id) {
		if (vrControlCurrentlyUsedController == id) {
			selectState = true;
		} else {
			vrControl.controllers[vrControlCurrentlyUsedController].point.visible = false;
			vrControlCurrentlyUsedController = id;
		}
	}

	function vrControlUnselected(id) {
		if (vrControlCurrentlyUsedController == id) {
			selectState = false;
			clickedButton = undefined;
		}
	}

	//////////
	// Panel
	//////////

	hiddenSphere = new UI.HiddenSphere();
	scene.add(hiddenSphere);
	UI.objsToTest.push(hiddenSphere);
	playMenuPanel = new PlayerPanel(video);

	let json_file = document.getElementById('json_file').innerText;

	fetch(json_file)
		.then(response => response.json())
		.then(json => fileBrowserPanel = new FileBrowserPanel(json))
		.then(a => fileBrowserPanel.showFileMenuPanel())
		.then(a => ScreenManager.savePositions("fileBrowserPanel"))
		.catch((error) => {
			console.error('Error:', error);
			alert('Failed parsing json file, check console for details.');
		});



	////////////////////////////////////////
	popupContainer = new ThreeMeshUI.Block({
		justifyContent: 'center',
		contentDirection: 'row',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.02,
		borderRadius: 0,
		backgroundOpacity: 1,
		backgroundColor: new THREE.Color(0x0099ff),
		height: 0.20,
		width: 2
	});
	popupMessage = new ThreeMeshUI.Text({
		content: '',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		offset: 0.035,
		fontColor: new THREE.Color(0xffffff)
	});
	popupContainer.add(popupMessage);
	popupContainer.position.set(0, 1, -2);
	popupContainer.visible = false;
	scene.add(popupContainer);
	////////////////////////////////////////

	/////////////////////////////////////////////////////////////

	// save current camera position
	camToSave.position = camera.position.clone();
	camToSave.rotation = camera.rotation.clone();
	camToSave.controlCenter = orbitControls.target.clone();

	ScreenManager.savePositions("cameras");
	ScreenManager.savePositions("meshes");
	ScreenManager.savePositions("playMenuPanel");

	// register listeners on XR session start
	// change panels positions in VR
	// renderer.xr.addEventListener('sessionstart', ScreenManager.vrsessionstart);

	renderer.xr.addEventListener('sessionend', ScreenManager.vrsessionend);

	renderer.setAnimationLoop(loop);

}

let showPopupTimeoutID;

export function showPopupMessage(message) {
	if (typeof message === "string") {
		popupMessage.set({ content: message });
		popupContainer.visible = true;
		clearTimeout(showPopupTimeoutID);
		showPopupTimeoutID = setTimeout(() => {
			popupContainer.visible = false;
		}, 4000);
	} else {
		console.warn("Error in showPopupMessage, message must be string");
	}
}

function showMeshes3D() {
	mesh1.visible = true;
	mesh2.visible = true;
}

function hideMeshes() {
	mesh1.visible = false;
	mesh2.visible = false;
	meshForScreenMode.visible = false;
	mesh1Clone.visible = false;
}

// Handle resizing the viewport

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

}

//

const everyXframesUpdateProgBar = 15;
let everyXframesUpdateProgBarInt = 0;
let gamepadAxisActive = false;
export let playbackIsActive = false;

export function playbackChange(is_active = false, screen_type = null) {
	switch (is_active) {
		case true:
			playbackIsActive = true;
			showMeshes3D();
			if (screen_type !== null && screen_type === "screen") {
				ScreenManager.switchModeVRScreen("screen");
			}
			playMenuPanel.buttonPlay.playbackStarted();
			if (everyXframesUpdateProgBarInt < everyXframesUpdateProgBar) {
				playMenuPanel.progressBarAndDuration();
			}
			break;
		default:
		case false:
			playbackIsActive = false;
			hideMeshes();
			break;
	}
}

function gamepadControlsUpdate() {
	if (renderer.xr.isPresenting) {
		if (renderer.xr.getSession() !== null) {
			if (typeof renderer.xr.getSession().inputSources !== 'undefined' && renderer.xr.getSession().inputSources.length >= 1) {
				if (renderer.xr.getSession().inputSources.length >= 1) {
					gamepad = renderer.xr.getSession().inputSources[vrControlCurrentlyUsedController].gamepad;
					if (typeof gamepad !== 'undefined' && gamepad !== null) {
						if (gamepad.mapping === "xr-standard") {
							if (gamepad.axes[2] > 0.35 && gamepadAxisActive === false) {
								if (playbackIsActive) {
									playMenuPanel.videoPlaybackFFRew("FF", 10);
								} else {
									fileBrowserPanel.NextPage();
								}
								gamepadAxisActive = true;
							} else if (gamepad.axes[2] < -0.35 && gamepadAxisActive === false) {
								if (playbackIsActive) {
									playMenuPanel.videoPlaybackFFRew("Rew", 10);
								} else {
									fileBrowserPanel.PreviousPage();
								}
								gamepadAxisActive = true;
							} else if (gamepad.axes[3] > 0.35 && (gamepadAxisActive === false || gamepadAxisActive === "down")) {
								if (playbackIsActive) {
									ScreenManager.zoom("out", 0.2);
								}
								gamepadAxisActive = "down";
							} else if (gamepad.axes[3] < -0.35 && (gamepadAxisActive === false || gamepadAxisActive === "up")) {
								if (playbackIsActive) {
									ScreenManager.zoom("in", 0.2);
								}
								gamepadAxisActive = "up";
							} else if (gamepad.axes[2] < 0.35 && gamepad.axes[2] > -0.35) {
								gamepadAxisActive = false;
								gamepadButtonsCheck(gamepad.buttons);
							}
						}
					}
				}
			}
		}
	}
}

let buttonABXYpressed = false;

function gamepadButtonsCheck(buttons) {
	if (buttons[4].pressed && playbackIsActive && buttonABXYpressed === false) {
		playMenuPanel.playPause();
		buttonABXYpressed = true;
	} else if (buttons[5].pressed && playbackIsActive && buttonABXYpressed === false) {
		playMenuPanel.ExitToMain();
		buttonABXYpressed = true;
	} else if (!buttons[4].pressed && !buttons[5].pressed) {
		buttonABXYpressed = false;
	}
}

function loop() {

	// Don't forget, ThreeMeshUI must be updated manually.
	// This has been introduced in version 3.0.0 in order
	// to improve performance
	ThreeMeshUI.update();

	orbitControls.update();

	gamepadControlsUpdate();

	renderer.render(scene, camera);

	updateButtons();

	// progressbar and duration time
	if (everyXframesUpdateProgBarInt++ >= everyXframesUpdateProgBar) {
		playMenuPanel.progressBarAndDuration();
		everyXframesUpdateProgBarInt = 0;
	}

}

// Called in the loop, get intersection with either the mouse or the VR controllers,
// then update the buttons states according to result

function updateButtons() {

	// Find closest intersecting object

	let intersect;

	if (renderer.xr.isPresenting) {

		vrControl.setFromController(vrControlCurrentlyUsedController, raycaster.ray);

		intersect = raycast();

		// Position the little white dot at the end of the controller pointing ray
		// need to skip this if intersecting hiddenSphere because in VR it spreads points apart 
		if (intersect && intersect.object.name != hiddenSphere.name) {
			vrControl.setPointerAt(vrControlCurrentlyUsedController, intersect.point);
		};

	} else if (mouse.x !== null && mouse.y !== null) {

		raycaster.setFromCamera(mouse, camera);

		intersect = raycast();

	}

	// Update targeted button state (if any)

	if (intersect && intersect.object.isUI) {

		intersect.object.uv = { x: intersect.uv.x, y: intersect.uv.y };

		if (selectState) {
			if (clickedButton === undefined || clickedButton == intersect.object.uuid) {
				// Component.setState internally call component.set with the options you defined in component.setupState
				clickedButton = intersect.object.uuid;
				intersect.object.setState('selected');
			}
		} else {
			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState('hovered');
		}

	}

	// Update non-targeted buttons state

	UI.objsToTest.forEach((obj) => {

		if ((obj instanceof ThreeMeshUI.Block) && ((!intersect || obj !== intersect.object) && obj.isUI)) {
			// Component.setState internally call component.set with the options you defined in component.setupState
			if (obj.muted) {
				obj.setState('idlemuted');
			} else {
				obj.setState('idle');
			}

		}

	});

}

//

function raycast() {

	return UI.objsToTest.reduce((closestIntersection, obj) => {

		// Keyboard
		if (obj.type === 'Key' && fileBrowserPanel !== undefined && !fileBrowserPanel.keyboard.getObjectById(obj.id)) {

			return closestIntersection;

		}

		const intersection = raycaster.intersectObject(obj, true);

		if (!intersection[0]) return closestIntersection;

		if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {

			intersection[0].object = obj;

			return intersection[0];

		}

		return closestIntersection;

	}, null);

}

export function registerObjectToRecenter(obj, view) {
	if (!(view in objectsToRecenter)) {
		objectsToRecenter[view] = [];
	}
	objectsToRecenter[view].push(obj);
}

if (WebGL.isWebGLAvailable()) {
	window.addEventListener('resize', onWindowResize);
	init();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.body.appendChild(warning);
}