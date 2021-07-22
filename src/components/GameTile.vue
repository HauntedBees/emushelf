<template>
<div @click="Click()" @dblclick="DblClick()" class="tile-outer">
    <v-img v-if="game.image" :src="game.image" height="300px">
        <v-icon v-if="game.playInfo && game.playInfo.favorite" color="red" class="favorite">mdi-heart</v-icon>
    </v-img>
    <div v-else class="game-tile tile-outer" :style="`background-color: ${theme.bgColor}; color: ${theme.textColor}; font-family: ${theme.font}`">
        <span>{{game.name}}</span>
        <v-icon v-if="game.playInfo && game.playInfo.favorite" color="red" class="favorite">mdi-heart</v-icon>
    </div>
</div>
</template>
<style scoped>
.tile-outer { background-color: var(--v-success-base); cursor: pointer; user-select: none; }
.game-tile {
    height: 300px;
    font-weight: bold;
    text-align: center;
    display: flex;
    align-items: center;
}
.game-tile > span { margin: 0 auto }
.favorite { -webkit-text-stroke: 0.5px black; float: right }
</style>
<script lang="ts">
import CountryFlag from 'vue-country-flag';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { GameInfo } from '../models/GameInfo';
import config, { ConsoleInfo } from '../models/Config';
import imageAPI from '../utils/ImageAPI';
import { MakeUpTheme, ThemeInfo } from '../utils/MiscUtil';
@Component({ components: { CountryFlag } })
export default class GameTile extends Vue {
    @Prop() game!: GameInfo;
    @Prop() name!: string;
    @Prop() console!: ConsoleInfo;
    @Prop() fonts!: string[];
    theme: ThemeInfo = {
        textColor: "#000000",
        bgColor: "#FFFFFF",
        font: "Roboto"
    };
    mounted(): void {
        this.GetImage(true);
        if(!this.game.image) { this.theme = MakeUpTheme(this.game.name, this.fonts); }
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
}
</script>