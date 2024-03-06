import {msgDialog, confirmBox} from './commFunc'
import {uploadFile, deleteFile, tempFilePath,foodTypeOperate} from '../api/food-type'

// field, file, object, path
export function handleUploadCommon(params){
    let type = params.file && params.file.raw && params.file.raw.type,  //文件类型
        fileFormat = ['image/png','image/jpg','image/gif','image/jpeg','image/webp'];
    
    type = type ? type : '';
    if(fileFormat.indexOf(type) < 0){
        msgDialog('上传的文件必须为图片')
        return false;
    }

    handleUploadFile(params.field, type, params.file, params.object, params.path, params.formField);
}

//点击上传图片 field input file字段名
function handleUploadFile(field, type, file, object, path, formField){
    let filePath = path,
        filename = filePath + new Date().getTime()+'.'+type.replace('image/', ''),
        errMessage = '';

    object.fullscreenLoading = true;
    uploadFile(filename, file.raw).then(res=>{
        if(res.fileID){
            // 获取文件 CDN 下载链接
            object[formField][`cloud_${field}`] = res.fileID
            tempFilePath([res.fileID]).then(result=>{
                object.fullscreenLoading = false;
                result.fileList.forEach((el, index)=>{
                if(el.code === "SUCCESS"){
                    object[formField][field] = el.tempFileURL
                }else{
                    errMessage += el.fileID+": "+el.message+"\n";
                }
                })

                if(errMessage) msgDialog(errMessage)
            })
        }else{
            object.fullscreenLoading = false;
            msgDialog(res.message ? res.message : '文件上传失败')
        }
    }).catch(err=>{
        object.fullscreenLoading = false;
        msgDialog(err);
    })
}

//点击删除图片（单张） temp, field, object
export function handleDelImage(params){
    confirmBox('删除图片', '是否需要删除此图片？').then(()=>{
        let pattern = /^https?/,
            object = params.object,
            formField = params.formField,
            field = params.field;
        
        // 如果是以http|s开头的图片 网络图片
        if(pattern.test(object[formField][`cloud_${field}`])){
            object[formField][field] = object[formField][`cloud_${field}`] = '';
            return;
        }

        object.fullscreenLoading = true

        deleteFile(object[formField][`cloud_${field}`]).then(res=>{
            object.fullscreenLoading = false;
            res.fileList.forEach((el) => {
                if (el.code === "SUCCESS") {
                    msgDialog('删除成功','success')
                    object[formField][field] = '';
                    object[formField][`cloud_${field}`] = '';
                } else {
                    msgDialog('删除失败，请稍后在试');
                }
            })
        })
    })
}


//删除图片（编辑器）
export function handleDelImageByEditor(params){
    confirmBox('删除图片', '是否需要删除此图片？').then(()=>{
        let pattern = /^https?/,
            object = params.object,
            fileListField = params.fileListField,
            index = params.index,
            cloudField = params.cloudField;
        
        // 如果是以http|s开头的图片 网络图片
        if(pattern.test(object[fileListField][index][cloudField])){
            object[fileListField].splice(index, 1);
            return object[fileListField];
        }

        object.fullscreenLoading = true

        deleteFile(object[fileListField][index][cloudField]).then(res=>{
            object.fullscreenLoading = false;
            res.fileList.forEach((el) => {
                if (el.code === "SUCCESS") {
                    let imgSpace = object[fileListField]
                    imgSpace.splice(index, 1)

                    object.sendParam[params.delField] = true //删除字段
                    object.sendParam[params.listField] = imgSpace    //保存字段
                    foodTypeOperate(object.sendParam).then(res=>{
                        object.fullscreenLoading = false
                        if(!res.code){
                            msgDialog('删除成功','success')
                            object[fileListField].splice(index, 1);
                        }else msgDialog(res.message)
                    }).catch(err=>{
                        _this.fullscreenLoading = false
                        msgDialog(err)
                    })
                } else {
                    msgDialog('删除失败，请稍后在试');
                }
            })
        })
    })
}

//上传图片
export function handleUploadImageByEditor(param){
    let type = param.file && param.file.raw && param.file.raw.type || '',
        file = param.file,
        fileFormat = ['image/png','image/jpg','image/gif','image/jpeg','image/webp'],
        filename = param.path+(parseInt(new Date().getTime() / 1000)+''+parseInt(Math.random()*1000000))+`.`+type.replace('image/', ''),
        _this = param.object;
    
    if(fileFormat.indexOf(type) < 0){
        msgDialog('上传的文件必须为图片')
        return false;
    }

    _this.fullscreenLoading = true;
    uploadFile(filename, file.raw).then(res=>{
        if(res.fileID){
            // 获取文件 CDN 下载链接
            tempFilePath([res.fileID]).then(result=>{
                let errMessage = ''
                result.fileList.forEach((el, index)=>{
                    if(el.code === "SUCCESS"){
                        // 保存数据
                        _this.sendParam[param.saveField] = true
                        _this.sendParam[param.listField] = _this[param.listField].concat({
                            real: el.tempFileURL,
                            cloud: el.fileID
                        })
                        
                        foodTypeOperate(_this.sendParam).then(res=>{
                            _this.fullscreenLoading = false
                            if(!res.code){
                                _this[param.listField].push({
                                    real: el.tempFileURL,
                                    cloud: el.fileID,
                                    selected: false
                                })
                            }else msgDialog(res.message)
                        }).catch(err=>{
                            _this.fullscreenLoading = false
                            msgDialog(err)
                        })
                    }else{
                        _this.fullscreenLoading = false
                        errMessage += el.fileID+": "+el.message+"\n";
                    }
                })

                if(errMessage) msgDialog(errMessage)
            })
        }else{
            _this.fullscreenLoading = false;
            msgDialog(res.message ? res.message : '文件上传失败')
        }
    }).catch(err=>{
        _this.fullscreenLoading = false;
        msgDialog(err);
    })
}