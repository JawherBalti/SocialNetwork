import Vue from 'vue';
import VueRouter from 'vue-router';
import Login from '../views/Login.vue';
import Signup from '../views/Signup.vue';
import Feed from '../views/Feed.vue';
import Profile from '../views/Profile.vue';
import Users from '../views/Users.vue'

Vue.use(VueRouter);
const mode = 'history';
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/Signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/Feed',
    name: 'Feed',
    component: Feed
  },
  {
    path: '/Profile/:id',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/Users',
    name: 'Users',
    component: Users
  }
];

const router = new VueRouter({
  routes, mode
});

export default router;
