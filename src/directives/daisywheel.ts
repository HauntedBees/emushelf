import Vue from 'vue';
Vue.directive("daisywheel", {
    bind(el, binding, vnode) {
        let realEl: HTMLInputElement|HTMLTextAreaElement;
        if(el.classList.contains("v-text-field")) { // Vuetify Text fields
            const innerInput = el.querySelector("input");
            if(!innerInput) { return; }
            realEl = innerInput;
        } else if(el.classList.contains("v-textarea")) { // Vuetify Text areas
            const innerTextarea = el.querySelector("textarea");
            if(!innerTextarea) { return; }
            realEl = innerTextarea;
        } else if(el.tagName === "INPUT") {
            realEl = (el as HTMLInputElement);
        } else if(el.tagName === "TEXTAREA") {
            realEl = (el as HTMLTextAreaElement);
        } else { return; }
        realEl.addEventListener("txtSelect", () => {
            vnode.context?.$emit("wheel", { open: true, el: realEl, value: realEl.value });
        });
    }
});