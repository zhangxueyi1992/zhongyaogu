<template>
    <div class="components-container">
        <el-form ref="sysconfig" :model="sysconfig" :rules="rules" label-position="left" label-width="400px" style="width: 1100px; margin-left:50px;">
            <el-divider content-position="left">基本设置</el-divider>
            <el-form-item label="音频播放间隔时间（单位/秒）" prop="audioTime">
                <el-input v-model.number="sysconfig.audioTime" placeholder="请输入时间"></el-input>
            </el-form-item>
            <el-form-item label="视频播放间隔时间（单位/秒）" prop="videoTime">
                <el-input v-model.number="sysconfig.videoTime" placeholder="请输入时间"></el-input>
            </el-form-item>
            <el-form-item label="视频播放完后自动返回时间（单位/秒）" prop="autoTime">
                <el-input v-model.number="sysconfig.autoTime" placeholder="请输入时间"></el-input>
            </el-form-item>
            <el-form-item label="最小药柜数" prop="cabinets">
                <el-input v-model.number="sysconfig.cabinets" placeholder="请输入最小药柜数"></el-input>
            </el-form-item>
            <el-form-item label="是否跳过音频" prop="jump">
                <el-checkbox v-model="sysconfig.jump">是</el-checkbox>
            </el-form-item>
            <el-form-item label="抽屉图片" prop="picture">
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
                <el-button type="primary" @click="submitForm('sysconfig')" v-loading.fullscreen.lock="fullscreenLoading">提交</el-button>
                <el-button @click="resetForm('sysconfig')" style="color:rgb(96,98,102);">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import { localCall } from '@/utils/commFunc'
    import axios from 'axios'

    export default {
        data(){
            var checkScore = (rule, value, callback)=>{
                if(value && isNaN(value)){
                    callback(new Error('音频播放间隔时间必须为数字'))
                }else if(value && value < 1){
                    callback(new Error('音频播放间隔时间至少1秒以上'))
                }else{
                    callback()
                }
            };
            var checkLimit = (rule, value, callback)=>{
                if(value && isNaN(value)){
                    callback(new Error('视频播放间隔时间必须为数字'))
                }else if(value && value < 1){
                    callback(new Error('视频播放间隔时间至少1秒以上'))
                }else{
                    callback()
                }
            };
            var checkAuto = (rule, value, callback)=>{
                if(value && isNaN(value)){
                    callback(new Error('视频播放完后自动返回时间必须为数字'))
                }else if(value && value < 1){
                    callback(new Error('视频播放完后自动返回时间至少1秒以上'))
                }else{
                    callback()
                }
            };
            var checkCabinets = (rule, value, callback)=>{
                if(value && isNaN(value)){
                    callback(new Error('最小药柜数必须为数字'))
                }else if(value && value < 1){
                    callback(new Error('最小药柜数至少1个'))
                }else{
                    callback()
                }
            };
            var checkPic = (rule, value, callback)=>{
                if(!this.fileList.length){
                    callback(new Error('请上传抽屉图片'))
                }else{
                    callback()
                }
            };
            return {
                sysconfig:{
                    id: null,           //id
                    audioTime: null,    //音频播放间隔最大时间
                    videoTime: null,    //视频播放间隔最大时间
                    autoTime: null,     //视频播放完后自动返回时间（单位/秒）,
                    cabinets: null,     //最小药柜数
                    picture: null,      //图片
                    jump: false         //是否跳过
                },
                fullscreenLoading:false,
                fileType: [
                    'image/png',
                    'image/jpeg',
                    'image/gif'
                ],
                fileList: [],           //文件列表
                rules:{
                    audioTime:[
                        {required: true, message: '请输入音频播放间隔时间', trigger: 'blur'},
                        {validator:checkScore, trigger: 'blur'}
                    ],
                    videoTime:[
                        {required: true, message: '请输入视频播放间隔时间', trigger: 'blur'},
                        {validator:checkLimit, trigger: 'blur'}
                    ],
                    autoTime:[
                        {required: true, message: '请输入视频播放完后自动返回时间', trigger: 'blur'},
                        {validator:checkAuto, trigger: 'blur'}
                    ],
                    cabinets:[
                        {required: true, message: '请输入最小药柜数', trigger: 'blur'},
                        {validator:checkCabinets, trigger: 'blur'}
                    ],
                    picture:[
                        {required: true, message: '请上传抽屉图片!', trigger: 'submit'},
                        {validator:checkPic, trigger: 'submit'}
                    ]
                },
                uploadImage: null,
                mediaBaseUrl: 'http://localhost:3000/',
            }
        },
        components:{},
        created() {
            this.commonReq(false)
        },
        methods:{
            //提交
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if(valid) this.commonReq(true)
                })
            },

            //重置表单
            resetForm(formName){
                this.$refs[formName].resetFields()
            },

            //弹框
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
            async commonReq(submit = false){
                let sendPost = {}
                if(submit){
                    // 不重复上传文件 this.uploadImage
                    // 若图片地址不携带uploads则表示该文件没上传到服务端
                    if(!this.uploadImage && this.fileList.length && this.fileList[0].url.indexOf('uploads') < 0){
                        let upInfo = await this.uploadFile(this.fileList[0], 'imageProgress')
                        upInfo = upInfo['data'] && upInfo['data']['file'] || null
                        if(upInfo) this.uploadImage = upInfo['destination'] + upInfo['filename']
                    }

                    //若图片地址携带了uploads则表示该文件已上传到服务端了
                    if(this.fileList.length && this.fileList[0].url.indexOf('uploads') >= 0){
                        this.uploadImage = this.fileList[0].url.slice(this.fileList[0].url.indexOf('uploads'))
                    }

                    // 删除图片【没啥用处了，因为必须要上传图片】
                    if(!this.fileList.length){
                        this.sysconfig.picture = ''
                        this.uploadImage = null
                    }

                    if(this.uploadImage) this.sysconfig.picture = this.uploadImage
                    sendPost['submit'] = true
                    sendPost = {...this.sysconfig, ...sendPost}
                    sendPost.jump = sendPost.jump ? true: false
                }else sendPost = {submit}

                localCall('/api/medical/sysconfig', sendPost).then(result=>{
                    const res = result.data
                    if(!res.code){
                        if(res.data) {
                            res.data.jump = res.data.jump ? true: false
                            this.sysconfig = res.data
                            if(this.sysconfig.picture){
                                this.fileList = [{name: '图片', url: this.mediaBaseUrl + this.sysconfig.picture}]
                            }
                        }else this.msgDialog(res.message, 'success')
                    }
                    else this.msgDialog(res.message)
                    this.fullscreenLoading = false
                }).catch(err=>{
                    this.msgDialog(err)
                    this.fullscreenLoading = false
                })
            },

            handleChangePic(file, fileList, index = 0){
                const type = file.raw.type
                if(this.fileType.indexOf(type) < 0){
                    this.msgDialog('文件类型为非图片类型，请重新选择')
                    this.clearErrorFileInfo(file, fileList)
                    return
                }

                //检查文件的类型和大小
                if(file.size > 1024 * 1024){
                    this.msgDialog('上传的文件大小超过1M，请重新选择')
                    this.clearErrorFileInfo(file, fileList)
                    return
                }
                
                this.fileList = [file]
            },

            //图片超过最大限制
            handleExceed(){
                this.msgDialog('抽屉图片不能超过1张')
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
            }
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

    .fixHeight{
        height: 36px;
        line-height: 36px;
    }

    .red-star{
        color: #ff4949;
        margin-right: 4px;
    }

    .el-input{
        width: 400px;
    }

    .el-textarea{
        width: 400px;
    }

    // 点击查看大图以及移动垃圾箱
    .el-upload-list--picture-card .el-upload-list__item-actions{
        height: auto !important;
    }

    .el-upload-list--picture-card .el-upload-list__item > div{
        height: 100%;
    }
</style>