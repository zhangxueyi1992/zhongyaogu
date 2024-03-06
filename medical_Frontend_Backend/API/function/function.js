function md5(str){
	const crypto = require('crypto');
	const md5Hash = crypto.createHash('md5');
  	md5Hash.update(str);
  	return md5Hash.digest('hex');
}

function menu(data = []){
	let currentIndex, single,
		parent = [], authIDGroup = [],
		ind = 0;
	for(let i = 0;i < data.length;i++){
        single = data[i];
        if(parent.indexOf(single['id']) < 0 && single['level'] == 0){
            //添加父路由
            parent.push(single['id']);
            delete single['id'];
            delete single['pid'];
            delete single['level'];
            delete single['sort'];
            if(single['icon'] && single['title']){
            	single['meta'] = {icon: single['icon'], title: single['title']};
            	delete single['icon'];
            	delete single['title'];
            }
            
            authIDGroup[ind] = single;
            authIDGroup[ind]['children'] = []; //在父一层定义
            ind ++;
        }else{
            //添加子路由
            currentIndex = parent.indexOf(single['pid']);
            delete single['id'];
            delete single['pid'];
            delete single['level'];
            delete single['sort'];
            if(single['title']){
            	single['meta'] = {noCache: true, title: single['title']};
            	delete single['icon'];
            	delete single['title'];
            }
            authIDGroup[currentIndex]['children'].push(single);
        }
    }

    return authIDGroup
}

module.exports = {
	md5,
	menu
}