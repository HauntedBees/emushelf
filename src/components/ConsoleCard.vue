<template>
<v-card @click="ViewConsole()" class="ma-2" style="cursor:pointer" color="#FFFFFF"><!-- gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,1)"  -->
	<v-img :alt="console.name" class="white--text align-end" contain :src="ImagePath" height="300px">
        <v-card-actions>
            <v-card-title class="py-0 black--text" v-text="console.name" />
            <v-spacer />
            <BeeTooltip :tooltip="$t(console.favorite ? 'consoleFavRemove' : 'consoleFavAdd')">
                <v-btn icon><v-icon large @click="ToggleFavorite" :color="console.favorite ? 'red' : 'grey'">mdi-heart</v-icon></v-btn>
            </BeeTooltip>
        </v-card-actions>
    </v-img>
</v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import config, { ConsoleInfo } from '../models/Config';
@Component
export default class ConsoleCard extends Vue {
    @Prop() console!:ConsoleInfo;
    get ImagePath(): string {
        if(this.console.image) {
            return this.console.image;
        } else if(this.console.default) {
            return require(`@/assets/img/${this.console.shortCode}.png`);
        } else {
            return require("@/assets/notavailable.png");
        }
    }
    ViewConsole(): void { this.$router.push("/" + this.console.shortCode); }
    ToggleFavorite(e: Event): void {
        this.console.favorite = !this.console.favorite;
        config.UpdateConsole(this.console);
        e.stopPropagation();
    }
}
</script>