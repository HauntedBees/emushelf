<template>
<v-dialog v-model="isOpen">
    <v-card :height="ModalHeight">
        <v-card-title><i18n path="manualDialogName">{{ManualName}}</i18n></v-card-title>
        <v-card-text>
            <iframe width="100%" :height="FrameHeight" :src="pdfPath + (manual.buffer ? '' : `?page=${page}#view=Fit&page=${page}`)" type="application/pdf"></iframe>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="manual.buffer" color="primary" text @click="DownloadManual()">{{$t("manualDialogDownload")}}</v-btn>
            <v-btn color="primary" text @click="$emit('close')">{{$t("manualDialogClose")}}</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</template>
<script lang="ts">
import { TunnelEmit, Load } from '../utils/MiscUtil';
import { GameInfo, Manual } from '@/models/GameInfo';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import fileUtil from '@/utils/FileUtil';
@Component
export default class ManualModal extends Vue {
    @Prop() manual!: Manual;
    @Prop() game!: GameInfo;
    @Prop({ default: 1 }) page!: number;
    @Prop() forceDownload!: boolean;
    pdfPath = "";
    isOpen = true;
    get ManualName(): string { return this.manual.fileName.replace(".pdf", ""); }
    get ModalHeight(): string { return Math.floor(window.innerHeight * 0.8) + "px"; }
    get FrameHeight(): string { return (Math.floor(window.innerHeight * 0.8) - 140) + "px"; }

    mounted(): void {
        if(this.manual.buffer) {
            this.pdfPath = URL.createObjectURL(new Blob([this.manual.buffer], { type: "application/pdf" }));
        } else if(this.manual.filePath) {
            this.pdfPath = this.manual.filePath;
        }
    }
    CloseModal(): void { this.$emit("close"); }
    async DownloadManual(): Promise<void> {
        if(!this.manual.buffer) { return; }
        try {
            Load(this, true);
            const newPath = await fileUtil.SaveManual(this.manual.buffer, this.game.filenames[0]);
            this.$emit("downloaded", newPath);
            TunnelEmit(this, "msg", this.$t("manualDialogDownloadSuccess").toString());
        } catch {
            TunnelEmit(this, "err", this.$t("manualDialogDownloadFailure").toString());
        } finally { Load(this, false); }
    }

    @Watch("forceDownload")
    async ForcePDFDownload(): Promise<void> {
        if(!this.forceDownload) { return; }
        await this.DownloadManual();
    }
}
</script>