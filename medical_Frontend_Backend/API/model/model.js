const db = require('../db/db.js');
const func = require('../function/function');
const fs = require('fs');
const path = require('path');

//获取药材信息
function getAllMedicalInfo(cond){
	return new Promise((resolve, reject)=>{
		const limit = cond && cond.limit || 10
		const skip = cond && cond.skip || 0
		const keyword = cond && cond.keyword || ''
		const sortValue = cond && cond.sortValue || 'desc'
		const sortField = cond && cond.sortField || 'sort'
		let query, replace = [skip, limit];
		if(keyword){
			query = `select * from tb_medical where name like ? order by ${sortField} ${sortValue} limit ?, ?`
			replace = [`%${keyword}%`, ...replace]
		}else{
			query = `select * from tb_medical order by ${sortField} ${sortValue} limit ?, ?`
		}
		db.query(query, replace, (err, rows)=>{
			if (err) {
				reject(err && err.code || 'unknow error')
				return;
			}else resolve(rows)
		})
	})
}

// 获取药材信息总数
function getAllMedicalTotal(cond){
	return new Promise((resolve, reject)=>{
		const keyword = cond && cond.keyword || ''
		let query, replace = [];
		if(keyword){
			query = "select count(id) as total from tb_medical where name like ?"
			replace = [`%${keyword}%`, ...replace]
		}else{
			query = "select count(id) as total from tb_medical"
		}
		db.query(query, replace, (err, rows)=>{
			if (err) {
				reject(err && err.code || 'unknow error')
				return;
			}else resolve(rows && rows[0] && rows[0]['total'])
		})
	})
}

// 获取登录信息
function userLogin(uname, pwd){
	return new Promise((resolve, reject)=>{
		const password = func.md5(pwd);
		const query = 'select id,token,label,introduction,name,username,avatar from tb_cmsuser where username= ? and password= ? limit 1'
		db.query(query, [uname, password], (err, rows)=>{
			if (err) {
				reject(unifyRetJson(1000, err && err.code || 'unknow error'))
				return;
			}else resolve(unifyRetJson(0, rows[0]?'查询成功':'用户名或密码错误', rows[0]))
		})
	})
}

//获取左侧菜单栏
function getLeftMenu(){
	return new Promise((resolve, reject)=>{
		const query = "select * from tb_menu order by sort asc";
		db.query(query, (err, rows)=>{
			if (err) {
				reject(unifyRetJson(1000, err && err.code || 'unknow error'))
				return;
			}else{
				/*rows = JSON.parse(JSON.stringify(rows))
				console.log(rows)*/
				rows = func.menu(rows)
				resolve(unifyRetJson(0, '查询成功', rows));
			}
		})
	})
}

