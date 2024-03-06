//验证表单模板是否在30个字符以内
export function validateTemplateContent(rule, value, callback){
    if(!value){
        callback(new Error('请填写短信模板内容'))
    }else if(value.length >= 30){
        callback(new Error('模板内容超过了30个字符'))
    }else{
        callback()
    }
}

//验证接收人号码是否输入
export function validateMobile(rule, value, callback){
    let pattern = /^\d{11}$/
    for(let i=0;i<value.length;i++){
        if(!value[i]['mobile']){
            callback(new Error('请输入接收人号码'))
            return
        }else if(!pattern.test(value[i]['mobile'])){
            callback(new Error('接收人号码格式不正确'))
            return
        }
    }

    callback()
}

//验证模板ID
export function validateSmsID(rule, value, callback){
    if(!value){
        callback(new Error('请选择所属模板'))
    }else{
        callback()
    }
}