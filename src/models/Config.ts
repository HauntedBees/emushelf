import { remote } from "electron";
const { app } = remote;
import fs from "fs";
import path from "path";
import { DefaultConsoles } from "./DefaultConsoles";
import { GameInfo, PlayInfo } from "./GameInfo";

export interface ConsoleInfo {
    shortCode: string;
    name: string;
    image?: string;
    default: boolean;
    extensions: string[];
    path: string;
    preferredEmulator: string;
    favorite: boolean;
    hideUnfavorited: boolean;
}
export interface EmulatorInfo {
    name: string;
    path: string;
    args: string[];
    consoles: string[];
}
export interface ConfigInfo {
    useGiantBombAPI: boolean;
    giantBombAPIKey: string;
    primaryRegion: string;
    showChrome: boolean;
    fullscreen: boolean;
    currentTheme: string;
    viewType: string;
    tilesPerRow: number;
}
export interface StyleInfo {
    name: string;
    key?: string;
    dark: boolean;
    primary?: string;
    primaryText?: string;
    accent?: string;
    accentText?: string;
    secondary?: string;
    secondaryText?: string;
    success?: string;
    successText?: string;
    info?: string;
    infoText?: string;
    warning?: string;
    warningText?: string;
    error?: string;
    errorText?: string;
    depressed?: boolean;
    borderRadius?: number;
    customCSS?: string;
}

interface Config {
    giantBombAPIKey: string;
    primaryRegion: string;
    showChrome: boolean;
    fullscreen: boolean;
    emulators: EmulatorInfo[];
    consoles: ConsoleInfo[];
    tags: string[];
    currentTheme: string;
    viewType: string;
    tilesPerRow: number;
    language: string;
}
class ConfigHandler {
//#region Initialization
    private config: Config = {
        giantBombAPIKey: "",
        showChrome: true,
        fullscreen: false,
        primaryRegion: "US",
        currentTheme: "dark",
        emulators: [],
        consoles: [],
        tags: [],
        viewType: "normal",
        tilesPerRow: 8,
        language: "en"
    };
    private configPath: string;
    private playInfo: {[key: string]: PlayInfo} = {};
    private playInfoPath: string;
    constructor() {
        const userDataPath = app.getPath("userData");
        this.configPath = path.join(userDataPath, "config.json");
        this.ReadConfig();
        this.playInfoPath = path.join(userDataPath, "gameInfo.json");
        this.ReadPlayInfo();
    }
    public GetLanguage(): string { return this.config.language || "en"; }
    public GetImagesPath(): string { return path.join(path.dirname(this.configPath), "images"); }
    public GetStylePath(): string { return path.join(path.dirname(this.configPath), "styles.json"); }
    private ReadConfig(): void {
        if(!fs.existsSync(this.configPath)) { this.SaveConfig(); return; }
        this.config = JSON.parse(fs.readFileSync(this.configPath).toString());
    }
    private SaveConfig(): void { fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 1)); }
    private ReadPlayInfo(): void {
        if(!fs.existsSync(this.playInfoPath)) { this.SavePlayInfo(); return; }
        this.playInfo = JSON.parse(fs.readFileSync(this.playInfoPath).toString());
    }
    private SavePlayInfo(): void { fs.writeFileSync(this.playInfoPath, JSON.stringify(this.playInfo, null, 1)); }
//#endregion
//#region Styles
    GetStyles(): {[key: string]: StyleInfo} {
        const stylePath = this.GetStylePath();
        if(stylePath === "ASS" && fs.existsSync(stylePath)) {
            return JSON.parse(fs.readFileSync(stylePath).toString());
        } else {
            const defaultThemes = require("../assets/themes.json"); // eslint-disable-line
            fs.writeFileSync(stylePath, JSON.stringify(defaultThemes, null, 1));
            return defaultThemes;
        }
    }
    GetCurrentStyle(): StyleInfo[] {
        const styles = this.GetStyles();
        const style = styles[this.config.currentTheme];
        return [style, style.dark ? styles["dark"] : styles["light"]];
    }
