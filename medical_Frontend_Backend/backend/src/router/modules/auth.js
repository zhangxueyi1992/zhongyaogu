/** When your routing table is too long, you can split it into small modules**/
// 权限组列表

import Layout from '@/layout'

const authRouter = {
  path: '/auth',
  component: Layout,
  redirect: '/auth/authGroup',
  name: 'FoodManager',
  meta: {
    title: '权限管理',
    icon: 'auth'
  },
  children: [
    {
      path: 'authGroup',
      component: () => import('@/views/auth/index.vue'),
      name: 'authGroup',
      meta: { title: '权限管理', noCache: true }
    }
  ]
}

export default authRouter
