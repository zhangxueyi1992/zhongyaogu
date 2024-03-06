import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

// 自定义设置token
export function customSetToken(tokenName, tokenValue){
  return Cookies.set(tokenName, tokenValue)
}

//获取自定义token信息
export function customGetToken(tokenName){
  return Cookies.get(tokenName)
}

//删除自定义token信息
export function customRemoveToken(tokenName){
  return Cookies.remove(tokenName)
}

export function getRealCookie(id){
  return Cookies.get(id)
}