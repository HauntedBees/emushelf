import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/Home.vue'
import Console from '../views/Console.vue';
import Settings from '../views/Settings.vue';

Vue.use(VueRouter);
const routes: Array<RouteConfig> = [
    { path: "/", name: "Home", component: Home },
    { path: "/settings", name: "Settings", component: Settings },
    { path: "/:id", name: "Console", component: Console }
];

const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
});
export default router;