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

export let scene, camera, renderer, controls, vrControl, vrControlCurrentlyUsedController, gamepad, video, video_src, videoTexture, mesh1, mesh2, mesh1Clone, meshForScreenMode;
export let clickedButton = undefined;
export let playMenuPanel;
export let fileBrowserPanel;
export let camToSave = {};

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

	renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
	renderer.localClippingEnabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	document.body.appendChild(VRButton.createButton(renderer));
	document.body.appendChild(renderer.domElement);

	// Orbit controls for no-vr

	controls = new OrbitControls(camera, renderer.domElement);
	controls.target = new THREE.Vector3(0, 1, -1.8);

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

	// left

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
	scene.add(mesh1);

	// mesh for 2d

	mesh1Clone = mesh1.clone();
	mesh1Clone.layers.set(2);
	mesh1Clone.visible = false;
	scene.add(mesh1Clone);

	// right

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
	scene.add(mesh2);

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

	fetch("files.json")
		.then(response => response.json())
		.then(json => fileBrowserPanel = new FileBrowserPanel(json)).then(a => fileBrowserPanel.showFileMenuPanel(true))
		.catch((error) => {
			console.error('Error:', error);
			alert('Failed parsing json file, check console for details.');
		});


	/////////////////////////////////////////////////////////////

	// save current camera position
	camToSave.position = camera.position.clone();
	camToSave.rotation = camera.rotation.clone();
	camToSave.controlCenter = controls.target.clone();

	ScreenManager.saveMeshPositionAndRotation();

	// register listeners on XR session start
	// change panels positions in VR
	renderer.xr.addEventListener('sessionstart', ScreenManager.vrsessionstart);

	renderer.xr.addEventListener('sessionend', ScreenManager.vrsessionend);

	renderer.setAnimationLoop(loop);

}

// Handle resizing the viewport

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

}

//

let everyXframesUpdateProgBar = 0;
let gamepadControlsUpdateInit = 0;
let gamepadFFRewActive = false;

function gamepadControlsUpdate() {
	if (renderer.xr.isPresenting && renderer.xr.getSession() !== null && typeof renderer.xr.getSession().inputSources !== 'undefined' && renderer.xr.getSession().inputSources.length >= 1) {
		gamepad = renderer.xr.getSession().inputSources[vrControlCurrentlyUsedController].gamepad;
		if (typeof gamepad !== 'undefined') {
			if (gamepad.axes[2] > 0.35 && gamepadFFRewActive == false) {
				playMenuPanel.videoPlaybackFFRew("FF", 10);
				gamepadFFRewActive = true;
			} else if (gamepad.axes[2] < -0.35 && gamepadFFRewActive == false) {
				playMenuPanel.videoPlaybackFFRew("Rew", 10);
				gamepadFFRewActive = true;
			} else if (gamepad.axes[3] > 0.35) {
				ScreenManager.zoom("out", 0.2);
			} else if (gamepad.axes[3] < -0.35) {
				ScreenManager.zoom("in", 0.2);
			} else if (gamepad.axes[2] < 0.15 && gamepad.axes[2] > -0.15) {
				gamepadFFRewActive = false;
			}
		}
	}
}

function loop() {

	// Don't forget, ThreeMeshUI must be updated manually.
	// This has been introduced in version 3.0.0 in order
	// to improve performance
	ThreeMeshUI.update();

	controls.update();

	// Check gamepad after 120 frames
	if (gamepadControlsUpdateInit >= 120) {
		gamepadControlsUpdate();
	} else {
		gamepadControlsUpdateInit++;
	}

	renderer.render(scene, camera);

	updateButtons();

	// progressbar and duration time

	if (everyXframesUpdateProgBar++ >= 15) {
		playMenuPanel.progressBarAndDuration();
		everyXframesUpdateProgBar = 0;
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

		const intersection = raycaster.intersectObject(obj, true);

		if (!intersection[0]) return closestIntersection;

		if (!closestIntersection || intersection[0].distance < closestIntersection.distance) {

			intersection[0].object = obj;

			return intersection[0];

		}

		return closestIntersection;

	}, null);

}

if (WebGL.isWebGLAvailable()) {
	window.addEventListener('resize', onWindowResize);
	init();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.body.appendChild(warning);
}