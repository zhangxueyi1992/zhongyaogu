import {customGetToken} from '@/utils/auth' //获取相关cookie信息
// import {cloudCallFunction, localCall} from '@/utils/commFunc'
import {localCall} from '@/utils/commFunc'
import {MessageBox} from 'element-ui'

//登录（云开发）
/* export function login(data){
  return cloudCallFunction({
    $url: "login",
    username: data.username,
    password: data.password
  })
} */

//登录（本地开发）
export function login(data){
  const loginUrl = "/api/login"
  return localCall(loginUrl, {
    username: data.username,
    password: data.password
  })
}

//获取用户信息（云开发）
export function getInfo(token){
  //获取cookie中相关的信息
  return Promise.resolve({
    code:0,
    message:'获取成功',
    data:{
      avatar: customGetToken('avatar'),
      introduction: customGetToken('introduction'),
      name: customGetToken('name'),
      roles: customGetToken('roles'),
      id: customGetToken('id')
    }
  })
}

//登出
export async function logout(token){
  //弹框暂且放置，有效
  try{
    let result = await MessageBox.confirm('是否确认需要登出系统？', '登出', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if(result == "confirm") return Promise.resolve(result)
  }catch(err){
    console.log(err)
  }
}