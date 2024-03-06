<template>
    <div class="components-container">
        <el-form ref="temp" :model="temp" :rules="rules" label-position="left" label-width="180px" style="width: 600px; margin-left:50px;">
            <el-form-item label="登录用户名" prop="username">
                <el-input v-model="temp.username" type="text" autocomplete="off" />
            </el-form-item>
            <el-form-item label="修改密码">
                <el-checkbox v-model="fixPWD">修改密码</el-checkbox>
            </el-form-item>
            <el-form-item label="原密码" prop="oldpwd" v-if="fixPWD">
                <el-input v-model="temp.oldpwd" type="password" autocomplete="new-password" />
            </el-form-item>
            <el-form-item label="密码" prop="password" v-if="fixPWD">
                <el-input v-model="temp.password" type="password" autocomplete="new-password" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmpwd" v-if="fixPWD">
                <el-input v-model="temp.confirmpwd" type="password" autocomplete="new-password" />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
                <el-input v-model="temp.name" />
            </el-form-item>
            <el-form-item label="介绍" prop="introduction">
                <el-input v-model="temp.introduction" maxlength="500" type="textarea" :rows="8" show-word-limit size="medium"/>
            </el-form-item>
            <el-form-item label="头像" prop="avatar">
                <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
                :ref="'elUpload'"
                :on-exceed="handleExceed"
                :on-change="handleChangePic"
                accept="image/png,image/jpeg,image/gif"
                :file-list="fileList"
                >
                    <i slot="default" class="el-icon-plus"></i>
                    <div slot="file" slot-scope="{file}">
                    <el-image 
                        class="el-upload-list__item-thumbnail"
                        :src="file.url"
                        fit="contain"
                        :preview-src-list="[file.url]"
                        >
                    </el-image>
                    <span class="el-upload-list__item-actions">
                        <span
                        class="el-upload-list__item-delete"
                        @click="handleRemovePic(file)"
                        >
                        <i class="el-icon-delete"></i>
                        </span>
                    </span>
                    </div>
                    <div slot="tip" class="el-upload__tip">只能上传jpg,png,gif文件</div>
                </el-upload>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('temp')" :loading="buttonLoading" icon="el-icon-upload2">提交</el-button>
                <el-button @click="resetForm('temp')" icon="el-icon-refresh-right" style="color:rgb(96,98,102);">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import {customGetToken} from '@/utils/auth'
    import {validateName} from '@/utils/formValidation/personValidation'
    // import {commonRequest, commonCloudFileUpload} from "@/api/common/commonRequest"
    import {localCall} from '@/utils/commFunc'
    import axios from 'axios'

    export default {
        data(){
            var checkConfirmPWD = (rule, value, callback) => {
                if(this.temp.password != value){
                    callback(new Error('密码和确认密码不一致'))
                }else{
                    callback()
                }
            };

            return {
                mediaBaseUrl: 'http://localhost:3000/',
                temp: {
                    name: null,
                    avatar: null,
                    introduction: null,
                    username: null, //名称
                    password: null, //密码
                    confirmpwd: null, //确认密码
                    oldpwd: null //原密码
                },
                rules:{
                    password:[
                        { required: true, message: '请填写密码', trigger: 'blur' },
                        { min:6, message: '密码长度至少6位', trigger: 'blur' }
                    ],
                    oldpwd:[
                        { required: true, message: '请填写原密码', trigger: 'blur' }
                    ],
                    confirmpwd: [
                        { required: true, message: '请填写确认密码', trigger: 'blur' },
                        { validator: checkConfirmPWD, trigger: 'blur'}
                    ],
                    name: [
                        { validator: validateName, type: "blur"}
                    ],
                    username: [
                        { required: true, message: '请填写登录用户名', trigger: 'blur' },
                        { min:1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
                    ]
                },
                sendPostData:null,   //发送数据
                fileList: [],    //文件列表
                fileType: [
                    'image/png',
                    'image/jpeg',
                    'image/gif'
                ],
                buttonLoading: false,    //控制提交按钮的loading状态
                fixPWD: false,  //控制复选框
                uploadImage: null
            }
        },
        created() {
            //获取用户信息
            this.commonReq(customGetToken('id'))
        },
        methods:{
            //提交
            submitForm(formName){
                this.$refs[formName].validate((valid)=>{
                    if(valid){
                        //验证通过可提交
                        this.commonReq(customGetToken('id'), true)
                    }
                })
            },

            //重置表单
            resetForm(formName){
                this.$refs[formName].resetFields()
                this.fileList = []
            },
        
            //消息弹框
            msgDialog(msg, type = 'error'){
                this.$message({
                    message: msg || '错误',
                    type: type,
                    duration: 5 * 1000 //弹出框持续时间5s
                })
            },

            //上传文件
            async uploadFile(fileObject){
                const formData = new FormData()
                formData.append('file', fileObject.raw)
                return axios.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            },

            //请求数据
            async commonReq(id, isSubmit = false){
                this.buttonLoading = true
                this.sendPostData = {}
                this.sendPostData['id'] = id
                if(isSubmit){
                    // 不重复上传文件 this.uploadImage
                    // 不上传带 http的线上文件
                    if(!this.uploadImage && this.fileList.length && this.fileList[0].url.indexOf('uploads') < 0){
                        let upInfo = await this.uploadFile(this.fileList[0], 'imageProgress')
                        upInfo = upInfo['data'] && upInfo['data']['file'] || null
                        if(upInfo) this.uploadImage = upInfo['destination'] + upInfo['filename']
                    }

                    //带有http的线上文件
                    if(this.fileList.length && this.fileList[0].url.indexOf('uploads') >= 0){
                        this.uploadImage = this.fileList[0].url.slice(this.fileList[0].url.indexOf('uploads'))
                    }

                    // 删除头像
                    // console.log(this.fileList)
                    if(!this.fileList.length){
                        this.temp.avatar = ''
                        this.uploadImage = null
                    }

                    if(this.uploadImage) this.temp.avatar = this.uploadImage
                    this.sendPostData['submit'] = true
                    // this.sendPostData['temp'] = this.temp
                    this.sendPostData = {...this.temp, ...this.sendPostData}
                }else{
                    this.sendPostData['submit'] = false
                }
                // /api/medical/center
                // 发送请求
                localCall('/api/medical/center', this.sendPostData).then(result=>{
                    this.buttonLoading = false
                    result = result.data
                    if(!result.code){
                        if(isSubmit){
                            this.msgDialog(result.message, 'success')
                            this.fixPWD = false
                            // 分发
                            if(result.data){
                                if(result.data.avatar){
                                    this.$store.dispatch('user/setAvatar', this.mediaBaseUrl + result.data.avatar)
                                }else{
                                    this.$store.dispatch('user/setAvatar', '/default.png')
                                }
                            }
                        }else{
                            if(result.data){
                                this.temp = {...result.data, password:'',confirmpwd:'',oldpwd:''}
                                if(this.temp.avatar){
                                    this.temp.avatar = this.mediaBaseUrl + this.temp.avatar
                                    this.fileList = [{name: '头像',url:this.temp.avatar}]
                                }
                            }
                        }
                    }else{
                        this.msgDialog(result.message)
                    }
                }).catch(err=>{
                    this.msgDialog(err)
                    this.buttonLoading = false
                })
            },

            //确认框
            confirmDialog(title, intro, type='warning'){
                return this.$confirm(intro, title, {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type
                })
            },

            //图片超过最大限制
            handleExceed(){
                this.msgDialog('头像数量不能超过1张')
            },

            handleChangePic(file, fileList, index = 0){
                const type = file.raw.type
                if(this.fileType.indexOf(type) < 0){
                    this.msgDialog('文件类型为非图片类型，请重新选择')
                    this.clearErrorFileInfo(file, fileList)
                    return
                }

                //检查文件的类型和大小
                if(file.size > 3 * 1024 * 1024){
                    this.msgDialog('上传的文件大小超过3M，请重新选择')
                    this.clearErrorFileInfo(file, fileList)
                    return
                }
                
                this.fileList = [file]
            },
            //清除添加的文件信息
            clearErrorFileInfo(file, fileList){
                for(let unit in fileList){
                    if(fileList[unit]['uid'] == file.uid){
                        fileList.splice(unit, 1)
                        break
                    }
                }

                this.fileList = fileList
            },
            //图片文档删除
            handleRemovePic(file, index = 0){
                let uFiles = this.$refs[`elUpload`].uploadFiles;
                uFiles.splice(0, 1)
                this.uploadImage = null
                this.fileList = []
            },
        }
    }
</script>

<style lang="scss" scoped>
    .label{
        text-align: right;
    }

    .el-row {
        margin-bottom: 20px;
        &:last-child {
        margin-bottom: 0;
        }
    }
    .el-col {
        border-radius: 4px;
    }

    // 点击查看大图以及移动垃圾箱
    .el-upload-list--picture-card .el-upload-list__item-actions{
        height: auto !important;
    }

    .el-upload-list--picture-card .el-upload-list__item > div{
        height: 100%;
    }
</style>