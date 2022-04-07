<template>
<div>
    <router-view @msg="ShowInfo" @err="ShowError" @load="ToggleLoad" @loadmsg="SetLoadMsg" @wheel="ToggleWheel" />
    <v-snackbar v-model="showMessage" top centered :color="messageColor">{{messageText}}</v-snackbar>
    <Loader v-if="loading" />
    <div class="loadMsg" v-if="loading && loadingMsg">{{loadingMsg}}</div>
    <div v-if="showDaisywheel" id="vue-daisywheel-js">
        <div id="vue-daisywheel-modal-overlay">
            <div id="vue-daisywheel-modal-container">
                <div id="vue-daisywheel-modal">
                    <Daisywheel :default="daisyValue" :label="daisyLabel" @wheel="ToggleWheel" @btnpress="DaisyChange" />
                </div>
            </div>
        </div>
    </div>
</div>
</template>
<style>
.loadMsg {
    color: #FFFFFF;
    position: absolute;
    top: 57%;
    width: 100%;
    z-index: 999999;
    text-align: center;
}
.v-card__title { word-break: break-word!important }
.no-wrap { white-space: nowrap }
.v-snack__content { text-align: center!important; font-family:Roboto,sans-serif }
body.gamepad .control-hover { outline: 5px auto var(--v-success-base)!important }
body.gamepad .control-hover::after {
    position: absolute;
    content: " ";
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--v-success-base);
    opacity: 0.5;
}
html { overflow-y: auto!important }
::-webkit-scrollbar { width: 10px }
::-webkit-scrollbar-track { background: var(--v-secondary-base) }
::-webkit-scrollbar-thumb { background: var(--v-primary-base) }
::-webkit-scrollbar-thumb:hover { background: var(--v-success-base) }
</style>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { InputOpen } from '@/models/Gamepad';
import { SwitchTheme } from '@/utils/MiscUtil';
import config from '@/models/Config';
@Component
export default class App extends Vue {
    loading = false;
    loadingMsg = "";
    showMessage = false;
    showDaisywheel = false; 
    daisyLabel = "";
    daisyValue = "";
    daisyElement: HTMLInputElement|HTMLTextAreaElement|null = null;
    closeCallback: null|((s: string) => void) = null;
    editCallback: null|((s: string) => void) = null;
    messageText = "";
    messageColor =  "";
    @Watch("$route", { immediate: true, deep: true })
    OnURLChange(): void {
        this.showDaisywheel = false;
        this.daisyElement = null;
        this.closeCallback = null;
        this.editCallback = null;
        this.daisyLabel = "";
    }
    ToggleLoad(state: boolean): void { this.loading = state; this.loadingMsg = ""; }
    SetLoadMsg(msg: string): void { this.loadingMsg = msg; }
    ToggleWheel(info: InputOpen): void {
        if(info.closeCallback) { this.closeCallback = info.closeCallback; }
        if(info.editCallback) { this.editCallback = info.editCallback; }
        this.showDaisywheel = info.open;
        if(info.open) {
            this.daisyLabel = info.label || "";
            this.daisyElement = info.el;
            this.daisyValue = info.value;
        } else if(this.daisyElement) {
            this.daisyElement.blur();
            (document.activeElement as HTMLElement).blur();
            this.daisyElement.value = info.value;
            this.daisyElement = null;
            if(this.closeCallback) { this.closeCallback(info.value); }
        }
    }
    DaisyChange(newVal: string): void {
        if(this.editCallback) { this.editCallback(newVal); }
    }
    ShowInfo(msg: string, reject = true): void {
        if(this.showMessage && reject) {
            this.showMessage = false;
            this.$nextTick(() => this.ShowInfo(msg, false));
        }
        this.showMessage = true;
        this.messageText = msg;
        this.messageColor = "rgb(33, 150, 243)";
    }
    ShowError(msg: string, reject = true): void {
        if(this.showMessage && reject) {
            this.showMessage = false;
            this.$nextTick(() => this.ShowError(msg, false));
        }
        this.showMessage = true;
        this.messageText = msg;
        this.messageColor = "rgb(255, 82, 82)";
    }
    created(): void {
        this.$root.$i18n.locale = config.GetLanguage();
        const styleInfo = config.GetCurrentStyle();
        SwitchTheme(this, styleInfo[0], styleInfo[1]);

        document.addEventListener("mousemove", () => { document.body.classList.remove("gamepad"); });
        document.body.classList.add("gamepad");
        document.addEventListener("gamepaddisconnected", () => {
            if([...navigator.getGamepads()].every(g => g === null)) { document.body.classList.remove("gamepad"); }
        });
        setInterval(() => {
            if(document.body.classList.contains("gamepad")) { return; }
            const gps = navigator.getGamepads();
            for(let i = 0; i < gps.length; i++) {
                const gp = gps[i];
                if(!gp) { return; }
                for(let j = 0; j < gp.buttons.length; j++) {
                    if(gp.buttons[j].pressed) {
                        document.body.classList.add("gamepad");
                        return;
                    }
                }
                for(let j = 0; j < gp.axes.length; j++) {
                    if(Math.abs(gp.axes[j]) > 0.2) {
                        document.body.classList.add("gamepad");
                        return;
                    }
                }
            }
        }, 100);
    }
}
</script>