<template>
    <v-tooltip :top="!bottom" :bottom="bottom">
        <template v-slot:activator="{ on, attrs }">
            <span class="bee-span-tooltip" v-bind="attrs" v-on="on">
                <slot></slot>
            </span>
        </template>
        <span>{{tooltip}}</span>
    </v-tooltip>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component
export default class BeeTooltip extends Vue {
    @Prop() tooltip?: string;
    @Prop({ default: false }) bottom!: boolean;
}
</script>