// 编辑药材信息
function editMedicalInfo(cond){
	return new Promise((resolve, reject)=>{
		const limit = cond && cond.limit || 10
		const skip = cond && cond.skip || 0
		const keyword = cond && cond.keyword || ''
		const sortValue = cond && cond.sortValue || 'desc'
		const sortField = cond && cond.sortField || 'sort'
		const name = cond && cond.name || ''
		const sort = cond && cond.sort || 1
		const image = cond && cond.image || ''
		const audio = cond && cond.audio || ''
		const video = cond && cond.video || ''
		const id = cond && cond.id || ''

		let query, replace = [name], delFile = [];
		if(id){
			query = "select * from tb_medical where name = ? and id != ?"
			replace = replace.concat(id)
		}else{
			query = "select * from tb_medical where name = ?"
		}
		db.query(query, replace, (err, rows)=>{
			if (err) {
				reject(err && err.code || 'unknow error')
				return;
			}else{
				if(rows.length){
					// 有重复项
					reject('药材名称重复')
				}else{
					//新增或编辑
					replace = [name, image, video, audio, sort, new Date()]
					if(id){
						// 先查询文件名称是否相等，如果不相等则，删除老文件，并且老文件应当存在
						query = `select picture,videoUrl,audioUrl from tb_medical where id=${id}`
						db.query(query, (err0, rows0)=>{
							if (err0) {
								reject(err0 && err0.code || 'unknow error')
								return;
							}else{
								for(const unit of rows0){
									if(unit['picture'] && unit['picture'] != image){
										delFile.push(unit['picture'])
									}
									if(unit['videoUrl'] && unit['videoUrl'] != video){
										delFile.push(unit['videoUrl'])
									}
									if(unit['audioUrl'] && unit['audioUrl'] != audio){
										delFile.push(unit['audioUrl'])
									}
								}
								query = "update tb_medical set name=?,picture=?,videoUrl=?,audioUrl=?,sort=?,lastUpdate=? where id=?"
								replace = replace.concat(id)
								db.query(query, replace, async (err5, rows5)=>{
									if (err5) {
										reject(err5 && err5.code || 'unknow error')
										return;
									}else{
										if(rows5.affectedRows){
											//获取最新的数据
											replace = [skip, limit];
											if(keyword){
												query = `select * from tb_medical where name like ? order by ${sortField} ${sortValue} limit ?, ?`
												replace = [`%${keyword}%`, ...replace]
											}else{
												query = `select * from tb_medical order by ${sortField} ${sortValue} limit ?, ?`
											}

											// 删除老文件
											if(delFile.length){
												for(const unit of delFile){
													if(fs.existsSync(unit)){
														await fs.promises.unlink(unit);
													}
												}
											}

											db.query(query, replace, (err2, rows2)=>{
												if (err2) {
													reject(err2 && err2.code || 'unknow error')
													return;
												}else resolve(rows2)
											})
										}else{
											reject('更新失败，请稍后重试')
										}
									}
								});
							}
						})
						
					}else{
						query = "insert into tb_medical set name=?,picture=?,videoUrl=?,audioUrl=?,sort=?,lastUpdate=?,createAt=?"
						replace = replace.concat(new Date())
						db.query(query, replace, (err1, rows1)=>{
							if (err1) {
								reject(err1 && err1.code || 'unknow error')
								return;
							}else{
								// 更新或新增成功
								if(rows1.affectedRows){
									//获取最新的数据
									replace = [skip, limit];
									if(keyword){
										query = `select * from tb_medical where name like ? order by ${sortField} ${sortValue} limit ?, ?`
										replace = [`%${keyword}%`, ...replace]
									}else{
										query = `select * from tb_medical order by ${sortField} ${sortValue} limit ?, ?`
									}

									db.query(query, replace, (err2, rows2)=>{
										if (err2) {
											reject(err2 && err2.code || 'unknow error')
											return;
										}else resolve(rows2)
									})
								}else{
									reject('新增失败，请稍后重试')
								}
							}
						})
					}
				}
			}
		})
	})
}

// 删除药材
function delMedicalInfo(cond){
	return new Promise((resolve, reject)=>{
		const id = cond && cond.id || null
		let skip = cond && cond.skip || 0
		const limit = cond && cond.limit || 0
		const keyword = cond && cond.keyword || ''
		const sortValue = cond && cond.sortValue || 'desc'
		const sortField = cond && cond.sortField || 'sort'
		let currDataLength = cond && cond.currDataLength || 0
		let replace, query;
		if(!id) reject('药材ID缺失')
		else{
			query = `select picture,videoUrl,audioUrl from tb_medical where id=${id}`;
			db.query(query, (err, rows)=>{
				if (err) {
					reject(err && err.code || 'unknow error')
					return;
				}else{
					if(rows.length){
						let delFile = [rows[0]['picture'], rows[0]['videoUrl'], rows[0]['audioUrl']];
						query = `delete from tb_medical where id=${id}`
						db.query(query, async (err1, rows1)=>{
							if (err) {
								reject(err1 && err1.code || 'unknow error')
								return;
							}else{
								if(rows1.affectedRows){
									for(const unit of delFile){
										if(unit && fs.existsSync(`${unit}`)){
											await fs.promises.unlink(`${unit}`);
										}
									}
									// 获取最新数据
									currDataLength -= 1;
									skip = currDataLength > 0 ? skip : (skip-limit > 0 ? skip-limit : 0);
									replace = [skip, limit]
									if(keyword){
										query = `select * from tb_medical where name like ? order by ${sortField} ${sortValue} limit ?, ?`
										replace = [`%${keyword}%`, ...replace]
									}else{
										query = `select * from tb_medical order by ${sortField} ${sortValue} limit ?, ?`
									}
									db.query(query, replace, (err2, rows2)=>{
										if (err2) {
											reject(err2 && err2.code || 'unknow error')
											return;
										}else resolve(rows2)
									})
								}else resolve('药品删除失败，请稍后重试')
							}
						})
					}else resolve('请求数据不存在');
				}
			})
		}
	})
}

