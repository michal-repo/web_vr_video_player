export default class JsonLoader {
    data;
    verifyVideoSRC;

    constructor(json_file, verifyVideoSRC = true) {
        if (typeof json_file === "string") {
            this.verifyVideoSRC = verifyVideoSRC;
            fetch(json_file)
                .then((response) => response.json())
                .then((json) => {
                    window.registerExtension({
                        type: "json_file",
                        name: "Local Files",
                        verifyVideoSRC: true,
                        data: json,
                    });
                    return true;
                })
                .catch((error) => {
                    console.error("Error:", error);
                    return error;
                });
        } else {
            err = "Error: `json_file` must be valid string";
            console.error(err);
            return err;
        }

        return {
            type: "json_file",
            name: "Local Files",
            verifyVideoSRC: this.verifyVideoSRC,
            data: this.data,
        };
    }
}
