import { StyleInfo } from "@/models/Config";
import { InputOpen } from "@/models/Gamepad";
import { ipcRenderer } from "electron";
import { FontList, getFonts } from 'font-list';

import Vue from "vue";
export function TunnelEmit(v: Vue, event: string, value: boolean|string|InputOpen): void {
    while(v && !v.$listeners[event]) { v = v.$parent; }
    if(!v) { return; }
    v.$emit(event, value);
}
export function Load(v: Vue, value: boolean): void { TunnelEmit(v, "load", value); }
export function SetFullScreen(fullscreen: boolean): void { ipcRenderer.invoke("fullscreen", fullscreen); }
export function OpenDevTools(): void { ipcRenderer.invoke("devtools"); }

export function SwitchTheme(v: Vue, s: StyleInfo, backup: StyleInfo): void {
    v.$vuetify.theme.dark = s.dark;
    const ct = v.$vuetify.theme.themes[s.dark ? "dark": "light"];
    const colors: ("primary"|"accent"|"secondary"|"success"|"info"|"warning"|"error")[] = ["primary", "accent", "secondary", "success", "info", "warning", "error"];
    colors.forEach(c => {
        ct[c] = s[c] || backup[c] || ct[c];
    });

    const needToAdd = document.getElementById("themeStyles") === null;
    const styleElement = needToAdd ? document.createElement("style") : (document.getElementById("themeStyles") as HTMLStyleElement);
    styleElement.id = "themeStyles";
    
    let newStyles = "";
    if(s.depressed) { newStyles += ".v-btn { box-shadow: none!important }"; }
    if(s.borderRadius !== undefined) { newStyles += `.v-btn { border-radius: ${s.borderRadius}px!important }`; }
    if(s.customCSS) { newStyles += s.customCSS; }
    if(s.primaryText !== undefined) { newStyles += `.v-btn.primary { color: ${s.primaryText}!important }`; }
    if(s.accentText !== undefined) { newStyles += `.v-btn.accent { color: ${s.accentText}!important }`; }
    if(s.secondaryText !== undefined) { newStyles += `.v-btn.secondary { color: ${s.secondaryText}!important }`; }
    if(s.successText !== undefined) { newStyles += `.v-btn.success { color: ${s.successText}!important }`; }
    if(s.infoText !== undefined) { newStyles += `.v-btn.info { color: ${s.infoText}!important }`; }
    if(s.warningText !== undefined) { newStyles += `.v-btn.warning { color: ${s.warningText}!important }`; }
    if(s.errorText !== undefined) { newStyles += `.v-btn.error { color: ${s.errorText}!important }`; }

    styleElement.innerHTML = newStyles;
    if(needToAdd) { document.head.append(styleElement); }

    document.body.style.background = s.dark ? "#121212" : "#FFFFFF";
}

export interface ThemeInfo {
    textColor: string;
    bgColor: string;
    font: string;
}
function UseDarkFont(r: number, g: number, b: number): boolean {
    return (r * 0.299 + g * 0.587  + b * 0.114) > 180;
}

export async function GetFonts(): Promise<FontList> { return getFonts(); }

export function MakeUpTheme(name: string, fonts: FontList): ThemeInfo {
    let nameVal = 0;
    for(let i = 0; i < name.length; i++) { 
        nameVal += (i + 1) * name.charCodeAt(i);
    }
    const bgRed = nameVal % 255;
    const bgGreen = nameVal % 127 + nameVal % 128; 
    const bgBlue = Math.abs(nameVal - 123) % 255;

    const fontDark = UseDarkFont(bgRed, bgBlue, bgGreen);
    const fr = nameVal % 26, fg = (nameVal % 10923) % 26, fb = (Math.floor(nameVal / 69420) * 100) % 26;
    const textRed = fontDark ? fr : (255 - fr);
    const textGreen = fontDark ? fg : (255 - fg);
    const textBlue = fontDark ? fb : (255 - fb);

    return {
        textColor: `rgb(${textRed}, ${textGreen}, ${textBlue})`,
        bgColor: `rgb(${bgRed}, ${bgGreen}, ${bgBlue})`,
        font: fonts[nameVal % fonts.length]
    };
}

export function OpenDaisywheel(component: Vue, refName: string, labelKey: string, value: string, closeCallback: (s: string) => void, editCallback?: (s: string) => void) {
    TunnelEmit(component, "wheel", {
        open: true,
        el: ((component.$refs[refName] as Vue).$el) as HTMLInputElement,
        value: value,
        label: component.$t(labelKey).toString(),
        editCallback: editCallback,
        closeCallback: closeCallback
    });
}