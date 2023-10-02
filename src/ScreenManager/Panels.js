import * as MAIN from '../index.js';

export default class PanelsList {
    cameras
    playMenuPanel
    meshes
    fileBrowserPanel

    constructor() {
        this.cameras = new Panels();
        this.playMenuPanel = new Panels();
        this.meshes = new Panels();
        this.fileBrowserPanel = new Panels();
    }

    addPanel(panel, ui_name, save_as_name) {
        this[panel].panels.push(new Panel(ui_name, save_as_name));
    }

    addMesh(ui_name, save_as_name, mode, screen_type, eye) {
        this.meshes.panels.push(new MeshPanel(ui_name, save_as_name, mode, screen_type, eye));
    }
}

class Panels {
    panels

    constructor() {
        this.panels = [];
    }
}

class Panel {
    ui_name
    save_as_name

    constructor(ui_name, save_as_name) {
        this.ui_name = ui_name;
        this.save_as_name = save_as_name;
    }
}

class MeshPanel {
    ui_name
    save_as_name
    mode
    screen_type
    eye

    constructor(ui_name, save_as_name, mode, screen_type, eye) {
        this.ui_name = ui_name;
        this.save_as_name = save_as_name;
        this.mode = mode;
        this.screen_type = screen_type;
        this.eye = eye;
    }

    switchModeVRScreen(vr_or_screen) {
        if (this.screen_type === vr_or_screen) {
            MAIN[this.ui_name].visible = true;
        } else {
            MAIN[this.ui_name].visible = false;
        }
    }

    switch2d3d(switch_2d_or_3d, VRMode) {
        if ((this.mode === switch_2d_or_3d && this.screen_type === VRMode)
            || (this.screen_type === VRMode && this.eye === 'left')) {
            MAIN[this.ui_name].visible = true;
        } else {
            MAIN[this.ui_name].visible = false;
        }
    }
}