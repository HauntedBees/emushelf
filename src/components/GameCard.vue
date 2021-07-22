<template>
<v-card class="pt-3" :style="'background: linear-gradient(#1E1E1EAA, #1E1E1EFF), url(' + game.image + ') no-repeat center top/cover; height: calc(100vh - 88px)'">
    <v-img height="250" :src="game.image" contain />
    <v-card-title class="text-h5" v-text="game.name" />
    <v-card-text>
        <v-row align="center">
            <v-col cols="11">
                <div><strong>{{$t("gamePlaytime")}}:</strong> {{Playtime}}</div>
                <div>
                    <strong class="mr-1">{{$t("gameTags")}}: </strong>
                    <em v-if="game.playInfo && game.playInfo.tags.length === 0" class="mr-2">{{$t("gameNoTags")}}</em>
                    <v-chip v-for="(t, i) in game.playInfo.tags" :key="t" @click:close="RemoveTag(i)" color="primary" :class="'mr-2 ' + NavSel('tags', i)" small close>
                        {{t}}
                    </v-chip>
                    <BeeTooltip v-if="!addingTag" :tooltip="$t('gameAddTag')">
                        <v-btn @click="StartAddTag()" x-small color="success" :class="NavSel('tags', game.playInfo.tags.length)"><v-icon small>mdi-plus</v-icon></v-btn>
                    </BeeTooltip>
                    <div v-if="addingTag" class="no-wrap">
                        <v-combobox ref="addTag" v-model="selectedTag" @change="AddTag()" :items="tags" dense class="d-inline-block" />
                        <BeeTooltip :tooltip="$t('gameAddTag')">
                            <v-btn class="vert-mid ml-1" icon small color="success" @click="AddTag()"><v-icon>mdi-checkbox-marked</v-icon></v-btn>
                        </BeeTooltip>
                        <BeeTooltip :tooltip="$t('gameCancelTag')">
                            <v-btn class="vert-mid" icon small color="error" @click="addingTag = false; selectedTag=''"><v-icon>mdi-close-box</v-icon></v-btn>
                        </BeeTooltip>
                    </div>
                </div>
            </v-col>
            <v-col cols="1" class="text-right">
                <v-btn icon ref="favorite" @click="ToggleFavorite()"><v-icon large :color="game.playInfo.favorite ? 'red' : 'grey'">mdi-heart</v-icon></v-btn>
            </v-col>
        </v-row>
    </v-card-text>
    <v-row>
        <v-col cols="8">
            <v-card-title class="pb-0">{{$tc("gameVersions", IndividualGames.length)}}</v-card-title>
            <v-list two-line color="primary">
                <v-divider />
                <template v-for="(rom, i) of IndividualGames">
                    <v-list-item :class="NavSel('roms', i)" :key="rom.key" @click="PlayGame(rom)">
                        <v-list-item-content>
                            <v-list-item-title>{{rom.name}} <v-chip v-if="rom.discs > 1" small label class="ml-1"><i18n path="discNumber">{{rom.discs}}</i18n></v-chip></v-list-item-title>
                            <v-list-item-subtitle>
                                <v-row>
                                    <v-col>
                                        <CountryFlag v-for="r in rom.regions" :key="r" :country="r" size="small" />
                                        <span v-for="attr in rom.addtlInfo" :key="attr">
                                            <BeeTooltip v-if="attr === 'Unlicensed'" :tooltip="$t('gameUnlicensed')">
                                                <v-icon class="ml-1">mdi-incognito-circle</v-icon>
                                            </BeeTooltip>
                                            <BeeTooltip v-else-if="attr === 'Verified'" :tooltip="$t('gameVerified')">
                                                <v-icon class="ml-1">mdi-check-decagram</v-icon>
                                            </BeeTooltip>
                                            <BeeTooltip v-else-if="attr === 'Worldwide'" :tooltip="$t('gameWorldwide')">
                                                <v-icon class="ml-1">mdi-earth</v-icon>
                                            </BeeTooltip>
                                            <v-chip v-else x-small label class="ml-1">{{attr}}</v-chip>
                                        </span>
                                    </v-col>
                                </v-row>
                                <v-row><v-col class="pt-0" style="cursor: pointer" @click="ShowFile($event, rom.filenames[0])" v-text="rom.filenames[0]" /></v-row>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-icon>
                            <BeeTooltip v-if="game.playInfo.preferredVersion === rom.filenames[0]" :tooltip="$t('gameIsPreferred')">
                                <v-icon color="secondary">mdi-file-star</v-icon>
                            </BeeTooltip>
                            <BeeTooltip v-if="game.playInfo.preferredVersion !== rom.filenames[0]" :tooltip="$t('gameMakePreferred')">
                                <v-btn icon @click="MakePrimaryROM($event, rom.filenames[0])">
                                    <v-icon color="secondary" class="notpreferred">mdi-file-star-outline</v-icon>
                                </v-btn>
                            </BeeTooltip>
                        </v-list-item-icon>
                    </v-list-item>
                    <v-divider :key="rom.key" />
                </template>
            </v-list>
        </v-col>
        <v-col cols="4" v-if="game.manuals.length">
            <v-card-title class="pb-0">{{$tc("gameManual", game.manuals.length)}}</v-card-title>
            <v-card @click="OpenManual(manual)" color="secondary" v-for="(manual, i) in game.manuals" :key="manual.fileName">
                <v-card-title :class="NavSel('manual', i)"><CountryFlag v-for="r in manual.regions" :key="r" :country="r" size="small" /> {{manual.fileName}}</v-card-title>
            </v-card>
        </v-col>
        <v-col cols="4" v-if="!game.manuals.length">
            <div class="mr-3">
                <v-card-title class="pb-0">{{$t("gameFindManual")}}</v-card-title>
                <p>{{$t("gameFindManualDesc")}}</p>
                <div class="text-center">
                    <v-btn :class="NavSel('manual', 0)" @click="FindManual()" color="primary">{{$t("gameFindManual")}}</v-btn>
                </div>
            </div>
        </v-col>
    </v-row>
    <ManualModal v-if="openManual" :manual="openManual" :game="game" :page="pdfPage" :forceDownload="forceManualDownload" @close="CloseManual()" @downloaded="DocDownloaded($event)" />
    <SearchModal v-if="searchResults" :search="searchResults" :gamepadInput="gamepadInput" @close="CloseSearch()" @done="CloseSearch()" @searchopen="GamepadSwitchPDF()" @manualFound="SwitchToManualModal($event)" />
