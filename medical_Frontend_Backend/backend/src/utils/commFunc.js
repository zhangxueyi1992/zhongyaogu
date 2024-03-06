import {Message, Notification, MessageBox} from "element-ui"
// import {cloudBaseLoginByAnonymous, getTempFile, cloudApp, uploadFile, deleteFile, downloadF} from '@/main'
import store from '@/store'
import axios from 'axios'
import { _ } from "core-js"
// import {saveToLocal, getFromLocal, deleteLocal} from '@/utils/common/commonFunction'

//消息弹框
export function msgDialog(msg, error='error'){
    Message({
        message: msg || '错误',
        type: error,
        duration: 5 * 1000 //弹出框持续时间5s
    })
}

//确认框
export function confirmBox(title, msg){
  return MessageBox.confirm(msg, title, {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
}

//云函数调用
/* export async function cloudCallFunction(sendData){
    try{
        if(store.getters.loginStatus){
          return cloudReq(sendData)
        }else{
          let loginResult = await cloudBaseLoginByAnonymous()
          // 匿名登录
          if(loginResult && loginResult.isAnonymousAuth){
            store.dispatch('app/setLoginStatus', loginResult.isAnonymousAuth) //分发登录状态
            return cloudReq(sendData)
          }else return Promise.reject('匿名登录失败')
        }
    }catch(err){
        msgDialog(err) //报错
    }
} */

// 本地调用
export async function localCall(request, sendData){
  return axios.post(request, sendData, {
    headers:{
      "Content-Type": "application/json"
    }
  })
}

//云函数请求
/* async function cloudReq(sendData){
  let cloudResult = await cloudApp.callFunction({
    name: "getData",
    data: sendData
  })
  
  if(cloudResult && cloudResult['result']){
    return Promise.resolve(cloudResult['result']) //返回云函数给过来的结果
  }else return Promise.reject('云函数请求失败')
} */

//云监听
/* export async function cloudWatch(collecName){
  try{
    if(store.getters.loginStatus){
      cloudDataListen(collecName)
    }else{
      let loginResult = await cloudBaseLoginByAnonymous()
      // 匿名登录
      if(loginResult && loginResult.isAnonymousAuth){
        store.dispatch('app/setLoginStatus', loginResult.isAnonymousAuth) //分发登录状态
        cloudDataListen(collecName)
      }else msgDialog('匿名登录失败')
    }
  }catch(err){
    msgDialog(err) //报错
  }
} */

//实时数据变更监听
/* function cloudDataListen(collecName){
  if(!store.getters.watcher){
    let db = cloudApp.database();
    let _ = db.command;
    let watcher = db.collection('contact_apply')
    .where({isUsed: false}).
    orderBy('addtime', 'asc')
    .watch({
      onChange: async function(snapshot){
        let doc = snapshot['docChanges'],
            msgType = snapshot['msgType'],  //INIT_EVENT | NEXT_EVENT | 
            text = '';
        if(msgType === 'INIT_EVENT' || msgType === undefined) msgDialog('连接成功', 'success')
        for(let index in doc){
          if(doc[index]['dataType'] === 'add'){
            if(doc[index]['doc']['username'] && doc[index]['doc']['mobile']){
              text += '您有待处理的事务申请'
              break
            }
          }else if(doc[index]['dataType'] === 'update' || doc[index]['dataType'] === 'init'){
            if(doc[index]['doc']['isUsed'] === false && doc[index]['doc']['username'] && doc[index]['doc']['mobile']){
              text += '您有待处理的事务申请'
              break
            }
          }
        }

        if(text){
          voiceSpeck(text)  //播报语音
          store.dispatch('app/setHasMessage', true) //显示红点
        }else{
          //非初始化的时候 NEXT_EVENT
          if(msgType != 'INIT_EVENT'){
            let count = await db.collection(collecName).where({isUsed: false}).limit(1).count()
            if(count['total'] === 0){
              store.dispatch('app/setHasMessage', false)
            }
          }
        }

        if(text){
          Notification({
            title: '提示',
            message: text,
            type: 'warning',
            position: 'top-right',
            duration: 0
          })

          voiceSpeck(text)
        }
      },
      onError: function(err){
        const realError = err && err.errMsg && err.errMsg.type || ''
        if(realError.indexOf('timeout') >= 0){
          msgDialog('连接失败，等待 10s 重新连接')
        }else msgDialog(err)
        //10s 后重新连接网络
        setTimeout(() => retryLinkToDb(collecName), 10000)
      }
    })

    // 将watcher加入到store内
    store.dispatch('app/setWatcher', watcher)
  }
} */

//websocket断开重新连接
/* function retryLinkToDb(collecName){
  store.dispatch('app/setWatcher', null)
  cloudDataListen(collecName)
} */

//语音播报
function voiceSpeck(text){
  let utterThis = new window.SpeechSynthesisUtterance(text);
  utterThis.rate = 1 //语音速度
  utterThis.volume = 1 //声音大小 0-1之间
  window.speechSynthesis.speak(utterThis);
}

//临时下载文件
/* export function getTempFilePath(fileList){
  return getTempFile(fileList)
} */

//文件上传
/* export function uploadFiles(filename, fileBinary){
  return uploadFile(filename, fileBinary)
} */

//删除文件
/* export function deleteFiles(cloudFileID){
  return deleteFile(cloudFileID)
} */

//腾讯地图地址转经纬度
/* export function addrToLng(address){
  let key = 'KVIBZ-LWPCQ-2775T-GUBO7-TDYEQ-VJBRO'
  let addr = `/geocoder/v1/?address=${address}&key=${key}`
  return axios.get(addr)
} */

//下载文件
/* export function downloadOnlineFile(cloudFileId){
  return downloadF(cloudFileId)
} */