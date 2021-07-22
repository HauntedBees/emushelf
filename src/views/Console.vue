<template>
<v-app v-gamepad:button-a="BtnA" v-gamepad:button-b="BtnB" v-gamepad:button-y="BtnY"
    v-gamepad:left-analog-right.repeat="MvRight" v-gamepad:button-dpad-right.repeat="MvRight" v-gamepad:right-analog-right.repeat="MvRight"
    v-gamepad:left-analog-left.repeat="MvLeft" v-gamepad:button-dpad-left.repeat="MvLeft" v-gamepad:right-analog-left.repeat="MvLeft"
    v-gamepad:left-analog-up.repeat="MvUp" v-gamepad:button-dpad-up.repeat="MvUp" v-gamepad:right-analog-up.repeat.repeat="MvUp2"
    v-gamepad:left-analog-down.repeat="MvDown" v-gamepad:button-dpad-down.repeat="MvDown" v-gamepad:right-analog-down.repeat.repeat="MvDown2">
    <v-app-bar app color="primary">
        <v-btn to="/" text :class="BackState">
            <v-icon>mdi-arrow-left-circle</v-icon>
            <span class="ml-2">{{$t("consoleBack")}}</span>
        </v-btn>
        <v-spacer />
        <div class="d-flex align-center text-h5">
            {{console.name}} ({{Object.keys(games).length}})
        </div>
        <v-spacer />
    </v-app-bar>
    <v-main v-if="gameCount === 0" class="text-center mt-16 mx-16 px-16">
        <i18n path="noGames">
            <span>{{console.name}}</span>
            <a href="#" @click="GoToConsoleSettings($event)" :class="'noGames ' + StateSel('noGames', 0)">{{$t("noGamesInner")}}</a>
        </i18n>
    </v-main>
    <v-main v-if="gameCount > 0">
        <v-row v-if="viewType==='tile'" class="ma-0 pa-0" dense>
            <v-col>
                <v-virtual-scroll :bench="3" ref="virtScrollTile" :items="gameBatches" :itemHeight="300" :height="tileHeight">
                    <template v-slot:default="{ item, index }">
                        <v-row :key="index" class="mt-0 mx-4" dense>
                            <v-col v-for="(game, idx2) in item" class="pa-0 gtcontainer" :key="game">
                                <GameTile v-if="game" :ref="'gameTile' + (index * tilesPerRow + idx2)" :class="GameSel(index * tilesPerRow + idx2)" :key="game" :name="game" :game="games[game]" :console="console"
                                    @select="SelectGame(games[game])" @dblclick="LaunchGame(games[game])" :fonts="fonts" />
                            </v-col>
                        </v-row>
                    </template>
                </v-virtual-scroll>
            </v-col>
            <v-col v-if="currentGame" cols="8">
                <GameCard :game="currentGame" :console="console" :launchNow="openImmediately" :gamepadInput="gamecardInput" @exitgame="ExitGameCard()" />
            </v-col>
        </v-row>
        <v-row v-else class="mt-2 mx-4" dense>
            <v-col cols="4">
                <div class="no-wrap">
                    <v-text-field ref="search" :class="'d-inline-block searchbox ' + StateSel('search', 0)" style="width: calc(100% - 80px)" :label="$t('consoleSearch')" v-model="searchquery" @input="SortAndFilterGames()" prepend-inner-icon="mdi-magnify" clearable />
                    <v-btn v-if="tags.length" @click="ToggleFilter()" style="width: 68px" :class="'ml-3 ' + StateSel('search', 1)" small :color="showFilter ? 'secondary' : 'primary'">{{$t(showFilter ? "consoleHideFilter" : "consoleShowFilter")}}</v-btn>
                </div>
                <div v-if="showFilter">
                    <v-chip-group ref="filterlist" multiple v-model="filterTags" @change="SortAndFilterGames()" :show-arrows="true" style="margin-top:-15px">
                        <v-chip :class="StateSel('filter', i)" v-for="(t, i) in tags" :key="t" :ref="'filtertag' + i" filter small>{{t}}</v-chip>
                    </v-chip-group>
                </div>
                <v-list :two-line="viewType==='normal'" class="pt-0">
                    <v-virtual-scroll ref="virtScroll" :bench="5" :items="filteredGames" :itemHeight="ListItemHeight" :height="listHeight">
                        <template v-slot:default="{ item, index }">
                            <GameList :ref="'game' + index" :class="GameSel(index)" :key="item" :name="item" :game="games[item]" :console="console"
                                @select="SelectGame(games[item])" @dblclick="LaunchGame(games[item])" :compact="viewType==='compact'" :fonts="fonts" />
                            <v-divider />
                        </template>
                    </v-virtual-scroll>
                </v-list>
            </v-col>
            <v-col v-if="currentGame" cols="8">
                <GameCard :game="currentGame" :console="console" :launchNow="openImmediately" :gamepadInput="gamecardInput" @exitgame="ExitGameCard()" />
            </v-col>
        </v-row>
    </v-main>
