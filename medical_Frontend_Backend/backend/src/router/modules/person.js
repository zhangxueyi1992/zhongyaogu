/** When your routing table is too long, you can split it into small modules**/
// 权限组列表

import Layout from '@/layout'

const centerRouter = {
  path: '/center',
  component: Layout,
  redirect: '/center/personal',
  name: 'PersonalCenter',
  meta: {
    title: '个人中心',
    icon: 'center'
  },
  children: [
    {
      path: 'personal',
      component: () => import('@/views/center/index.vue'),
      name: 'PersonalCenter',
      meta: { title: '个人中心', noCache: true }
    }
  ]
}

export default centerRouter
