// 食品管理api接口
import {cloudCallFunction, getTempFilePath, uploadFiles, deleteFiles, downloadOnlineFile} from "@/utils/commFunc"

// 食品分类列表、更改食品分类、新增食品分类
export function foodTypeOperate(postData){
  // return cloudCallFunction(postData)
}

//获取临时文件列表
export function tempFilePath(fileList){
  // return getTempFilePath(fileList)
}

//文件上传
export function uploadFile(filename, fileBinary){
  // return uploadFiles(filename, fileBinary)
}

//文件删除
export function deleteFile(cloudFileID){
  // return deleteFiles(cloudFileID)
}

//文件下载
export function fileDownLoad(cloudFileID){
  // return downloadOnlineFile(cloudFileID)
}