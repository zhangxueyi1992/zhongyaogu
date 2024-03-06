export function validateDocIsUploaded(rule, value, callback){
    const regExp = /^(\d)+$/
    if(!value){
        callback(new Error('请填写排序'))
    }else if(!regExp.test(value)){
        callback(new Error('排序必须为整数'))
    }else if(value <= 0){
        callback(new Error('排序必须大于0'))
    }else{
        callback()
    }
}