<template>
    <div id="vue-daisywheel">
        <div id="vue-daisywheel-input-controller">
            <div id="vue-daisywheel-input">
                <v-text-field solo-inverted full-width v-model="inputValue" :label="label" :placeholder="label" />
            </div>
        </div>
        <Flower :selectedSymbol="selectedSymbol" :symbols="symbols"
            v-gamepad:left-analog-up="() => { up = true }"
            v-gamepad:left-analog-up.released="() => { up = false }"
            v-gamepad:left-analog-down="() => { down = true }"
            v-gamepad:left-analog-down.released="() => { down = false }"
            v-gamepad:left-analog-right="() => { right = true }"
            v-gamepad:left-analog-right.released="() => { right = false }"
            v-gamepad:left-analog-left="() => { left = true }"
            v-gamepad:left-analog-left.released="() => { left = false }"
            v-gamepad:trigger-left="() => { lt = true }"
            v-gamepad:trigger-left.released="() => { lt = false }"
            v-gamepad:trigger-right="() => { rt = true }"
            v-gamepad:trigger-right.released="() => { rt = false }"
            v-gamepad:shoulder-right="AddSpace"
            v-gamepad:shoulder-left="Backspace"
            v-gamepad:button-start="CloseWheel"
            v-gamepad:button-select="CloseWheel"
            v-gamepad:button-b="CloseWheel"
            @btnsel="GetButton($event)" />
        <Controls />
    </div>
</template>
<style>
    @import "../styles.css";
</style>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Controls from './Controls.vue';
import Flower from './Flower.vue';
@Component({ components: { Controls, Flower } })
export default class Daisywheel extends Vue {
    @Prop({ default: "" }) label!: string;
    @Prop({ default: "" }) default!: string;
    up = false; left = false; right = false; down = false;
    lt = false; rt = false;
    inputValue = "";
    SymbolSets = [
        this.$t("daisyWheelCharacterSet1").toString().split(""),
        this.$t("daisyWheelCharacterSet2").toString().split(""),
        this.$t("daisyWheelCharacterSet3").toString().split("")
    ];
    created(): void { this.inputValue = this.default; }
    get symbols(): string[] {
        if(this.rt) {
            return this.SymbolSets[1];
        } else if(this.lt) {
            return this.SymbolSets[2];
        } else {
            return this.SymbolSets[0];
        }
    }
    get selectedSymbol(): number {
        const idx = (this.up ? 1 : 0) + (this.right ? 2 : 0) + (this.down ? 4 : 0) + (this.left ? 8 : 0);
        switch(idx) {
            case 1: return 0; // U
            case 3: return 1; // UR
            case 2: return 2; // R
            case 6: return 3; // DR
            case 4: return 4; // D
            case 12: return 5; // DL
            case 8: return 6; // L
            case 9: return 7; // UL
            default: return -1;
        }
    }
    CloseWheel(): void { this.$emit("wheel", { open: false, value: this.inputValue }); }

    GetButton(s: string): void { this.inputValue += s; this.InputChanged();}
    AddSpace(): void { this.inputValue += " "; this.InputChanged(); }
    Backspace(): void { this.inputValue = this.inputValue.substring(0, this.inputValue.length - 1); this.InputChanged(); }
    InputChanged(): void { this.$emit("btnpress", this.inputValue); }
}
</script>