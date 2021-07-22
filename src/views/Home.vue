<template>
<v-app v-gamepad:button-a="BtnA" v-gamepad:button-y="BtnY"
    v-gamepad:left-analog-right.repeat="MvRight" v-gamepad:button-dpad-right.repeat="MvRight" v-gamepad:right-analog-right.repeat="MvRight"
    v-gamepad:left-analog-left.repeat="MvLeft" v-gamepad:button-dpad-left.repeat="MvLeft" v-gamepad:right-analog-left.repeat="MvLeft"
    v-gamepad:left-analog-up.repeat="MvUp" v-gamepad:button-dpad-up.repeat="MvUp" v-gamepad:right-analog-up.repeat="MvUp"
    v-gamepad:left-analog-down.repeat="MvDown" v-gamepad:button-dpad-down.repeat="MvDown" v-gamepad:right-analog-down.repeat="MvDown">
    <v-app-bar app class="px-0" color="primary">
        <div class="d-flex align-center text-h5 pl-4">
            {{$t("name")}} v{{v}}
        </div>
        <v-spacer></v-spacer>
        <v-btn text @click="Quit()" :class="MenuSel(-2)">
            <span class="mr-2">{{$t("quitProgram")}}</span>
            <v-icon>mdi-exit-to-app</v-icon>
        </v-btn>
        <v-btn text to="/settings" :class="MenuSel(-1)">
            <span class="mr-2">{{$t("goToSettings")}}</span>
            <v-icon>mdi-cog</v-icon>
        </v-btn>
    </v-app-bar>
    <v-main>
        <v-row class="mt-2 mx-4" dense v-if="consoles.length">
            <v-col cols="4" v-for="(console, i) in consoles" :key="console.key">
                <ConsoleCard :console="console" :ref="'console' + i" :class="MenuSel(i)" />
            </v-col>
        </v-row>
        <v-row class="mt-2 mx-4" dense v-else>
            <v-col>
                {{$t("welcome")}}
            </v-col>
        </v-row>
    </v-main>
</v-app>
</template>
<style>
.px-0 .v-toolbar__content { padding: 0px }
</style>
<script lang="ts">
import ConsoleCard from '../components/ConsoleCard.vue';
import { Vue, Component } from 'vue-property-decorator';
import config from '../models/Config';
@Component({ components: { ConsoleCard } })
export default class Home extends Vue {
    v = require("../../package.json").version; // eslint-disable-line
    consoles = config.GetPlayableConsoles();
    navState = 0;
    MenuSel(i: number): string { return this.navState === i ? "control-hover" : ""; }
    BtnA(): void {
        if(this.navState === -2) {
            window.close();
        } else if(this.navState === -1) {
            this.$router.push("/settings");
        } else {
            this.$router.push("/" + this.consoles[this.navState].shortCode);
        }
    }
    BtnY(): void {
        if(this.navState < 0) { return; }
        this.consoles[this.navState].favorite = !this.consoles[this.navState].favorite;
        config.UpdateConsole(this.consoles[this.navState]);
    }
    MvRight(): void { this.Navigate(1, 0); }
    MvLeft(): void { this.Navigate(-1, 0); }
    MvUp(): void { this.Navigate(0, -1); }
    MvDown(): void { this.Navigate(0, 1); }
    Navigate(x: number, y: number): void {
        if(x !== 0) { // left and right
            if(x < 0 && this.navState === -1) { this.navState = -2; }
            else if(x > 0 && this.navState === -2) { this.navState = -1; }
            else { this.navState = this.navState - (this.navState % 3) + (3 + (this.navState + x)) % 3; }
        }
        if(y !== 0) { // up and down
            this.navState += 3 * y;
            if(this.navState < 0) { this.navState = -1; }
        }
        if(this.navState >= this.consoles.length) {
            this.navState = this.consoles.length - 1;
        }
        if(this.navState >= 0) {
            (this.$refs["console" + this.navState] as Vue[])[0].$el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
    Quit(): void { window.close(); }
}
</script>