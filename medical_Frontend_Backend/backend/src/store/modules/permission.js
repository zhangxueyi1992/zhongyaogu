import { asyncRoutes, constantRoutes } from '@/router'
// import {foodTypeOperate} from '@/api/food-type'
import { customGetToken } from '@/utils/auth'
import { Message } from 'element-ui'
import Layout from '@/layout'
import centerRouter from '@/router/modules/person'
import store from '@/store'
import {localCall} from '@/utils/commFunc'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

/* ***获取权限管理** */
/* function getActiveRouter(){
  let sendPostData = {
    $url: 'getRouter',
    id: customGetToken('id')
  }

  return foodTypeOperate(sendPostData)
} */

// 本地获取左侧菜单
function getActiveRouter(){
  const loginUrl = "/api/menu"
  return localCall(loginUrl, {})
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(async resolve => {
      let activeRouter;
      activeRouter = await getActiveRouter()
      activeRouter = activeRouter.data

      if(!activeRouter['code']){
        for(let index in activeRouter['data']){
          activeRouter['data'][index]['component'] = Layout
          if(index == 0){
            activeRouter['data'][index]['redirect'] = activeRouter['data'][index]['path']+'/'+activeRouter['data'][index]['children'][0]['path']
            activeRouter['data'][index]['children'][0]['path'] = activeRouter['data'][index]['path'].replace('\/','')+'/'+activeRouter['data'][index]['children'][0]['path']
            activeRouter['data'][index]['path'] = '/'
          }
          for(let j in activeRouter['data'][index]['children']){
            switch(activeRouter['data'][index]['children'][j]['component']){
              case '@/views/system-config/index.vue':
                activeRouter['data'][index]['children'][j]['component'] = () => import('@/views/system-config/index.vue')
                break;
              case '@/views/user-manager/user.vue':
                activeRouter['data'][index]['children'][j]['component'] = () => import('@/views/user-manager/user.vue')
                break;
              /* case '@/views/auth/index.vue':
                activeRouter['data'][index]['children'][j]['component'] = () => import('@/views/auth/index.vue')
                break; */
              /* case "@/views/accident/accident-list.vue":  //事故管理 New
                //有此权限才能接收到websocket的消息传递
                // store.dispatch('app/setWebsocket', true)
                activeRouter['data'][index]['children'][j]['component'] = () => import('@/views/accident/accident-list.vue')
                break; */
              case '@/views/medical/list.vue':
                activeRouter['data'][index]['children'][j]['component'] = () => import('@/views/medical/list.vue')
                break;
            }
          }
        }
      }else{
        Message.error(activeRouter['message'])
        return;
      }
      // console.log(activeRouter['data'])
      //获取成功之后最后再加一个个人中心
      activeRouter['data'].push(centerRouter)
      for(let i=0;i<asyncRoutes.length;i++){
        activeRouter['data'].push(asyncRoutes[i])
      }
      // console.log(activeRouter['data'])
      
      commit('SET_ROUTES', activeRouter['data'])
      resolve(activeRouter['data'])
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
