import path from "path";
function GetRegion(m: string): string[] {
    switch(m) {
        case "U":
        case "US":
        case "USA": return ["US"];
        case "JU": return ["US", "JP"];
        case "JUE": return ["US", "JP", "EU"];
        case "USA, Europe": return ["US", "EU"];
        case "USA, Australia": return ["US", "AU"];
        case "A": return ["AU"];
        case "CF": return ["CA"];
        case "J":
        case "JP":
        case "Japan": return ["JP"];
        case "E": return ["EU"];
        case "Europe": return ["EU"];
        case "Italy": return ["IT"];
        case "Germany": return ["DE"];
        case "Spain": return ["ES"];
        case "France": return ["FR"];
        case "Netherlands": return ["NL"];
        case "China": return ["CN"];
        case "Brazil": return ["BR"];
        case "SW": 
        case "SE": return ["SE"];
    }
    return [];
}
export interface Manual {
    fileName: string;
    regions: string[];
    filePath?: string;
    buffer?: ArrayBuffer;
    gameName?: string;
}
export interface PlayInfo {
    playtime: number;
    favorite: boolean;
    hidden: boolean;
    preferredVersion: string;
    tags: string[];
}
export class GameInfo {
    name: string;
    filenameNoExt: string;
    regions: string[] = [];
    filetype: string;
    discs = 1;
    addtlInfo: string[] = [];
    filenames: string[] = [];
    manuals: Manual[] = [];
    image = "";
    playInfo?: PlayInfo;
    preferred = false;
    public constructor(filename: string, filepath: string, tossLangs = true) {
        const fnsplit = filename.split(".");
        this.filetype = fnsplit.pop() || "??";
        filename.match(/[([][^)\]]*[)\]]/g)?.forEach(m => {
            m = m.replace(/[()[\]]/g, "");
            if(tossLangs && m.split(",").length > 2) { return; } // ignore massive language lists
            const newRegions = GetRegion(m);
            this.regions.push(...newRegions);
            if(!newRegions.length) {
                switch(m) {
                    case "Disc 1": this.discs = 1; break;
                    case "Disc 2": this.discs = 2; break;
                    case "Unl": this.addtlInfo.push("Unlicensed"); break;
                    case "W": this.addtlInfo.push("Worldwide"); break;
                    case "!": this.addtlInfo.push("Verified"); break;
                    case "o": this.addtlInfo.push("Overdump"); break;
                    default: this.addtlInfo.push(m);
                }
            }
        });
        this.filenameNoExt = fnsplit.join(".");
        this.name = this.filenameNoExt.replace(/[([][^)\]]*[)\]]/g, "").replace(/ {2}/g, " ").trim();
        this.filenames.push(path.join(filepath, filename));
    }
}