// 批量删除药材
function delMedicalMultiInfo(cond){
	return new Promise((resolve, reject)=>{
		const delGroup = cond && cond.delGroup || null
		let skip = cond && cond.skip || 0
		const limit = cond && cond.limit || 0
		const keyword = cond && cond.keyword || ''
		const sortValue = cond && cond.sortValue || 'desc'
		const sortField = cond && cond.sortField || 'sort'
		let currDataLength = cond && cond.currDataLength || 0
		let replace, query;
		if(!Array.isArray(delGroup) || !delGroup.length) reject('药材ID缺失')
		else{
			let needDelGrpIds = "(";
			for(let x in delGroup){
				if(Number(x) !== delGroup.length - 1){
					needDelGrpIds += delGroup[x]+',';
				}else{
					needDelGrpIds += delGroup[x]+')';
				}
			}
			query = `select picture,videoUrl,audioUrl from tb_medical where id in ${needDelGrpIds}`;
			console.log(query)
			db.query(query, (err, rows)=>{
				if (err) {
					reject(err && err.code || 'unknow error')
					return;
				}else{
					if(rows.length){
						// 批量删除文件
						let delFile = [];
						for(let x in rows){
							delFile.push(rows[x]['picture'], rows[x]['videoUrl'], rows[x]['audioUrl']);
						}
						query = `delete from tb_medical where id in ${needDelGrpIds}`;
						db.query(query, async (err1, rows1)=>{
							if (err) {
								reject(err1 && err1.code || 'unknow error');
								return;
							}else{
								if(rows1.affectedRows){
									for(const unit of delFile){
										if(unit && fs.existsSync(`${unit}`)){
											await fs.promises.unlink(`${unit}`);
										}
									}
									// 获取最新数据
									currDataLength -= delGroup.length;
									skip = currDataLength > 0 ? skip : (skip-limit > 0 ? skip-limit : 0);
									replace = [skip, limit]
									if(keyword){
										query = `select * from tb_medical where name like ? order by ${sortField} ${sortValue} limit ?, ?`
										replace = [`%${keyword}%`, ...replace]
									}else{
										query = `select * from tb_medical order by ${sortField} ${sortValue} limit ?, ?`
									}
									db.query(query, replace, (err2, rows2)=>{
										if (err2) {
											reject(err2 && err2.code || 'unknow error')
											return;
										}else resolve(rows2)
									})
								}else resolve('药品删除失败，请稍后重试')
							}
						})
					}else resolve('请求数据不存在');
				}
			})
		}
	})
}

// 更改系统信息
function dealSysInfo(cond){
	return new Promise((resolve, reject)=>{
		const audioTime = cond && cond.audioTime || null
     	const videoTime = cond && cond.videoTime || null
     	const autoTime = cond && cond.autoTime || null
     	const cabinets = cond && cond.cabinets || null
     	const picture = cond && cond.picture || null
     	const jump = cond && cond.jump ? 1 : 0
     	const submit = cond && cond.submit || null
     	let query, replace = [];
     	if(submit){
     		query = `select audioTime, videoTime, autoTime, picture, jump, cabinets from tb_sys limit 1`
     		db.query(query, replace, async (err, rows)=>{
	     		if (err) {
					reject(err && err.code || 'unknow error')
					return;
				}else{
					if(rows.length){
						const oldPicture = rows[0]?.['picture']
						if(oldPicture !== picture) await fs.promises.unlink(oldPicture)
					}else{
						reject('查询失败');
						return;
					}

					replace = [audioTime, videoTime, new Date(), autoTime, cabinets, picture, jump]
     				query = `update tb_sys set audioTime=?,videoTime=?,lastUpdate=?,autoTime=?,cabinets=?,picture=?,jump=?`
     				db.query(query, replace, (err1, rows1)=>{
			     		if (err1) {
							reject(err1 && err1.code || 'unknow error')
							return;
						}else{
							if(rows1.affectedRows) resolve('系统信息更新成功')
							else reject('系统信息更新失败，请稍后重试')
						}
			     	})
				}
	     	})
     	}else{
     		query = `select audioTime, videoTime, autoTime, picture, jump, cabinets from tb_sys limit 1`
     		db.query(query, replace, (err, rows)=>{
	     		if (err) {
					reject(err && err.code || 'unknow error')
					return;
				}else resolve(rows[0])
	     	})
     	}
	})
}

