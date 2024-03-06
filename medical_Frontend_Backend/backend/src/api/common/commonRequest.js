/* import {
    cloudCallFunction,
    getTempFilePath,
    uploadFiles,
    deleteFiles,
    downloadOnlineFile
} from "@/utils/commFunc"

//通用的post请求
export function commonRequest(postData){
    return cloudCallFunction(postData)
}

//通用的文件下载请求
export function commonCloudFileDownload(cloudFileID){
    return downloadOnlineFile(cloudFileID)
}

//通用的上传文件 fileBinary:files[0] filename:文件路径+文件名
export async function commonCloudFileUpload(filename, fileBinary){
    return await uploadFiles(filename, fileBinary)
}

//获取临时文件
export function commonCloudFileTempFile(cloudFileID){
    return getTempFilePath(Array.isArray(cloudFileID) ? cloudFileID : [cloudFileID])
} */