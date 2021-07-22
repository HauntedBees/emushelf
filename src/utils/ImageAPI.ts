import { remote } from "electron";
const { app } = remote;
import { ipcRenderer } from 'electron';
import path from "path";
import fs from "fs";
import config from "../models/Config";

interface GBImageSet { thumb_url: string; }
interface GBGameResult {
    aliases: string;
    image: GBImageSet;
}
interface GBGameResponse {
    error: string;
    results: GBGameResult[];
}
class ImageAPI {
    userDataPath = app.getPath("userData");
    public LoadBase64Image(imgPath: string): string { return "data:image/png;base64," + fs.readFileSync(imgPath, { encoding: "base64" }); }
    public GetGameImage(name: string, console: string, localOnly: boolean, forceConnection = false): Promise<string> {
        return new Promise((resolve, reject) => {
            const folderPath = path.join(this.userDataPath, "images");
            if(!fs.existsSync(folderPath)) { fs.mkdirSync(folderPath); }
            const filename = path.join(folderPath, `${console} - ${name}.png`);
            if(!forceConnection && fs.existsSync(filename)) {
                resolve(filename);
            } else if(!localOnly) {
                ipcRenderer.invoke("imageapi", { apiKey: config.GetAPIKey(), name: name }).then((b: GBGameResponse) => {
                    if(!b || b.results.length === 0) { reject(); }
                    const img = b.results[0]?.image.thumb_url;
                    if(!img) { resolve(""); }
                    ipcRenderer.invoke("img", img).then(i => {
                        fs.writeFileSync(filename, Buffer.from(i));
                        resolve(filename);
                    }).catch(e => reject(e));
                }).catch(e => reject(e));
            } else { reject(); }
        });
    }
}
const imageAPI = new ImageAPI();
export default imageAPI;