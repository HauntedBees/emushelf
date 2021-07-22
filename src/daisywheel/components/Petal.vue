<template>
    <div :class="'petal-container' + SelectedClass">
        <div class="petal">
            <div class="petal-inner">
                <div class="buttons">
                    <Button v-for="(p, i) in buttonPositions" :key="i" :position="p" :symbol="symbols[i]" :selectedPetal="selected" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Button from './Button.vue';
@Component({ components: { Button } })
export default class Petal extends Vue {
    @Prop() symbols!: string[];
    @Prop({ default: false }) selected!: boolean;
    get SelectedClass(): string { return this.selected ? " selected" : ""; }
    buttonPositions = ["left", "top", "right", "bottom"];
}
</script>