//#endregion
//#region Settings Screen
    public GetConsoles(): ConsoleInfo[] {
        const consoles = [...this.config.consoles];
        for(const key in DefaultConsoles) {
            if(!consoles.some(c => c.shortCode === key)) {
                consoles.push(DefaultConsoles[key]);
            }
        }
        return consoles;
    }
    public SaveConsoles(c: ConsoleInfo[]): void {
        this.config.consoles = c;
        this.SaveConfig();
    }
    public GetEmulators(): EmulatorInfo[] {
        const emulators = [...this.config.emulators];
        emulators.sort((a, b) => a.name.localeCompare(b.name));
        return emulators;
    }
    public SaveEmulators(e: EmulatorInfo[]): void {
        this.config.emulators = e;
        this.SaveConfig();
    }
    public GetConfig(): ConfigInfo {
        return {
            primaryRegion: this.config.primaryRegion,
            fullscreen: this.config.fullscreen,
            showChrome: this.config.showChrome,
            giantBombAPIKey: this.config.giantBombAPIKey,
            useGiantBombAPI: this.config.giantBombAPIKey !== "",
            currentTheme: this.config.currentTheme,
            viewType: this.config.viewType,
            tilesPerRow: this.config.tilesPerRow
        };
    }
    public UpdateConfig(c: ConfigInfo): void {
        this.config.primaryRegion = c.primaryRegion;
        this.config.fullscreen = c.fullscreen;
        this.config.showChrome = c.showChrome;
        this.config.giantBombAPIKey = c.useGiantBombAPI ? c.giantBombAPIKey : "";
        this.config.currentTheme = c.currentTheme;
        this.config.viewType = c.viewType;
        this.config.tilesPerRow = c.tilesPerRow;
        this.SaveConfig();
    }
    public GetAPIKey(): string { return this.config.giantBombAPIKey; }
    public GetTags(listOnly = false, activeOnly = false): { tags: string[], xref: {[key: string]: number} } {
        const tagMap: {[key: string]: number} = {};
        let tags = [...this.config.tags];
        if(!listOnly) {
            this.config.tags.forEach(t => tagMap[t] = 0);
            for(const game in this.playInfo) {
                this.playInfo[game].tags.forEach(t => {
                    tagMap[t]++;
                });
            }
        }
        if(activeOnly) {
            tags = [];
            for(const game in this.playInfo) {
                this.playInfo[game].tags.forEach(t => {
                    tags.push(t);
                });
            }
            tags = [...new Set(tags)];
        }
        return { tags: tags, xref: tagMap };
    }
    public SaveTags(tags: string[]): void {
        this.config.tags = tags;
        this.SaveConfig();
    }
    public PurgeTag(tag: string): void {
        for(const game in this.playInfo) {
            const idx = this.playInfo[game].tags.indexOf(tag);
            if(idx >= 0) { this.playInfo[game].tags.splice(idx, 1); }
        }
    }
//#endregion
//#region Home Screen 
    public GetPlayableConsoles(): ConsoleInfo[] {
        const emulators = this.GetEmulators();
        const consoles = this.GetConsoles().filter(c => c.path && emulators.some(e => e.consoles.indexOf(c.shortCode) >= 0));
        consoles.sort(this.SortByFavorite);
        return consoles;
    }
    public UpdateConsole(newValue: ConsoleInfo): void {
        const cIdx = this.config.consoles.findIndex(c => c.shortCode === newValue.shortCode);
        if(cIdx < 0) { return; }
        this.config.consoles[cIdx] = newValue;
        this.SaveConfig();
    }
