<template>
    <div> <!-- multiple v-gamepad bindings for the saem button at the same time don't work too well -->
        <div v-if="selectedPetal && position === 'bottom'" class="button selected button-bottom" :style="styles" v-gamepad:button-a="PressA">{{symbol}}</div>
        <div v-if="selectedPetal && position === 'right'" class="button selected button-right" :style="styles" v-gamepad:button-b="PressB">{{symbol}}</div>
        <div v-if="selectedPetal && position === 'left'" class="button selected button-left" :style="styles" v-gamepad:button-x="PressX">{{symbol}}</div>
        <div v-if="selectedPetal && position === 'top'" class="button selected button-top" :style="styles" v-gamepad:button-y="PressY">{{symbol}}</div>
        <div v-if="!selectedPetal" :class="'button button-' + position" :style="styles">{{symbol}}</div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { TunnelEmit } from '../../utils/MiscUtil';
@Component
export default class Button extends Vue {
    @Prop() position!: string;
    @Prop() selectedPetal!: boolean;
    @Prop() symbol!: string;
    selected = false;
    get SelectedClass(): string { return this.selected ? " selected" : ""; }
    get styles(): {[key: string]: number} {
        return { "opacity": this.symbol ? 1 : 0.5 };
    }
    PressA(): void { TunnelEmit(this, "btnsel", this.symbol); }
    PressB(): void { TunnelEmit(this, "btnsel", this.symbol); }
    PressX(): void { TunnelEmit(this, "btnsel", this.symbol); }
    PressY(): void { TunnelEmit(this, "btnsel", this.symbol); }
}
</script>