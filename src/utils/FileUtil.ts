import { ipcRenderer } from "electron";
import fs from "fs";
import path from "path";
class FileUtil {
    public ShortPath(folder: string): string {
        if(folder.length < 25) { return folder; }
        const split = folder.split(path.sep);
        return split[0] + path.sep + "..." + path.sep + split[split.length - 1];
    }
    public GetFileDirectory(filePath: string): string { return path.dirname(filePath); }
    public OpenLink(url: string): void { ipcRenderer.invoke("link", url); } 
    public OpenFolder(folder: string): void { ipcRenderer.invoke("folder", folder); } 
    public ShowFile(filepath: string): void { ipcRenderer.invoke("fileinfolder", filepath); }
    public async ExecuteShell(path: string, args: string[]): Promise<number> {
        return new Promise(resolve => {
            ipcRenderer.invoke("run", [path, args]).then((res: number) => {
                resolve(res);
            });
        });
    }
    public async SaveManual(fileURL: ArrayBuffer, rompath: string): Promise<string> {
        const filename = path.basename(rompath).replace(path.extname(rompath), "");
        const newpath = path.join(path.dirname(rompath), filename + ".pdf");
        return new Promise((resolve, reject) => {
            fs.writeFile(newpath, Buffer.from(fileURL), error => {
                if(error) { reject(error); }
                else { resolve(newpath); }
            });
        })
    }
    public GetRetroarchCores(retroarchExePath: string): string[] {
        const retroarchPath = path.dirname(retroarchExePath);
        const corePath = path.join(retroarchPath, "cores");
        return fs.readdirSync(corePath).map(c => path.join(retroarchPath, "cores", c));
    }
    public GetRetroarchCoreName(corePath: string): string {
        return path.basename(corePath, path.extname(corePath)).replace("_libretro", "");
    }
}
const fileUtil = new FileUtil();
export default fileUtil;