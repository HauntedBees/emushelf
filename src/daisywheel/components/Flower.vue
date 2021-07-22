<template>
    <div id="vue-daisywheel-flower">
        <Petal v-for="(s, i) in Symbols" :key="i" :symbols="s" :selected="selectedSymbol === i" />
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Petal from './Petal.vue';
@Component({ components: { Petal } })
export default class Flower extends Vue {
    @Prop() symbols!:string[];
    @Prop() selectedSymbol!: number;
    get Symbols(): string[][] {
        const symbolSet: string[][] = [];
        for(let i = 0; i < 32; i += 4) {
            const set = [
                this.symbols[i],
                this.symbols[i + 1],
                this.symbols[i + 2],
                this.symbols[i + 3]
            ];
            symbolSet.push(set);
        }
        return symbolSet;
    }
    mounted(): void {
        const radius = 208, petalDiameter = 160, width = 640, height = 640, step = (2 * Math.PI) / 8;
        let stylesStr = "", angle = -step * 2;

        const needToAdd = document.getElementById("flowerStyles") === null;
        const styleElement = needToAdd ? document.createElement("style") : (document.getElementById("flowerStyles") as HTMLStyleElement);
        styleElement.id = "flowerStyles";

        for(let i = 0; i < 8; i++) {
            const x = Math.round(width / 2 + radius * Math.cos(angle) - petalDiameter / 2);
            const y = Math.round(height / 2 + radius * Math.sin(angle) - petalDiameter / 2);
            const rotation = angle * 180 / Math.PI + 135;
            stylesStr += `
                #vue-daisywheel-js .petal-container:nth-of-type(${i + 1}) {
                    top: ${y}px;
                    left: ${x}px;
                    transform: rotate(${rotation}deg);
                }
                #vue-daisywheel-js .petal-container:nth-of-type(${i + 1}) .buttons {
                    transform: rotate(-${rotation}deg);
                }`;
            angle += step;
        }
        styleElement.innerHTML = stylesStr;
        if(needToAdd) { document.head.append(styleElement); }
    }
}
</script>