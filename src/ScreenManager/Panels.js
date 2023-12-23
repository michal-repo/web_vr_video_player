import * as MAIN from "../index.js";

export default class PanelsList {
    cameras;
    playMenuPanel;
    meshes;
    fileBrowserPanel;
    sourcesSelectorPanel;

    constructor() {
        this.cameras = new Panels();
        this.playMenuPanel = new Panels();
        this.meshes = new Panels();
        this.fileBrowserPanel = new Panels();
        this.sourcesSelectorPanel = new Panels();
    }

    addPanel(ref, panel, ui_name, save_as_name) {
        this[panel].panels.push(new Panel(ref, ui_name, save_as_name));
    }

    addMesh(ref, ui_name, save_as_name, mode, screen_type, eye) {
        this.meshes.panels.push(
            new MeshPanel(ref, ui_name, save_as_name, mode, screen_type, eye)
        );
    }
}

class Panels {
    panels;

    constructor() {
        this.panels = [];
    }
}

class Panel {
    ui_name;
    save_as_name;
    reference;
    position;
    rotation;

    constructor(ref, ui_name, save_as_name) {
        this.reference = ref;
        this.position = ref.position.clone();
        this.rotation = ref.rotation.clone();
        this.ui_name = ui_name;
        this.save_as_name = save_as_name;
    }
}

class MeshPanel extends Panel {
    mode;
    screen_type;
    eye;

    constructor(ref, ui_name, save_as_name, mode, screen_type, eye) {
        super(ref, ui_name, save_as_name);
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
        if (
            (this.mode === switch_2d_or_3d && this.screen_type === VRMode) ||
            (this.screen_type === VRMode && this.eye === "left")
        ) {
            MAIN[this.ui_name].visible = true;
        } else {
            MAIN[this.ui_name].visible = false;
        }
    }
}
