//验证接收人号码是否输入
export function validateMobileAndName(rule, value, callback){
    let pattern = /^[1]\d{10}$/
    for(let i=0;i<value.length;i++){
        if(!value[i]['mobile']
        || !value[i]['name']
        || !value[i]['member_type']
        // || !value[i]['cert']
        // || !value[i]['cert_no']
        ){
            // 、证件类型、证件号码
            callback(new Error('请输入姓名、联系电话及人员类别'))
            return
        }else if(!pattern.test(value[i]['mobile'])){
            callback(new Error(`${value[i]['name']}的联系电话格式不正确`))
            return
        }
    }

    callback()
}

//验证图片批量上传是否有遗漏
export function validateAccidentDetail(rule, value, callback){
    let pattern = /^\d{11}$/
    for(let i=0;i<value.length;i++){
        if(!value[i]['intro']){
            callback(new Error('请填写事故详情'))
            return
        }else if(!value[i]['picList'].length){
            callback(new Error('请上传事故图片'))
            return
        }
    }

    callback()
}