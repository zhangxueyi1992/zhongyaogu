//返回对应的数据
export function retRealData(object, def = ''){
    const args = arguments
    let retValue = ''
    object = typeof object == "string" ? JSON.parse(object) : object
    
    if(args[2]){
        retValue = object && object[args[2]]
    }else if(args[3]){
        retValue = object && object[args[2]] && object[args[2]][args[3]]
    }

    return retValue ? retValue : def
}

//储存数据
export function saveToLocal(key, val){
    localStorage.setItem(key, val)
}

//获取数据
export function getFromLocal(key){
    return localStorage.getItem(key)
}

//删除数据
export function deleteLocal(key){
    localStorage.removeItem(key)
}

//格式化日期
export function getRefDate(dateFormat='ymdHis',timestamp = 0, divider = '-'){
    let date = timestamp ? new Date(parseInt(timestamp)) : new Date(), currentTime;

    switch(dateFormat){
        case 'ymdHis':
            currentTime = date.getFullYear()+divider+(date.getMonth() > 8 ? date.getMonth()+1 : '0'+(date.getMonth()+1))+divider+(date.getDate() > 9 ? date.getDate():'0'+date.getDate())+" "+(date.getHours() > 9 ? date.getHours():'0'+(date.getHours()))+':'+(date.getMinutes() > 9 ? date.getMinutes():'0'+date.getMinutes())+':'+(date.getSeconds() > 9 ? date.getSeconds():'0'+date.getSeconds())
            break;
        case 'ymdHi':
            currentTime = date.getFullYear()+divider+(date.getMonth() > 8 ? date.getMonth()+1 : '0'+(date.getMonth()+1))+divider+(date.getDate() > 9 ? date.getDate():'0'+date.getDate())+" "+(date.getHours() > 9 ? date.getHours():'0'+(date.getHours()))+':'+(date.getMinutes() > 9 ? date.getMinutes():'0'+date.getMinutes())
            break;
        case 'ymdH':
            currentTime = date.getFullYear()+divider+(date.getMonth() > 8 ? date.getMonth()+1 : '0'+(date.getMonth()+1))+divider+(date.getDate() > 9 ? date.getDate():'0'+date.getDate())+" "+(date.getHours() > 9 ? date.getHours():'0'+(date.getHours()))
            break;
        case 'ymd':
            currentTime = date.getFullYear()+divider+(date.getMonth() > 8 ? date.getMonth()+1 : '0'+(date.getMonth()+1))+divider+(date.getDate() > 9 ? date.getDate():'0'+date.getDate())
            break;
        case 'ym':
            currentTime = date.getFullYear()+divider+(date.getMonth() > 8 ? date.getMonth()+1 : '0'+(date.getMonth()+1))
            break;
        case 'y':
            currentTime = date.getFullYear()
            break;
    }

    return currentTime
}

//根据月份获取天数
export function getDaysByMonth(month, year){
    let date = 31
    switch(month){
        case 4:
        case 6:
        case 9:
        case 11:
            date = 30;
            break;
        case 2:
            if(year % 4 == 0){
                date = 29;
            }else date = 28;
            break;
    }

    return date
}

//js 获取当前周【不包含星期六和星期天】
export function getWeekTime(week = 5, timestamp = 0) {
    const one_day = 86400000;// 24 * 60 * 60 * 1000;
    const date = timestamp ? new Date(timestamp) : new Date();
    let day = date.getDay();// 返回0-6,0表示周日
    day = !day ? 7 : day
    // 设置时间为当天的0点
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const week_start_time = date.getTime() - (day - 1) * one_day;
    const week_end_time = date.getTime() + (week - day) * one_day;
    return getRefDate('ymd', week_start_time)+' ~ '+getRefDate('ymd', week_end_time)
}

//获取礼拜一到礼拜五的数据
export function getWeekStartToEnd(weekDay = 5, timestamp = 0){
    const one_day = 86400000;// 24 * 60 * 60 * 1000;
    const date = timestamp ? new Date(timestamp) : new Date();
    let day = date.getDay();// 返回0-6,0表示周日
    day = !day ? 7 : day
    // 设置时间为当天的0点
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    let week = []
    let weekText = []
    for(let i=1;i<=weekDay;i++){
        switch(i){
            case 1:
                weekText.push('星期一')
                break;
            case 2:
                weekText.push('星期二')
                break;
            case 3:
                weekText.push('星期三')
                break;
            case 4:
                weekText.push('星期四')
                break;
            case 5:
                weekText.push('星期五')
                break;
            case 6:
                weekText.push('星期六')
                break;
            case 7:
                weekText.push('星期日')
                break;
        }
    }
    
    for(let i=1;i<=weekDay;i++){
        let week_time = date.getTime() + (i - day) * one_day;
        week.push({
            weekTxt: weekText[i-1],
            date: getRefDate('ymd', week_time)
        })
    }
    return week
}

export function getRandCode(bit = 6, prefix='', isNeedTime = true){
    let max = '1', code;
    for(let i=0; i < bit;i++) max += '0'

    max = parseInt(max)
    if(isNeedTime){
        code = prefix + new Date().getTime().toString() + Math.ceil(Math.random() * max)
    }else code = prefix + Math.ceil(Math.random() * max)
    
    return code
}

//获取星级
export function getStar(){
    return [1, 2, 3, 4, 5]
}