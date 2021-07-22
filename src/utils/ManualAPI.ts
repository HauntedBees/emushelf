import { ipcRenderer } from 'electron';

export interface IASearchDocument {
    identifier: string;
    title: string;
}
interface IASearchResponse { docs: IASearchDocument[]; }
interface IASearchResponseObject { response: IASearchResponse; }

export interface IAMetadataFile {
    name: string;
    size: number;
    format: string;
} 
interface IAMetadataResponseObject { result: IAMetadataFile[]; }

export interface ManualSearch {
    name: string;
    results: IASearchDocument[];
    selected: number;
    manuals: IAMetadataFile[]|null;
}

class ManualAPI {
    public FindManuals(game: string): Promise<IASearchDocument[]> {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke("manualapi", game).then((r: IASearchResponseObject) => {
                if(!r || !r.response || !r.response.docs) { resolve([]); }
                resolve(r.response.docs);
            }).catch(e => reject(e));
        });
    }
    public TryFindDocuments(identifier: string): Promise<IAMetadataFile[]> {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke("metadataapi", identifier).then((r: IAMetadataResponseObject) => {
                if(!r || !r.result) { resolve([]); }
                const onlyPDFs = r.result.filter(f => f.name.endsWith(".pdf") && f.format.indexOf("PDF") >= 0);
                resolve(onlyPDFs);
            }).catch(e => reject(e));
        });
    }
    public async DownloadRemotePDF(identifier: string, filename: string): Promise<ArrayBuffer> {
        return await ipcRenderer.invoke("pdf", `https://archive.org/download/${identifier}/${encodeURIComponent(filename)}`);
    }
}
const manualAPI = new ManualAPI();
export default manualAPI;