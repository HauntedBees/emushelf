<template>
<div>
    <div class="backdrop" />
    <v-progress-circular indeterminate :size="100" :width="7" />
</div>
</template>
<style>
.backdrop {
    background: #000000AA;
    z-index: 9998;
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}
.v-progress-circular {
    z-index: 9999;
    position: absolute;
    height: 100px;
    width: 100px;
    top: calc(50% - 50px);
    left: calc(50% - 50px);
}
.v-progress-circular__overlay { stroke: #AA00AA !important }
</style>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
@Component
export default class Loader extends Vue { }
</script>