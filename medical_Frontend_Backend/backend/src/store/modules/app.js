import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium',
  loginStatus: null, //记录用户登录的匿名状态
  watcher: null, //监听状态
  websocketAuth: null,  //websockt的权限
  hasMessage: false,  //是否有最新消息
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  LOGIN_STATUS: (state, status) => {
    state.loginStatus = status
  },//设置登录状态
  WATCHER: (state, watcher) => {
    state.watcher = watcher
  },//设置监听器
  WEBSOCKETAUTH: (state, websocketAuth) => {
    state.websocketAuth = websocketAuth
  },//连接器
  HASMESSAGE: (state, hasMessage) => {
    state.hasMessage = hasMessage
  }//是否有最新消息
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setLoginStatus({commit}, loginStatus){
    commit('LOGIN_STATUS', loginStatus)
  },//提交登录状态
  setWatcher({commit}, watcher){
    commit('WATCHER', watcher)
  },
  setWebsocket({commit}, websocketAuth){
    commit('WEBSOCKETAUTH', websocketAuth)
  },
  setHasMessage({commit}, hasMessage){
    commit('HASMESSAGE', hasMessage)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
