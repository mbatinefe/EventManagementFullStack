import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/event',
    name: 'event',
    component: () => import('../views/Events.vue')
  },
  {
    path: '/become/volunteer',
    name: 'be_volunteer',
    component: () => import('../views/Become_Volunteer.vue')
  },
  {
    path: '/event/new',
    name: 'new_event',
    component: () => import('../views/New_Event.vue')
  },
  { 
    // non okay
    path: '/event/edit/:id/',
    name: 'edit_event',
    component: () => import('../views/Update_Event.vue'),
  },
  {
    path: '/event/detail/:id/',
    name: 'detail_event',
    component: () => import('../views/Detail_Event.vue')
  },
  {
    path: '/volunteers',
    name: 'see_volunteer',
    component: () => import('../views/Volunteers.vue')
  },
  {
    path: '/volunteer/:id/',
    name: 'update-volunteer',
    component: () => import('../views/Single_Volunteer.vue')
  },
  {
    path: '/volunteer',
    name: 'see-volunteer',
    component: () => import('../views/Single_Volunteer.vue')
  },
  {
    path: '/event/search/',
    name: 'search-event',
    component: () => import('../views/Search_Event.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/myevents',
    name: 'myevents',
    component: () => import('../views/MyEvents.vue')
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // You can keep duplicateNavigationPolicy if you need it, but make sure it's necessary for your use case.
});


export default router;