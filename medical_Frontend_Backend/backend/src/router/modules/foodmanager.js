/** When your routing table is too long, you can split it into small modules**/
// 食品管理路由

import Layout from '@/layout'

const foodManagerRouter = {
  path: '/foodManager',
  component: Layout,
  redirect: '/foodManager/foodType',
  name: 'FoodManager',
  meta: {
    title: '食品管理',
    icon: 'dinner'
  },
  children: [
    {
      path: 'foodType',
      component: ()=> import('@/views/food-manager/food-type.vue'),
      name: 'FoodType',
      meta: { title: '食品分类列表', noCache: true }
    },
    {
      path: 'foodName',
      component: () => import('@/views/food-manager/food.vue'),
      name: 'FoodName',
      meta: { title: '食品列表', noCache: true }
    }
  ]
}

export default foodManagerRouter