</v-card>
</template>
<script lang="ts">
import { TunnelEmit, OpenDaisywheel, Load } from '../utils/MiscUtil';
import CountryFlag from 'vue-country-flag';
import ManualModal from '../components/ManualModal.vue';
import SearchModal from '../components/SearchModal.vue';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { GameInfo, Manual } from '../models/GameInfo';
import config, { ConsoleInfo } from '../models/Config';
import fileUtil from '@/utils/FileUtil';
import manualAPI, { ManualSearch } from '@/utils/ManualAPI';
import { GetElementFromRef } from '@/utils/VueUtil';

@Component({ components: { CountryFlag, ManualModal, SearchModal } })
export default class GameCard extends Vue {
    @Prop() console!: ConsoleInfo;
    @Prop() game!: GameInfo;
    @Prop() launchNow!: boolean;
    openManual: Manual|null = null;
    searchResults: ManualSearch|null = null;
    tags: string[] = [];
    addingTag = false;
    selectedTag = "";

    @Prop() gamepadInput!:({ x: number, y: number, btn: string })|null;
    navState: "roms"|"pdf"|"search"|"manual"|"manualsearch"|"tags" = "roms";
    navSubstate = 0;
    pdfPage = 1;
    forceManualDownload = false;
    potentialDelete = -1;
    confirmRemoval = true;
    isInAddTag = false;
    inGame = false;