// 个人中心更改信息
function centerInfo(cond){
	return new Promise((resolve, reject)=>{
		const name = cond && cond.name || ''
     	const avatar = cond && cond.avatar || ''
     	const introduction = cond && cond.introduction || ''
     	const username = cond && cond.username || ''
     	let password = cond && cond.password || ''
     	const confirmpwd = cond && cond.confirmpwd || null
     	const oldpwd = cond && cond.oldpwd || null
     	const id = cond && cond.id || null
     	const submit = cond && cond.submit || null
     	if(!id){
     		reject('用户ID缺失');
     		return;
     	}
     	let query, replace = [];
     	if(submit){
     		// 判断老密码和新密码是否相同
     		query = `select avatar,password from tb_cmsuser where id=${id}`
 			db.query(query, replace, (err1, rows1)=>{
 				if (err1) {
					reject(err1 && err1.code || 'unknow error')
					return;
				}else{
					if(rows1.length){
						const avatarIndb = rows1[0]['avatar'];	//若有新头像
						const pwdIndb = rows1[0]['password'];
						let delFile;
						if(password){
							if(password != confirmpwd){
								reject('新密码和确认密码不一致');
								return;
							}
							if(func.md5(oldpwd) != pwdIndb){
								reject('原密码输入错误');
								return;
							}

							password = func.md5(password);
						}
						
						replace = [introduction, name, username, new Date(),`${username}_token`];
						query = `update tb_cmsuser set introduction=?,name=?,username=?,lastUpdate=?,token=?`
						if(avatar){
							query += `,avatar=?`;
							replace.push(avatar);
							if(avatarIndb && avatarIndb != avatar) delFile = avatarIndb
						}else{
							//头像为空
							query += `,avatar=?`;
							replace.push(avatar);
							if(avatarIndb && !avatar) delFile = avatarIndb
						}

						if(password){
							query += `,password=?`;
							replace.push(password);
						}
						query += ` where id=${id}`

						db.query(query, replace, async (err2, rows2)=>{
							if (err2) {
								reject(err2 && err2.code || 'unknow error')
								return;
							}else{
								if(rows2.affectedRows){
									if(delFile && fs.existsSync(delFile)) await fs.promises.unlink(delFile)	//删除老头像
									resolve({avatar});
								}else reject('更新失败，请稍后重试')
							}
						})
     					
					}else reject('未查找到相关用户数据')
				}
 			})
     	}else{
     		query = `select name,avatar,introduction,username from tb_cmsuser where id=${id}`
     		db.query(query, replace, (err, rows)=>{
	     		if (err) {
					reject(err && err.code || 'unknow error')
					return;
				}else{
					resolve(rows[0])
				}
	     	})
     	}
	})
}

function getAllMedicalData(){
	return new Promise((resolve, reject)=>{
		query = `select name,picture,audioUrl,videoUrl from tb_medical order by sort asc`
		db.query(query, (err, rows)=>{
			if (err) {
				reject(err && err.code || 'unknow error')
				return;
			}else resolve(rows)
		})
	})
}

function unifyRetJson(code, message, data = null){
	return {
		code,
		message,
		data
	}
}

module.exports = {
	userLogin,
	getAllMedicalInfo,
	getLeftMenu,
	getAllMedicalTotal,
	editMedicalInfo,
	delMedicalInfo,
	delMedicalMultiInfo,
	dealSysInfo,
	centerInfo,
	getAllMedicalData
}