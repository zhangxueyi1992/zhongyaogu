/** When your routing table is too long, you can split it into small modules**/
// 订单管理路由

import Layout from '@/layout'

const foodManagerRouter = {
  path: '/order',
  component: Layout,
  redirect: '/order/orderList',
  name: 'OrderManager',
  meta: {
    title: '订单管理',
    icon: 'documentation'
  },
  children: [
    {
      path: 'orderList',
      component: () => import('@/views/order/index'),
      name: 'orderList',
      meta: { title: '订单列表', noCache: true }
    },
    {
      path: 'orderAnalysis',
      component: () => import('@/views/order/analysis'),
      name: 'orderAnalysis',
      meta: { title: '订单分析', noCache: true }
    }
  ]
}

export default foodManagerRouter
