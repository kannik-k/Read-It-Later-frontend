import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/components/LoginView.vue";
import CreateAccountView from "@/components/CreateAccountView.vue";
import CreateBookView from "@/components/CreateBookView.vue";
import WishList from "@/components/WishList.vue";
import Recommended from "@/components/Recommended.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/create_account',
      name: 'create_account',
      component: CreateAccountView
    },
    {
      path: '/create_book',
      name: 'create_book',
      component: CreateBookView
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: WishList
    },
    {
      path: '/recommended',
      name: 'recommended',
      component: Recommended
    }
  ]
})

export default router