    created(): void {
        if(!this.game.playInfo) {
            this.game.playInfo = {
                playtime: 0,
                favorite: false,
                hidden: false,
                preferredVersion: "",
                tags: []
            };
        }
        this.tags = config.GetTags(true).tags;
        if(this.launchNow) {
            this.PlayGame(this.IndividualGames[0]);            
        }
    }
    get Playtime(): string {
        if(!this.game.playInfo || this.game.playInfo.playtime === 0) { return "N/A"; }
        const num = this.game.playInfo.playtime;
        const days = Math.floor(num / 86400);
        const hours = Math.floor((num - days * 86400) / 3600);
        const minutes = Math.floor((num - days * 86400 - hours * 3600) / 60);
        const seconds = num - - days * 86400 - hours * 3600 - minutes * 60;
        let finalString = `${seconds} second${seconds === 1 ? '' : 's'}`;
        if(minutes > 0) { finalString = `${minutes} minute${minutes === 1 ? '' : 's'}, ${finalString}`; }
        if(hours > 0) { finalString = `${hours} hour${hours === 1 ? '' : 's'}, ${finalString}`; }
        if(days > 0) { finalString = `${days} day${days === 1 ? '' : 's'}, ${finalString}`; }
        return finalString;
    }
    get IndividualGames(): GameInfo[] {
        const games = this.game.filenames.map(g => config.GetGameInfoForSpecificRom(this.console.shortCode, g)) || [];
        if(this.game.playInfo?.preferredVersion) {
            const idx = this.game?.filenames.indexOf(this.game.playInfo.preferredVersion) || -1;
            if(idx >= 0) {
                const primary = games.splice(idx, 1);
                primary[0].preferred = true;
                games.unshift(...primary);
            }
        }
        games.forEach(g => config.SortGameAttributes(g.addtlInfo));
        return games;
    }

    ShowFile(e: Event, folder: string): void {
        e.stopPropagation();
        fileUtil.ShowFile(folder);
    }

    ToggleFavorite(): void {
        if(!this.game.playInfo) { return; }
        this.game.playInfo = {
            favorite: !this.game.playInfo.favorite,
            playtime: this.game.playInfo.playtime,
            hidden: this.game.playInfo.hidden,
            preferredVersion: this.game.playInfo.preferredVersion,
            tags: this.game.playInfo.tags
        };
        config.UpdatePlayInfo(this.game.name, this.console.shortCode, this.game.playInfo);
    }
    
    PlayGame(g: GameInfo): void {
        const info = config.GetEmulatorForConsole(this.console);
        this.inGame = true;
        TunnelEmit(this, "load", true);
        TunnelEmit(this, "loadmsg", this.$t("nowPlayingMessage", [this.game.name]).toString());
        fileUtil.ExecuteShell(info.path, info.args.map(a => a.replace(/%ROM%/, g.filenames[0]))).then(r => {
            TunnelEmit(this, "load", false);
            this.inGame = false;
            if(!this.game.playInfo) { return; }
            this.game.playInfo = {
                playtime: this.game.playInfo.playtime + Math.floor(r),
                favorite: this.game.playInfo.favorite,
                hidden: this.game.playInfo.hidden,
                preferredVersion: this.game.playInfo.preferredVersion,
                tags: this.game.playInfo.tags
            }
            config.UpdatePlayInfo(this.game.name, this.console.shortCode, this.game.playInfo);
        }).catch(() => TunnelEmit(this, "load", false));
    }

    MakePrimaryROM(e:Event, filename: string): void {
        e.stopPropagation();
        if(!this.game.playInfo) { return; }
        this.game.playInfo.preferredVersion = filename;
        config.UpdatePlayInfo(this.game.name, this.console.shortCode, this.game.playInfo);
    }

