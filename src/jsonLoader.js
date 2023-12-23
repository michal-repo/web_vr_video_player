export default class JsonLoader {
    data;
    verifyVideoSRC;
    name;

    constructor(json_file, verifyVideoSRC = true, name = "Local Files") {
        if (typeof json_file === "string") {
            this.verifyVideoSRC = verifyVideoSRC;
            this.name = name;
            fetch(json_file)
                .then((response) => response.json())
                .then((json) => {
                    window.registerExtension({
                        type: "json_file",
                        name: this.name,
                        verifyVideoSRC: this.verifyVideoSRC,
                        data: json,
                    });
                    this.data = json;
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
            name: this.name,
            verifyVideoSRC: this.verifyVideoSRC,
            data: this.data,
        };
    }
}
