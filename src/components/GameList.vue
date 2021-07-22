<template>
<v-list-item class="game-card" @click="Click()" @dblclick="DblClick()" :style="styles">
    <v-list-item-content :class="compact ? 'gcli py-0' : 'gcli'">
        <v-list-item-title v-if="compact">
            <v-icon v-if="game.playInfo && game.playInfo.favorite" small color="red" class="mr-1 favorite">mdi-heart</v-icon>
            <CountryFlag v-for="r in game.regions" :key="r" :country="r" size="small" />
            {{name}}
        </v-list-item-title>
        <v-list-item-title v-if="!compact">
            <span class="mr-2">{{name}}</span>
            <span v-if="Playtime" class="mr-2 font-weight-thin">{{Playtime}}</span>
            <v-chip x-small v-if="game.filenames.length > 1">{{game.filenames.length}}</v-chip>
            <v-icon v-if="game.playInfo && game.playInfo.favorite" small color="red" class="ml-1 favorite">mdi-heart</v-icon>
        </v-list-item-title>
        <v-list-item-subtitle v-if="!compact">
            <CountryFlag v-for="r in game.regions" :key="r" :country="r" size="small" />
            <v-icon v-if="game.discs > 1">mdi-numeric-{{game.discs}}-box-multiple-outline</v-icon>
            <v-icon v-if="game.manuals.length > 0">mdi-book-open-page-variant-outline</v-icon>
            <span v-for="attr in game.addtlInfo" :key="attr">
                <BeeTooltip v-if="attr === 'Unlicensed'" :tooltip="$t('gameUnlicensed')">
                    <v-icon class="ml-1">mdi-incognito-circle</v-icon>
                </BeeTooltip>
                <BeeTooltip v-else-if="attr === 'Verified'" :tooltip="$t('gameVerified')">
                    <v-icon class="ml-1">mdi-check-decagram</v-icon>
                </BeeTooltip>
                <BeeTooltip v-else-if="attr === 'Worldwide'" :tooltip="$t('Worldwide')">
                    <v-icon class="ml-1">mdi-earth</v-icon>
                </BeeTooltip>
                <v-chip v-else x-small label class="ml-1">{{attr}}</v-chip>
            </span>
        </v-list-item-subtitle>
    </v-list-item-content>
</v-list-item>
</template>
<style scoped>
.compactname { display: inline-block; width: 70%; overflow-x: hidden; vertical-align: middle; text-overflow: ellipsis; }
.gcli { z-index: 100 }
.game-card { padding-right: 0!important; min-height: 30px!important }
.favorite { -webkit-text-stroke: 0.5px black }
</style>
<script lang="ts">
import CountryFlag from 'vue-country-flag';
import { MakeUpTheme, ThemeInfo } from '../utils/MiscUtil';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { GameInfo } from '../models/GameInfo';
import config, { ConsoleInfo } from '../models/Config';
import imageAPI from '../utils/ImageAPI';

@Component({ components: { CountryFlag } })
export default class GameList extends Vue {
    @Prop() game!: GameInfo;
    @Prop() name!: string;
    @Prop() compact!: boolean;
    @Prop() console!: ConsoleInfo;
    @Prop() fonts!: string[];
    theme: ThemeInfo = {
        textColor: "#000000",
        bgColor: "#FFFFFF",
        font: "Roboto"
    };
    get styles(): string {
        if(this.compact) {
            return `background-color: ${this.theme.bgColor}; color: ${this.theme.textColor}!important; font-family: ${this.theme.font}`;
        } else {
            return `background: linear-gradient(to right, #1E1E1E 80%, #1E1E1E00), url('${this.game.image}') no-repeat right center`;
        }
    }
    mounted(): void {
        if(this.compact) {
            this.theme = MakeUpTheme(this.game.name, this.fonts);
        } else if(!this.game.image) {
            this.GetImage(true);
        }
        config.SortGameAttributes(this.game.addtlInfo);
    }
    Click(): void {
        this.$emit("select");
        this.GetImage(false);
    }
    DblClick(): void {
        this.$emit("dblclick");
        this.GetImage(false);
    }
    async GetImage(localOnly: boolean): Promise<void> {
        try {
            const imgPath = await imageAPI.GetGameImage(this.name, this.console.shortCode, localOnly);
            if(!imgPath) { return; }
            this.game.image = imageAPI.LoadBase64Image(imgPath);
        } catch {
            if(!localOnly) { this.$emit("err", this.$t("errLoadingImage").toString()); }
        }
    }
    get Playtime(): string {
        if(!this.game.playInfo || this.game.playInfo.playtime === 0) { return ""; }
        const num = this.game.playInfo.playtime;
        const days = Math.floor(num / 86400);
        const hours = Math.floor((num - days * 86400) / 3600);
        const minutes = Math.floor((num - days * 86400 - hours * 3600) / 60);
        const seconds = num - - days * 86400 - hours * 3600 - minutes * 60;
        let finalString = `${seconds}s`;
        if(minutes > 0) { finalString = `${minutes}m${finalString}`; }
        if(hours > 0) { finalString = `${hours}h${finalString}`; }
        if(days > 0) { finalString = `${days}d${finalString}`; }
        return finalString;
    }
}
</script>