</v-app>
</template>
<style>
.small-flag {
    margin: -15px -15px !important;
    transform: scale(0.4) !important;
    -ms-transform: scale(.4);
    -webkit-transform: scale(.4) !important;
    -moz-transform: scale(.4);
    vertical-align: middle;
}
.notpreferred { opacity: 0.5 }
.searchbox.control-hover::after, .noGames.control-hover::after {
    width: 0px!important;
    height: 0px!important;
}
.gtcontainer .control-hover::after {
    width: 0px!important;
    height: 0px!important;
}
.gtcontainer .tile-outer.control-hover {
    outline: none!important;
}
.gamepad .gtcontainer .tile-outer.control-hover > * {
    filter: opacity(0.5);
    border: 3px var(--v-success-base) solid !important;
}
</style>
<script lang="ts">
import GameCard from '../components/GameCard.vue';
import GameList from '../components/GameList.vue';
import GameTile from '../components/GameTile.vue';
import { Vue, Component, Prop } from 'vue-property-decorator';
import config, { ConsoleInfo } from '../models/Config';
import { GameInfo } from '../models/GameInfo';
import { GetVueFromVuetifyArray } from '@/utils/VueUtil';
import { OpenDaisywheel } from '@/utils/MiscUtil';
@Component({ components: { GameCard, GameList, GameTile } })
export default class Console extends Vue {
    @Prop() fonts!: string[];
    console!: ConsoleInfo;
    games: {[key: string]: GameInfo} = {};
    gameCount = 0;
    filteredGames: string[] = [];
    searchquery = "";
    listHeight = 100;
    tileHeight = 100;
    currentGame: GameInfo|null = null;
    openImmediately = false;
    viewType = "normal";

    tilesPerRow = 8;
    gameBatches: string[][] = [];

    showFilter = false;
    tags: string[] = [];
    filterTags: number[] = [];

    navState: "gamesel"|"back"|"search"|"game"|"filter"|"noGames" = "gamesel";
    gameScroll = 0;
    navSubstate = 0;
    inSearchWheel = false;
    gamecardInput: ({ x: number, y: number, btn: string })|null = null;

    created(): void {
        const id = this.$route.params.id;
        this.console = config.GetConsole(id);
        this.games = config.GetGames(this.console);
        this.SortAndFilterGames();
        this.gameCount = this.filteredGames.length;
        if(this.gameCount === 0) {
            this.navState = "back";
            this.navSubstate = 0;
        }
        this.OnResize();
        this.tags = config.GetTags(true, true).tags;

        this.viewType = config.GetView();
        this.SetUpTiles();
    }
    mounted(): void { window.addEventListener("resize", this.OnResize); }
    beforeDestroy(): void { window.removeEventListener("resize", this.OnResize); }
    OnResize(): void {
        this.listHeight = window.innerHeight - (this.showFilter ? 189 : 164);
        this.tileHeight = window.innerHeight - 64;
    }
    get ListItemHeight(): number { return this.viewType === "compact" ? 30 : 70; }

