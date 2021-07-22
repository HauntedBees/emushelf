<template>
<v-dialog v-model="isOpen">
    <v-card>
        <v-card-title><i18n path="searchManualDialogName">{{search.name}}</i18n></v-card-title>
        <v-card-text>
            <v-row v-if="search.results.length">
                <v-col>
                    <p><i18n path="searchManualDialogDesc">{{search.name}}</i18n></p>
                    <v-list>
                        <v-list-item-group v-model="search.selected">
                            <v-list-item :class="(leftSide && navIdx === i) ? 'control-hover' : ''" @click="ViewManuals(r.identifier)" v-for="(r, i) in search.results" :key="r.identifier">
                                {{r.title}}
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-col>
                <v-col cols="4" v-if="search.manuals">
                    <v-list v-if="search.manuals.length">
                        <v-list-item :class="(!leftSide && navIdx === i) ? 'control-hover' : ''" @click="OpenRemotePDF(search.results[search.selected].identifier, m.name)" v-for="(m, i) in search.manuals" :key="m.name">
                            {{m.name}} ({{FriendlySize(m.size)}})
                        </v-list-item>
                    </v-list>
                    <p v-else>{{$t("searchManualNoDocs")}}</p>
                </v-col>
            </v-row>
            <p v-else><i18n path="searchManualNoManuals">{{search.name}}</i18n></p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="$emit('close')">{{$t("searchManualDialogClose")}}</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>
</template>
<script lang="ts">
import { TunnelEmit, Load } from '../utils/MiscUtil';
import manualAPI, { ManualSearch } from '../utils/ManualAPI';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
@Component
export default class ManualModal extends Vue {
    @Prop() search!: ManualSearch;
    @Prop() gamepadInput!:({ x: number, y: number, btn: string })|null;
    isOpen = true;
    leftSide = true;
    navIdx = 0;
    FriendlySize(bytes: number): string {
        const sizes = ["B", "KB", "MB"];
        if (bytes == 0) { return '0B'; }
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
    }
    async ViewManuals(identifier: string): Promise<void> {
        try {
            Load(this, true);
            this.search.manuals = await manualAPI.TryFindDocuments(identifier);
        } catch {
            this.search.manuals = null;
            TunnelEmit(this, "err", this.$t("errNoIA").toString());
        } finally { Load(this, false); }
    }
    async OpenRemotePDF(identifier: string, filename: string): Promise<void> {
        try {
            Load(this, true);
            const pdfArrayBuffer = await manualAPI.DownloadRemotePDF(identifier, filename);
            this.$emit("manualFound", pdfArrayBuffer);
        } catch {
            TunnelEmit(this, "err", this.$t("manualDialogDownloadFailure").toString());
        } finally { Load(this, false); }
    }
    @Watch("gamepadInput")
    NewInput(): void {
        if(!this.gamepadInput) { return; }
        if(this.gamepadInput.btn === "B") {
            if(this.leftSide) {
                this.$emit("done");
            } else {
                this.leftSide = true;
                this.navIdx = 0;
            }
        } else if(this.gamepadInput.btn === "A") {
            if(this.leftSide) {
                this.search.selected = this.navIdx;
                this.ViewManuals(this.search.results[this.navIdx].identifier);
                this.leftSide = false;
                this.navIdx = 0;
            } else {
                if(!this.search.manuals) { return; }
                this.OpenRemotePDF(this.search.results[this.search.selected].identifier, this.search.manuals[this.navIdx].name);
                TunnelEmit(this, "err", this.$t("errGamepadManual").toString());
                this.$emit("searchopen");
            }
        } else {
            this.navIdx += this.gamepadInput.y;
            if(this.navIdx < 0) {
                this.navIdx = 0;
            } else if(!this.leftSide && this.search.manuals && this.navIdx >= this.search.manuals.length) {
                this.navIdx = this.search.manuals.length - 1;
            } else if(this.leftSide && this.navIdx >= this.search.results.length) {
                this.navIdx = this.search.results.length - 1;
            }
        }
    }
}
</script>