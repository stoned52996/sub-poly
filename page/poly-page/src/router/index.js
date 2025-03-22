import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AirportView from '../views/AirportView.vue'
import RuleView from '../views/RuleView.vue'
import GroupView from '../views/GroupView.vue'
import Sub from '../views/Sub.vue'
import CommonConfig from '../views/CommonConfig.vue'
import ReSet from '../views/ReSet.vue'
import SelfSub from '../views/SelfSub.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/airport',
      name: 'airport',
      component: AirportView,
    },
    {
      path: '/rule',
      name: 'rule',
      component: RuleView,
    },
    {
      path: '/group',
      name: 'group',
      component: GroupView,
    },
    {
      path: '/sub',
      name: 'sub',
      component: Sub,
    },
    {
      path: '/config',
      name: 'config',
      component: CommonConfig,
    },
    {
      path: '/reset',
      name: 'reset',
      component: ReSet,
    },
    {
      path: '/selfNode',
      name: 'selfNode',
      component: SelfSub,
    },
  ],
})

export default router
