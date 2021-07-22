<template>
    <div id="vue-daisywheel-controls-ui">
        <div v-for="ui in uiElements" :key="ui" :id="`vue-daisywheel-${ui}-ui`" class="control-ui cf">
            <div class="control-ui-icon"></div>
            <div class="control-ui-label" :title="labels[ui]">
                {{labels[ui]}}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
@Component
export default class Controls extends Vue {
    uiElements = ["L1", "L3", "R1", "L2", "R2"];
    labels = {
        "L1": this.$t("daisyWheelBackspace"),
        "L3": this.$t("daisyWheelSelectPetal"),
        "L2": this.$t("daisyWheelGoToSet3"),
        "R2": this.$t("daisyWheelGoToSet2"),
        "R1": this.$t("daisyWheelAddSpace")
    };
}
</script>