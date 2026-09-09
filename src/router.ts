import {createRouter,createWebHistory} from 'vue-router';
import Tables from './views/Tables.vue';
import Kitchen from './views/Kitchen.vue';
import Payments from './views/Payments.vue';
import Menu from './views/Menu.vue';
export const router=createRouter({history:createWebHistory(),routes:[{path:'/',component:Tables},{path:'/cocina',component:Kitchen},{path:'/caja',component:Payments},{path:'/catalogo',component:Menu}]});