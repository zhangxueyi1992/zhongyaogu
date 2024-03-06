<template>
  <div class="msgprompt-svg">
    <svg-icon :icon-class="'prompt'" @click="handleGoTo(false)" />
    <div class="red-point" v-if="hasMessage"></div>
    <!-- 抽屉 -->
    <el-drawer
      :title="userTitle"
      :visible.sync="isShowUserDocList"
      :with-header="true"
      @closed="handleCloseDrawer"
      size="60%">
      <div style="height:calc(100% - 80px);">
        <div v-if="docList.length" style="text-align:center;">
          <el-table
          :data="docList"
          style="width: 100%;overflow-y:scroll;max-height:90%;">
          <el-table-column prop="name" label="材料名称">
            <template slot-scope="{row}">
              <span>{{row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handleViewDocDetail(row, $index)" v-loading.fullscreen.lock="documentTempLoading">
                查看材料详情
              </el-button>
            </template>
          </el-table-column>
          </el-table>
          <el-button type="primary" size="mini" icon="el-icon-back" @click="handleReturn" style="margin-top:15px;" v-if="isNeeBackBtn">
                  返回
          </el-button>
        </div>
        <div v-else-if="applyList.length" style="text-align:center;">
          <el-table
          :data="applyList"
          v-loading="loading"
          style="width: 100%;overflow-y:scroll;max-height:90%;">
          <el-table-column property="username" label="申请人姓名" width="150">
            <template slot-scope="{row}">
              <span>{{row.username}}</span>
            </template>
          </el-table-column>
          <el-table-column property="mobile" label="联系电话" width="150">
            <template slot-scope="{row}">
              <span>{{row.mobile}}</span>
            </template>
          </el-table-column>
          <el-table-column property="license" label="证件类型" width="100"></el-table-column>
          <el-table-column property="licenseNo" label="证件号码" width="250"></el-table-column>
          <el-table-column property="addtime" label="申请时间"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handleViewLicense(row, $index)" style="margin-top:10px;" v-if="row.fileID">
                查看证件信息
              </el-button>
              <br v-if="row.uploadFile"/>
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handleUploadFileInfo(row, $index)" style="margin-top:10px;" v-if="row.uploadFile">
                查看上传材料
              </el-button>
            </template>
          </el-table-column>
          </el-table>
          <el-button type="primary" size="mini" icon="el-icon-refresh" @click="getApplyInfoList()" style="margin-top:15px;" v-loading.fullscreen.lock="documentTempLoading">
                重新获取
          </el-button>
        </div>
        <el-drawer
          :title="userDocTitle"
          :append-to-body="true"
          direction="ttb"
          size="100%"
          :with-header="true"
          :visible.sync="isShowUserDoc">
          <el-image :src="documentPicture" v-if="documentPicture" fit="contain" :preview-src-list="[documentPicture]" class="doc-pic"></el-image>
          <!-- word文档 -->
          <div ref="container" v-else-if="documentDocx" style="max-height:800px;overflow-y:scroll;"></div>
          <!-- excel 电子表格 -->
          <!-- {{xlsxPreview}} -->
          <div ref="xlsxContainer" v-else-if="documentXlsx" style="max-height:800px;overflow-y:scroll;padding-left:10px;"></div>
          <!-- <iframe ref="xlsxContainer" :src="xlsxPreview" width="100%" v-else-if="documentXlsx" style="height:800px;overflow-y:scroll;"></iframe> -->
          <!-- pdf -->
          <iframe ref="pdfContainer" :src="pdfPreview" width="100%" v-else-if="documentPdf" style="height:800px;overflow-y:scroll;"></iframe>
          <div v-if="licensePicture" id="license-info" style="display:flex;justify-content:space-around;">
            <div v-for="(item, index) in licensePicture" :key="index" style="flex-basis:50%;">
              <div style="text-align:center;font-size:24px;">{{index ? '背面':'正面'}}</div>
              <el-image :src="item" fit="contain" :preview-src-list="[item]" class="doc-pic" v-if="item"></el-image>
            </div>
          </div>
        </el-drawer>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {commonRequest, commonCloudFileTempFile} from "@/api/common/commonRequest"
import axios from 'axios'

export default {
  name: 'MessagePrompt',
  props:{
    hasMessage: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isPrompt: false,
      dialogTableVisible: false,
      loading: false,
      userTitle: "",   //用户标题
      isShowUserDocList: false,  //是否显示用户列表
      isNeeBackBtn: false, //是否需要返回按钮
      docList: [], //获取到的文档列表
      userDocTitle: "", //查看的图片标题
      isShowUserDoc: false,  //是否显示文档详情
      documentPicture: null, //文档图片
      licensePicture: null, //证件信息图片
      documentDocx: null,  //word文档
      documentPdf: null, //pdf文档
      documentXlsx: null, //xlsx文档
      pdfPreview: "",  //pdf预览
      xlsxPreview: "", //xlsx预览
      documentTempLoading: false, //全局加载
      applyList: [], //申请列表
      tempApplyList: [],  //临时申请列表，用来暂存appList
    }
  },
  mounted() {
    
  },
  beforeDestroy() {

  },
  methods: {
    getApplyInfoList(){
      this.handleGoTo(true)
    },
    handleCloseDialog(){
        this.dialogTableVisible = false
    },
    handleGoTo(refresh = false){
      // console.log(this.$route.fullPath|query)
      
      if(!this.hasMessage) return
      this.isShowUserDocList = true
      this.userTitle = '申请调解'
      if(!this.applyList.length || refresh){
        this.dialogTableVisible = true
        this.loading = true
        commonRequest({
          $url: 'getApplyList'
        }).then(res=>{
          this.loading = false
          if(!res.code){
            this.applyList = res.data
          }else this.msgDialog(res.message)
        }).catch(err=>{
          this.loading = false
          this.msgDialog(err)
        })
      }else{
        this.dialogTableVisible = true
      }
    },
    gotoAccidentList(){
      const url = '/accident-manage/accident-list'
      this.$router.push(url)
      this.dialogTableVisible = false
      window.open(url, '_blank')
    },
    //查看证件信息
    handleViewLicense(row, index){
      this.documentPicture = null
      this.documentDocx = null
      this.documentXlsx = null
      this.documentPdf = null
      this.licensePicture = null
  
      this.documentTempLoading = true
      commonRequest({
        $url: 'getLicenseInfo',
        fileID: row['fileID']
      }).then(res=>{
        this.documentTempLoading = false
        
        if(!res.code){
          this.userDocTitle = true
          this.userDocTitle =  `${row.username}的${row.license?row.license:''}信息`
          this.isShowUserDoc = true
          this.licensePicture = res.data
        }else this.msgDialog(res.message)
      }).catch(err=>{
        this.documentTempLoading = false
        this.msgDialog(err)
      })
    },
    //查看上传文件信息
    handleUploadFileInfo(row, index){
      this.isNeeBackBtn = true
      this.docList = row.uploadFile
      this.userTitle = `${row.username}上传的材料`
      this.tempApplyList = this.applyList
      this.applyList = []
    },
    //关闭抽屉
    handleCloseDrawer(){
      this.isNeeBackBtn = false
      this.docList = []
    },
    //查看用户材料详细信息
    handleViewDocDetail(row, index){
      this.documentTempLoading = true
      // const fileCategory = typeof row === 'object' ? row['cloudUrl'] : row
      commonCloudFileTempFile(row['cloudUrl']).then(res=>{
        this.documentPicture = null
        this.documentDocx = null
        this.documentXlsx = null
        this.documentPdf = null
        this.licensePicture = null
        const file = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL || null
        if(file){
          const fileExt = file.indexOf('.') >= 0 && file.substr(file.lastIndexOf('.')+1) || ''
          this.userDocTitle = row['name']
          switch(fileExt.toLowerCase()){
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
              this.documentTempLoading = false
              this.documentPicture = file
              this.isShowUserDoc = true
              break;
            case 'docx':
              this.documentDocx = file
              axios.get(file,{
                responseType: 'blob'
              }).then(res=>{
                this.isShowUserDoc = true
                setTimeout(()=>{
                  try{
                    this.documentTempLoading = false
                    docx.renderAsync(res.data, this.$refs.container)
                  }catch(e){
                    this.isShowUserDoc = false
                    this.msgDialog(e)
                  }
                }, 2000)
              }).catch(err=>{
                this.documentTempLoading = false
                this.msgDialog(err)
              })
              break;
            case 'xlsx':
              this.documentXlsx = file
              this.isShowUserDoc = true
              setTimeout(()=>{
                this.documentTempLoading = false
                // this.xlsxPreview = `https://view.xdocin.com/xdoc?_xdoc=${file}`
                import('@/vendor/Export2Excel').then(async excel => {
                  try{
                    const excelToHtml = await excel.Excel_to_html(this.documentXlsx)
                    this.$refs.xlsxContainer.innerHTML = excelToHtml
                  }catch(e){
                    this.isShowUserDoc = false
                    this.msgDialog(e)
                  }
                })
              }, 2000)
              break;
            case 'pdf':
              this.documentPdf = file
              axios.get(file,{
                responseType: 'blob'
              }).then(res=>{
                this.isShowUserDoc = true
                setTimeout(()=>{
                  this.documentTempLoading = false
                  this.pdfPreview = window.URL.createObjectURL(
                    new Blob([res.data], { type: "application/pdf" })
                  )
                }, 2000)
              }).catch(err=>{
                this.documentTempLoading = false
                this.msgDialog(err)
              })
              break;
            default:
              this.userDocTitle = ''
              this.documentTempLoading = false
              this.msgDialog('文件格式不正确')
              break;
          }
        }else{
          this.documentTempLoading = false
          this.msgDialog('文件不存在')
        }
      }).catch(err=>{
        this.documentTempLoading = false
        this.msgDialog(err)
      })
    },

    //提示消息
    msgDialog(msg, type = 'error'){
      this.$message({
        message: msg || '未知错误',
        type: type,
        duration: 5 * 1000 //弹出框持续时间5s
      })
    },

    handleReturn(){
      this.isNeeBackBtn = false
      this.applyList = this.tempApplyList
      this.tempApplyList = []
      this.docList = [] 
      this.userTitle = `申请调解`
    }
  }
}
</script>

<style scoped>
  .msgprompt-svg{
    position: relative;
    cursor: pointer;
  }

  .msgprompt-svg  svg{
    font-size: 24px !important;
    position: relative;
    top: 2px;
  }

  .red-point{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: red;
    position: absolute;
    top: 20%;
    right: 10%;
  }

  #again{
    /* text-align: center; */
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .doc-pic{
    width: 25%;
    margin-left: 37.5%;
  }
</style>