    OpenManual(manual: Manual): void { this.openManual = manual; }
    CloseManual(): void { this.openManual = null; }
    async FindManual(): Promise<void> {
        try {
            Load(this, true);
            this.searchResults = {
                results: await manualAPI.FindManuals(this.game.name),
                name: this.game.name,
                selected: 0,
                manuals: null
            };
        } catch {
            this.searchResults = null;
            TunnelEmit(this, "err", this.$t("errNoIA").toString());
        } finally {
            Load(this, false);
        }
    }
    SwitchToManualModal(pdf:ArrayBuffer): void {
        this.openManual = null;
        this.$nextTick(() => {
            this.openManual = {
                fileName: this.$t("fromIAFileName").toString(),
                regions: [],
                buffer: pdf,
                gameName: this.game.name
            };
            this.searchResults = null;
        });
    }
    CloseSearch(): void {
        this.searchResults = null;
        if(this.navState === "search") {
            this.navState = "manualsearch";
            this.navSubstate = 0;
        } else if(this.navState === "manualsearch") {
            this.navState = "manual";
            this.navSubstate = 0;
        }
    }

    StartAddTag(): void {
        this.addingTag = true;
        this.$nextTick(() => {
            (this.$refs["addTag"] as HTMLInputElement).focus();
        });
    }
    AddTag(): void {
        if(!this.game.playInfo) { return; }
        if(this.game.playInfo.tags.indexOf(this.selectedTag) < 0) {
            this.game.playInfo.tags.push(this.selectedTag);
            if(this.tags.indexOf(this.selectedTag) < 0) {
                this.tags.push(this.selectedTag);
                config.SaveTags(this.tags);
            }
            config.UpdatePlayInfo(this.game.name, this.console.shortCode, this.game.playInfo);
        }
        this.selectedTag = "";
        this.addingTag = false;
    }
    RemoveTag(idx: number): void {
        if(!this.game.playInfo) { return; }
        this.game.playInfo.tags.splice(idx, 1);
        config.UpdatePlayInfo(this.game.name, this.console.shortCode, this.game.playInfo);
    }

