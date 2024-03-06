<template>
  <div class="upload-container">
    <el-button :style="{background:color,borderColor:color}" icon="el-icon-upload" size="mini" type="primary" @click=" dialogVisible=true">
      上传
    </el-button>
    <el-button :style="{background:color,borderColor:color}" icon="el-icon-picture" size="mini" type="primary" @click="handlePicLib">
      图片库
    </el-button>
    <el-dialog :visible.sync="picLibShow" @closed="handleDialogClose" v-loading.fullscreen.lock="fullscreenLoading">
      <div id="imgWrap">
        <div :class="'delete-file'+(item.selected ? ' selected':'')" v-for="(item, index) in picLibList" :key="index">
          <i class="el-icon-error" @click="handleDel(index, 'picLibList', 'cloud')" v-if="item.real"></i>
          <img :src="item.real" style="height:100px" v-if="item.real" @click="handleSelected(index)"/>
        </div>
      </div>
      <el-upload 
        action="#" 
        :auto-upload="false" 
        name="banner" 
        list-type="picture-card" 
        :on-change="handleChgPicLib" 
        :show-file-list="false"
        multiple
        accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
        class="editor-slide-upload">
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <el-button @click="picLibShow = false">
        取消
      </el-button>
      <el-button type="primary" @click="handleComfirm">
        确认
      </el-button>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible">
      <el-upload
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        class="editor-slide-upload"
        action="https://httpbin.org/post"
        list-type="picture-card"
      >
        <el-button size="small" type="primary">
          点击上传
        </el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" @click="handleSubmit">
        确认
      </el-button>
    </el-dialog>
  </div>
</template>

<script>
// import { getToken } from 'api/qiniu'
import {msgDialog} from '@/utils/commFunc'
import {handleUploadCommon, handleDelImageByEditor, handleUploadImageByEditor} from '@/utils/upload'
import {foodTypeOperate, uploadFile, tempFilePath} from '@/api/food-type'

export default {
  name: 'EditorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    },
    sendParam:{
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      listObj: {},
      fileList: [],
      picLibShow: false, //图片库是否显示
      picLibList: [],    //图片库列表
      fullscreenLoading: false,  //全局加载
      collectInsert: [] //收集需要插入的图片资源
    }
  },
  methods: {
    checkAllSuccess() {
      return Object.keys(this.listObj).every(item => this.listObj[item].hasSuccess)
    },
    handleSubmit() {
      const arr = Object.keys(this.listObj).map(v => this.listObj[v])
      if (!this.checkAllSuccess()) {
        this.$message('请等待所有图片上传成功。 如有网络问题，请刷新页面重新上传！')
        return
      }
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
      this.dialogVisible = false
    },
    handleComfirm(){
      if(!this.collectInsert.length){
        msgDialog('请选择至少一项图片');
        return false
      }

      this.$emit('successCloud', this.collectInsert)
      this.handleClearImg()
      this.picLibShow = false
    },
    handleSuccess(response, file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = response.files.file
          this.listObj[objKeyArr[i]].hasSuccess = true
          return
        }
      }
    },
    handleRemove(file) {
      const uid = file.uid
      const objKeyArr = Object.keys(this.listObj)
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          delete this.listObj[objKeyArr[i]]
          return
        }
      }
    },
    beforeUpload(file) {
      const _self = this
      const _URL = window.URL || window.webkitURL
      const fileName = file.uid
      this.listObj[fileName] = {}
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = _URL.createObjectURL(file)
        img.onload = function() {
          _self.listObj[fileName] = { hasSuccess: false, uid: file.uid, width: this.width, height: this.height }
        }
        resolve(true)
      })
    },

    // 点击图片库获取图片资源
    handlePicLib(){
      this.picLibShow = true
      
      if(!this.picLibList.length){
        setTimeout(()=>{
          this.fullscreenLoading = true
          if(this.sendParam['save']) delete this.sendParam['save']
          if(this.sendParam['delete']) delete this.sendParam['delete']
          if(this.sendParam['picLibList']) delete this.sendParam['picLibList']
          // console.log(this.sendParam)

          foodTypeOperate(this.sendParam).then(res=>{
            this.fullscreenLoading = false
            if(!res.code){
              if(res.data && Array.isArray(res.data)){
                res.data = res.data.map(item=>{
                  item['selected'] = false
                  return item
                })

                this.picLibList = res.data
              }
            }else msgDialog(res.message)
          }).catch(err=>{
            this.fullscreenLoading = false
            msgDialog(err)
          })
        },0)
      }
    },

    //图片上传
    handleChgPicLib(file){
      if(this.sendParam['delete']) delete this.sendParam['delete']  //删除delete字段

      handleUploadImageByEditor({
        file,
        path: 'image/cmsResource/',
        object:this,
        listField:'picLibList', //列表字段
        saveField:'save',       //表示是否保存字段 sendpParam 中
      })
    },

    //删除图片
    handleDel(index, fileListField, cloudField){
      if(this.sendParam['save']) delete this.sendParam['save']  //删除保存字段

      handleDelImageByEditor({
          index,  //需要删除的文件列表索引
          object: this,
          fileListField,
          cloudField,
          delField: 'delete',  //表示  sendpParam 中
          listField: 'picLibList'
      })
    },

    //图片选中
    handleSelected(index){
      this.picLibList[index]['selected'] = !this.picLibList[index]['selected']
      if(this.picLibList[index]['selected']){
        //加入要插入的图片资源
        this.collectInsert.push(this.picLibList[index]['real'])
      }else{
        //删除要插入的图片资源
        for(let ind in this.collectInsert){
          if(this.collectInsert[ind] == this.picLibList[index]['real']){
            this.collectInsert.splice(ind, 1)
            break
          }
        }
      }
    },

    //清除图片选中状态
    handleClearImg(){
      this.collectInsert = []
      this.picLibList = this.picLibList.map(item=>{
        item['selected'] = false
        return item
      })
    },

    //关闭Dialog
    handleDialogClose(){
      this.handleClearImg()
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  ::v-deep .el-upload--picture-card {
    width: 100%;
  }
}

/* 删除文件 */
.delete-file{
    position: relative;
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 6px;
}

.delete-file > i{
    position: absolute;
    right: -5px;
    top: -5px;
    z-index: 10;
    font-size: 24px;
    color: black;
    cursor: pointer;
}

.selected{
  // background: rgba(24,144,255, 0.2);
  background: #13CE66;
  border-radius: 5px;
}

#imgWrap{
  max-height: 800px;
  overflow-y: scroll;
  padding: 8px 0;
}
</style>
