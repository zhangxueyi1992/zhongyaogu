//验证房间号
export function validateGroupId(rule, value, callback){
    if(value && value.indexOf(" ") >= 0){
        callback(new Error('房间名称不能包含空格'))
    }else{
        callback()
    }
}

//验证排序
export function validateSort(rule, value, callback){
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