    ToggleFilter(): void {
        this.showFilter = !this.showFilter;
        this.filterTags = [];
        this.OnResize();
    }
    SetUpTiles(): void {
        if(this.viewType !== "tile") { return; }
        this.tilesPerRow = config.GetTilesPerRow();
        if(this.currentGame) { this.tilesPerRow = Math.floor(this.tilesPerRow / 3); }
        this.gameBatches = [];
        for(let i = 0; i < this.filteredGames.length; i += this.tilesPerRow) {
            const newRow: string[] = [];
            for(let j = 0; j < this.tilesPerRow; j++) {
                newRow.push(this.filteredGames[i + j]);
            }
            this.gameBatches.push(newRow);
        }
        if(this.currentGame) {
            this.$nextTick(() => {
                if(!this.currentGame) { return; }
                const idx = this.filteredGames.indexOf(this.currentGame.name);
                const row = Math.floor(idx / this.tilesPerRow);
                this.$vuetify.goTo(row * 300, { container: (this.$refs["virtScrollTile"] as Vue) });
            });
        }
    }

    SelectGame(g: GameInfo): void {
        this.openImmediately = false;
        if(this.currentGame) {
            this.currentGame = null;
            this.$nextTick(() => {
                this.currentGame = g;
            });
        } else {
            this.currentGame = g;
            this.SetUpTiles();
        }
    }
    LaunchGame(g: GameInfo): void {
        this.SelectGame(g);
        this.openImmediately = true;
    }
    SortAndFilterGames(): void {
        this.gameScroll = 0;
        const sortedGames = Object.keys(this.games).sort((a, b) => {
            const ga = this.games[a], gb = this.games[b];
            if(ga.playInfo?.favorite === gb.playInfo?.favorite) {
                return a.localeCompare(b);
            } else {
                return ga.playInfo?.favorite ? -1 : 1;
            }
        });
        const query = (this.searchquery || "").toLowerCase();
        this.filteredGames = sortedGames.filter(g => {
            const pi = this.games[g].playInfo;
            if(this.showFilter) {
                const tagMatch = this.showFilter && pi && this.filterTags.every(t => pi.tags.indexOf(this.tags[t]) >= 0);
                if(!tagMatch) { return false; }
            }
            return g.toLowerCase().indexOf(query) >= 0
                || (pi && pi.tags.some(t => t.toLowerCase().indexOf(query) >= 0))
            });
    }
    GoToConsoleSettings(e?: Event): void {
        e?.stopPropagation();
        this.$router.push("/settings?console=" + this.console.shortCode);
    }

//#region Gamepad
    get BackState(): string { return this.navState === "back" ? "control-hover" : ""; }
    GameSel(i: number): string { return (this.navState === "gamesel" && this.gameScroll === i) ? "control-hover" : ""; }
    StateSel(state: string, i: number): string { return (this.navState === state && this.navSubstate === i) ? "control-hover" : ""; }
    BtnA(): void {
        if(this.inSearchWheel) { return; }
        if(this.navState === "noGames") {
            this.GoToConsoleSettings();
        } else if(this.navState === "game") {
            this.gamecardInput = { x: 0, y: 0, btn: "A" };
        } else if(this.navState === "back") {
            this.$router.push("/");
        } else if(this.navState === "search") {
            if(this.navSubstate === 0) { // search
                this.inSearchWheel = true;
                OpenDaisywheel(this, "search", "consoleSearchDW", this.searchquery, s => {
                    this.searchquery = "s";
                    this.SortAndFilterGames();
                    this.inSearchWheel = false;
                }, s => {
                    this.searchquery = s;
                    this.SortAndFilterGames();
                });
            } else { // filter
                this.showFilter = !this.showFilter;
            }
        } else if(this.navState === "gamesel") {
            if(this.viewType === "tile") {
                const vueElem =  GetVueFromVuetifyArray(this, "gameTile" + this.gameScroll, 0);
                (vueElem.$el as HTMLElement).click();
            } else {
                let vueElem = this.$refs["game" + this.gameScroll];
                if(Array.isArray(vueElem)) { vueElem = (vueElem as Vue[])[0]; }
                ((vueElem as Vue).$el as HTMLElement).click();
            }
            this.navState = "game";
            this.navSubstate = 0;
            this.gamecardInput = { x: 0, y: 0, btn: "" };
        } else if(this.navState === "filter") {
            ((this.$refs["filtertag" + this.navSubstate] as Vue[])[0].$el as HTMLElement).click();
        }
    }
    BtnB(): void {
        if(this.inSearchWheel) { return; }
        if(this.navState === "game") {
            this.gamecardInput = { x: 0, y: 0, btn: "B" };
        } else if(this.navState === "back") {
            this.$router.push("/");
        } else if(this.navState === "gamesel" || this.navState === "search" || this.navState === "filter") {
            if(this.navState === "search" && this.navSubstate === 0 && this.searchquery) {
                this.searchquery = "";
                this.SortAndFilterGames();
            } else {
                this.navState = "back";
            }
        } else if(this.navState === "noGames") {
            this.navState = "back";
        }
    }
    ExitGameCard(): void {
        this.navSubstate = 0;
        this.navState = "gamesel";
        this.gamecardInput = null;
    }
    BtnY(): void {
        if(this.inSearchWheel) { return; }
        if(this.navState === "game") {
            this.gamecardInput = { x: 0, y: 0, btn: "Y" };
        }
    }
    MvRight(): void { this.Navigate(1, 0); }
    MvLeft(): void { this.Navigate(-1, 0); }
    MvUp(): void { this.Navigate(0, -1); }
    MvDown(): void { this.Navigate(0, 1); }
    MvUp2(): void { this.Navigate(0, -(this.viewType === "tile" ? Math.floor(this.tileHeight / 300) : Math.floor(this.listHeight / this.ListItemHeight))); }
    MvDown2(): void { this.Navigate(0, this.viewType === "tile" ? Math.floor(this.tileHeight / 300) : Math.floor(this.listHeight / this.ListItemHeight)); }
    Navigate(x: number, y: number): void {
        if(this.inSearchWheel) { return; }
        if(this.navState === "game") {
            this.gamecardInput = { x: x, y: y, btn: "" };
        } else if(this.navState === "back") {
            if(y <= 0) { return; }
            this.navState = this.gameCount === 0 ? "noGames" : (this.viewType === "tile" ? "gamesel" : "search");
            this.navSubstate = 0;
        } else if(this.navState === "noGames") {
            if(y >= 0) { return; }
            this.navState = "back";
            this.navSubstate = 0;
        } else if(this.navState === "search") {
            if(y > 0) {
                this.navState = this.showFilter ? "filter" : "gamesel";
                this.navSubstate = 0;
            } else if(y < 0) {
                this.navState = "back";
                this.navSubstate = 0;
            } else if(x > 0) {
                this.navSubstate = 1;
            } else if(x < 0) {
                this.navSubstate = 0;
            }
        } else if(this.navState === "gamesel") {
            if(this.viewType === "tile") {
                this.gameScroll += y * this.tilesPerRow + x;
                if(this.gameScroll < 0) {
                    this.gameScroll = 0;
                    this.navState = "back";
                    this.navSubstate = 0;
                } else if(this.gameScroll >= this.filteredGames.length) { this.gameScroll = this.filteredGames.length - 1; }
                const row = Math.floor(this.gameScroll / this.tilesPerRow);
                this.$vuetify.goTo(row * 300, { container: (this.$refs["virtScrollTile"] as Vue) });
            } else {
                this.gameScroll += y;
                if(this.gameScroll < 0) {
                    this.gameScroll = 0;
                    this.navState = this.showFilter ? "filter" : "search";
                    this.navSubstate = 0;
                } else if(this.gameScroll >= this.filteredGames.length) { this.gameScroll = this.filteredGames.length - 1; }
                this.$vuetify.goTo(this.ListItemHeight * this.gameScroll, { container: (this.$refs["virtScroll"] as Vue) });
            }
        } else if(this.navState === "filter") {
            if(y > 0) {
                this.navState = "gamesel";
            } else if(y < 0) {
                this.navState = "search";
                this.navSubstate = 1;
            } else {
                this.navSubstate += x;
                if(this.navSubstate < 0) {
                    this.navSubstate = 0;
                } else if(this.navSubstate >= this.tags.length) {
                    this.navSubstate = this.tags.length - 1;
                }
                const wrapper = (this.$refs["filterlist"] as Vue).$el.querySelector(".v-slide-group__wrapper");
                if(wrapper) { wrapper.scrollLeft = ((this.$refs["filtertag" + this.navSubstate] as Vue[])[0].$el as HTMLElement).offsetLeft - 100; }
            }
        }
    }
//#endregion
}
</script>