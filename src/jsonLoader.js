export default class JsonLoader {
    json_file;
    data;
    verifyVideoSRC;
    name;
    status;
    error;

    constructor(json_file, verifyVideoSRC = true, name = "Local Files") {
        this.json_file = json_file;
        this.verifyVideoSRC = verifyVideoSRC;
        this.name = name;
    }

    async load() {
        if (typeof this.json_file === "string") {
            await fetch(this.json_file)
                .then((response) => response.json())
                .then((json) => {
                    window.registerExtension({
                        type: "json_file",
                        name: this.name,
                        verifyVideoSRC: this.verifyVideoSRC,
                        data: json,
                    });
                    this.data = json;
                    this.status = "success";
                })
                .catch((error) => {
                    console.error("Error:", error);
                    this.status = "error";
                    this.error = error;
                });
        } else {
            this.error = "Error: `json_file` must be valid string";
            this.status = "error";
            console.error(this.error);
        }
    }
}
