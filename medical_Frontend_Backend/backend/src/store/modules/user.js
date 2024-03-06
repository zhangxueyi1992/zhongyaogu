import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken, customSetToken, customRemoveToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        let { data } = response
        const message = data && data.message
        // 云函数直接使用data
        // 本地需要使用data.data
        data = data && data.data || null
        if(data && typeof data == "object"){
          commit('SET_TOKEN', data.token)
          // commit('SET_ROLES', data.roles)
          setToken(data.token)
          // 自定义设置返回的信息
          customSetToken('roles', data.roles)
          customSetToken('name', data.name)
          customSetToken('avatar', data.avatar?'http://localhost:3000/'+data.avatar:'')
          customSetToken('introduction', data.introduction)
          customSetToken('id', data.id)
          resolve(data)
        }else{
          reject(message || response.message)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('确认失败， 请重新登录。')
        }

        const { roles, name, avatar, introduction, id } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: 角色必须为非空数组！')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  //设置Avatar
  setAvatar({commit}, avatar){
    customSetToken('avatar', avatar)
    commit('SET_AVATAR', avatar)
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then((res) => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', null)
        commit('SET_AVATAR', null)
        commit('SET_INTRODUCTION', null)
        removeToken()
        customRemoveToken('avatar')
        customRemoveToken('introduction')
        customRemoveToken('name')
        customRemoveToken('roles')
        customRemoveToken('id')
        resetRouter()
        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })
        resolve(res ? res : 'cancel')
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_AVATAR', null)
      commit('SET_INTRODUCTION', null)
      removeToken()
      customRemoveToken('avatar')
      customRemoveToken('introduction')
      customRemoveToken('name')
      customRemoveToken('roles')
      customRemoveToken('id')
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
