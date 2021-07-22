import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
Vue.use(Vuetify);
export default new Vuetify({
    theme: {
        dark: true,
        options: { customProperties: true },
        themes: {
            dark: {
                primary: "#A018A8",
                accent: "#8736D5",  // not actually used anywhere
                secondary: "#796083",
                success: "#4CAF67",
                info: "#67A6D8",    // not actually used anywhere
                warning: "#F0AE5A", // not actually used anywhere
                error: "#FF526A"
            },
            light: {
                primary: "#F225FF",
                accent: "#B15FFF",
                secondary: "#D7BCE2",
                success: "#61EB87",
                info: "#71BBF5",
                warning: "#FFA738",
                error: "#FF2241"
            }
        }
    }
});