import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
//import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters
import './styles/global.css'

// 不能在vue文件中使用该行为，否则需要反向代理
/* import tcb from "@cloudbase/js-sdk"
const app = tcb.init({
  env: "hyyc-5ghntdc93de0347c",
  timeout: 60000
})
 */
// （认证）持久化
/* const auth = app.auth({
  persistence: "local"
}) */


//匿名登录
/* export function cloudBaseLoginByAnonymous(){
  return auth.anonymousAuthProvider().signIn()
} */


//使用邮箱和密码登录
/* export function cloudBaseLoginByEmail(email, pwd){
  return auth.signInWithEmailAndPassword(email, pwd)
} */

//获取临时文件
/* export function getTempFile(fileList){
  return app.getTempFileURL({
    fileList
  })
} */

//文件上传
/* export function uploadFile(filename, filePath){
  return app.uploadFile({
    cloudPath:filename,
    filePath,
    onUploadProgress:function(progressEvent){
      //文件进度上传
      let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    }
  })
} */

//删除文件
/* export function deleteFile(cloudFileID){
  let fileList = [];
  if(Array.isArray(cloudFileID)) fileList = fileList.concat(cloudFileID)
  else fileList.push(cloudFileID)

  return app.deleteFile({
    fileList
  })
} */

//下载文件
/* export function downloadF(fileID){
  return app.downloadFile({
    fileID
  })
} */

/* export const cloudApp = app
const db = app.database() */


/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// 让后端接受不到post数据的问题
/* if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
} */

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  //locale: enLang // 如果使用中文，无需设置，请删除
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