    NavSel(state: string, i: number): string { return (this.navState === state && this.navSubstate === i) ? "control-hover" : ""; }
    GamepadSwitchPDF(): void {
        this.navState = "pdf";
        this.navSubstate = 0;
    }
    DocDownloaded(newPath: string): void {
        this.game.manuals.push({
            filePath: newPath,
            regions: [],
            fileName: this.game.name + ".pdf"
        });
        if(this.navState === "pdf") {
            this.CloseManual();
            this.navState = "manual";
            this.navSubstate = 0;
            this.$nextTick(() => {
                this.OpenManual(this.game.manuals[0]);
                this.navState = "pdf";
            });
        }
    }
    @Watch("gamepadInput")
    NewInput(): void {
        if(!this.gamepadInput || this.isInAddTag || this.inGame) { return; }
        if(this.navSubstate === -1) { this.navSubstate = 0; }
        if(this.navState === "roms") {
            if(this.gamepadInput.x > 0) { // move to manuals
                this.navState = "manual";
                this.navSubstate = 0;
            } else if(this.gamepadInput.btn) {
                if(this.gamepadInput.btn === "Y") {
                    this.MakePrimaryROM(new Event("ignore"), this.IndividualGames[this.navSubstate].filenames[0]);
                    this.navSubstate = 0;
                } else if(this.gamepadInput.btn === "B") {
                    this.navSubstate = -1;
                    this.$emit("exitgame");
                } else if(this.gamepadInput.btn === "A") {
                    this.PlayGame(this.IndividualGames[this.navSubstate]);
                }
            } else {
                this.navSubstate += this.gamepadInput.y;
                if(this.navSubstate < 0) {
                    this.navState = "tags";
                    this.navSubstate = 0;
                } else if(this.navSubstate >= this.IndividualGames.length) {
                    this.navSubstate = this.IndividualGames.length - 1;
                }
            }
        } else if(this.navState === "manual") {
            if(this.gamepadInput.x < 0) { // move to games
                this.navState = "roms";
                this.navSubstate = 0;
            } else if(this.gamepadInput.btn) {
                if(this.gamepadInput.btn === "Y") {
                    GetElementFromRef(this, "favorite").click();
                } else if(this.gamepadInput.btn === "B") {
                    this.navSubstate = -1;
                    this.$emit("exitgame");
                } else if(this.gamepadInput.btn === "A") {
                    if(this.game.manuals.length) {
                        //TunnelEmit(this, "err", "Due to circumstances, manuals are finicky when controlled through with a gamepad. Please use your mouse for a better experience.");
                        this.OpenManual(this.game.manuals[this.navSubstate]);
                        this.navState = "pdf";
                    } else {
                        this.navState = "manualsearch";
                        this.navSubstate = 0;
                        this.FindManual();
                    }
                }
            } else {
                this.navSubstate += this.gamepadInput.y;
                if(this.navSubstate < 0) {
                    this.navState = "tags";
                    this.navSubstate = 0;
                } else if(this.navSubstate >= this.game.manuals.length) {
                    this.navSubstate = Math.max(0, this.game.manuals.length - 1);
                }
            }
        } else if(this.navState === "pdf") {
            if(this.gamepadInput.btn) {
                if(this.gamepadInput.btn === "B") {
                    this.CloseManual();
                    this.navState = "manual";
                } else if(this.gamepadInput.btn === "A" && this.openManual && this.openManual.buffer) {
                    this.forceManualDownload = true;
                }
            } else {
                this.pdfPage += this.gamepadInput.y;
                if(this.pdfPage < 1) {
                    this.pdfPage = 1;
                } // I don't think there's an easy way to check if it's the last page...
            }
        } else if(this.navState === "tags") {
            if(this.gamepadInput.btn) {
                if(this.gamepadInput.btn === "Y") {
                    GetElementFromRef(this, "favorite").click();
                    this.potentialDelete = -1;
                } else if(this.gamepadInput.btn === "B") {
                    this.navSubstate = -1;
                    this.$emit("exitgame");
                    this.potentialDelete = -1;
                } else if(this.gamepadInput.btn === "A") {
                    if(!this.game.playInfo) { return; }
                    if(this.navSubstate === this.game.playInfo.tags.length) {
                        this.StartAddTag();
                        this.isInAddTag = true;
                        this.$nextTick(() => {
                            OpenDaisywheel(this, "addTag", "gameAddTag", "", s => {
                                this.addingTag = false;
                                this.isInAddTag = false;
                                if(s.trim()) {
                                    this.selectedTag = s;
                                    this.AddTag();
                                }
                            });
                        });
                    } else if(this.potentialDelete < 0) {
                        TunnelEmit(this, "msg", this.$t("gameRemoveTagConfirm").toString());
                        this.potentialDelete = this.navSubstate;
                    } else if(this.potentialDelete === this.navSubstate) {
                        this.RemoveTag(this.navSubstate);
                        this.potentialDelete = -1;
                        TunnelEmit(this, "err", this.$t("gameRemoveTagDone").toString());
                        this.navSubstate = Math.min(this.navSubstate, this.game.playInfo.tags.length - 1);
                    }
                }
            } else if(this.gamepadInput.y > 0) {
                this.potentialDelete = -1;
                this.navState = "roms";
                this.navSubstate = 0;
            } else {
                this.potentialDelete = -1;
                this.navSubstate += this.gamepadInput.x;
                if(this.navSubstate < 0) {
                    this.navSubstate = 0;
                } else if(this.game.playInfo && this.navSubstate > this.game.playInfo.tags.length) {
                    this.navSubstate = this.game.playInfo.tags.length;
                }
            }
        }
    }
}
</script>