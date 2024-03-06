//验证姓名
export function validateName(rule, value, callback){
    if(value && value.indexOf(" ") >= 0){
        callback(new Error('登录用户名不能包含空格'))
    }else if(value.length > 30){
        callback(new Error('长度在 1 到 30 个字符'))
    }else{
        callback()
    }
}