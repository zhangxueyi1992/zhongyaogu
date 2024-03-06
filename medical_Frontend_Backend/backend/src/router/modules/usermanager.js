/** When your routing table is too long, you can split it into small modules**/
// 食品管理路由

import Layout from '@/layout'

const sysconfigRouter = {
  path: '/userManager',
  component: Layout,
  redirect: '/userManager/user',
  name: 'UsersManager',
  meta: {
    title: '用户管理',
    icon: 'user'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/user-manager/user.vue'),
      name: 'UserManager',
      meta: { title: '用户管理', noCache: true }
    }
  ]
}

export default sysconfigRouter