//#endregion
//#region Console Screen
    public GetView(): string { return this.config.viewType; }
    public GetTilesPerRow(): number { return this.config.tilesPerRow; }
    public GetConsole(shortCode: string): ConsoleInfo {
        return this.config.consoles.filter(c => c.shortCode === shortCode)[0];
    }
    public GetGames(console: ConsoleInfo): {[key: string]: GameInfo} {
        const games: {[key: string]: GameInfo} = {};
        this.ProcessGameFolder(console.shortCode, games, console.path);
        for(const key in games) {
            const g = games[key];
            g.regions = [...new Set(g.regions)];
            g.addtlInfo = [...new Set(g.addtlInfo)];
            if(console.hideUnfavorited && !g.playInfo?.favorite) {
                delete games[key];
            }
        }
        return games;
    }
    public ProcessGameFolder(console: string, games: {[key: string]: GameInfo}, filepath: string) {
        let hasSubfolders = false;
        const files = fs.readdirSync(filepath, { withFileTypes: true });
        const consoleInfo = this.GetConsole(console);
        const metadata = files.filter(g => g.name.endsWith(".pdf"));
        const ROMs = files.filter(g => g.isDirectory || consoleInfo.extensions.some(e => g.name.toLowerCase().endsWith(e)));
        const filenameGameInfoRef: {[key: string]: GameInfo} = {};
        ROMs.forEach(g => {
            const filePath = path.join(filepath, g.name);
            if(fs.lstatSync(filePath).isDirectory()) {
                this.ProcessGameFolder(console, games, filePath);
                hasSubfolders = true;
                return;
            }
            const gi = new GameInfo(g.name, filepath);
            if(games[gi.name]) {
                const old = games[gi.name];
                old.regions.push(...gi.regions);
                old.addtlInfo.push(...gi.addtlInfo);
                if(gi.regions.indexOf(this.config.primaryRegion) >= 0) {
                    old.filenames.unshift(...gi.filenames);
                } else {
                    old.filenames.push(...gi.filenames);
                }
                old.discs = Math.max(old.discs, gi.discs);
            } else {
                games[gi.name] = gi;
                if(this.playInfo[`${console} - ${gi.name}`]) {
                    gi.playInfo = this.playInfo[`${console} - ${gi.name}`];
                    gi.addtlInfo.push(...gi.playInfo.tags);
                }
            }
            filenameGameInfoRef[gi.filenameNoExt] = games[gi.name];
        });
        metadata.forEach(m => {
            if(m.name.endsWith(".pdf")) { // manual
                const noExt = m.name.replace(".pdf", "");
                if(!filenameGameInfoRef[noExt]) { return; }
                const gi = new GameInfo(m.name, filepath);
                const manualpath = gi.filenames[0];
                filenameGameInfoRef[noExt].manuals.push({
                    fileName: path.basename(manualpath),
                    filePath: manualpath,
                    regions: gi.regions
                });
            }
        });
        return hasSubfolders;
    }
    public GetPlayInfo(name: string, console: string): PlayInfo {
        const key = `${console} - ${name}`;
        if(!this.playInfo[key]) {
            this.playInfo[key] = {
                playtime: 0,
                favorite: false,
                hidden: false,
                preferredVersion: "",
                tags: []
            };
            this.SavePlayInfo();
        }
        return this.playInfo[key];
    }
    public GetGameInfoForSpecificRom(console: string, filepath: string): GameInfo {
        const filename = path.basename(filepath);
        filepath = path.dirname(filepath);
        const gi = new GameInfo(filename, filepath, false);
        gi.playInfo = this.GetPlayInfo(gi.name, console);
        return gi;
    }
    public UpdatePlayInfo(name: string, console: string, info: PlayInfo) {
        const key = `${console} - ${name}`;
        this.playInfo[key] = info;
        this.SavePlayInfo();
    }
    public GetEmulatorForConsole(console: ConsoleInfo): EmulatorInfo {
        const emus = this.GetEmulators();
        if(console.preferredEmulator) {
            return emus.filter(e => e.name === console.preferredEmulator)[0] || emus[0];
        } else {
            return emus.filter(e => e.consoles.indexOf(console.shortCode) >= 0)[0];
        }
    }
    public SortGameAttributes(attrs: string[]): void {
        const knownValues: {[key: string]: number} = {
            "Verified": 4,
            "Unlicensed": 3,
            "Worldwide": 2,
            "Overdump": 1
        };
        attrs.sort((a, b) => {
            const ax = knownValues[a] || 0, bx = knownValues[b] || 0;
            return ax === bx ? a.localeCompare(b) : (bx - ax);
        });
    }
//#endregion
//#region Helpers
    private SortByFavorite(a: { favorite: boolean, name: string }, b: { favorite: boolean, name: string }): number {
        if(a.favorite === b.favorite) { return a.name.localeCompare(b.name); }
        return a.favorite ? -1 : 1;
    }
//#endregion
}
const config = new ConfigHandler();
export default config;