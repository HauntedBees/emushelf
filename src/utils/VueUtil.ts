import Vue from 'vue';
export function GetVueFromVuetifyArray(v: Vue, refName: string, idx: number): Vue {
    return (v.$refs[refName] as Vue[])[idx];
}
export function GetInputFromVuetifyArray(v: Vue, refName: string, idx: number): HTMLInputElement {
    return GetVueFromVuetifyArray(v, refName, idx).$el.querySelector("input") as HTMLInputElement;
}
export function GetInputFromVuetifyElement(v: Vue, refName: string): HTMLInputElement {
    return (v.$refs[refName] as Vue).$el.querySelector("input") as HTMLInputElement;
}
export function GetElementFromRef(v: Vue, refName: string): HTMLElement {
    return (v.$refs[refName] as Vue).$el as HTMLElement;
}