/** When your routing table is too long, you can split it into small modules**/
// 食品管理路由

import Layout from '@/layout'

const sysconfigRouter = {
  path: '/sysconfig',
  component: Layout,
  redirect: '/sysconfig/index',
  name: 'SysConfig',
  meta: {
    title: '系统设置',
    icon: 'sysconfig'
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/system-config/index.vue'),
      name: 'SystemConfig',
      meta: { title: '系统设置', noCache: true }
    }
  ]
}

export default sysconfigRouter
