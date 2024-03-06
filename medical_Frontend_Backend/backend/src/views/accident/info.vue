<template>
    <div class="app-container">
        <div class="filter-container">
            <el-input v-model="searchKeyword" placeholder="请输入描述或标题" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
            <div class="block search-cond">
                <span>年级：</span>
                <el-select v-model="active" placeholder="请选择">
                    <el-option
                    v-for="item in gradeList"
                    :key="item._id"
                    :label="item.name"
                    :value="item._id">
                    </el-option>
                </el-select>
            </div>
            <div class="block search-cond">
                <span>科目：</span>
                <el-select v-model="activeSubject" placeholder="请选择">
                    <el-option
                    v-for="item in subjectList"
                    :key="item._id"
                    :label="item.name"
                    :value="item._id">
                    </el-option>
                </el-select>
            </div>
            <div class="block search-cond" v-if="isAdmin">
                <span>创建者：</span>
                <el-select v-model="creator" placeholder="请选择">
                    <el-option
                    v-for="item in users"
                    :key="item._id"
                    :label="item.name"
                    :value="item._id">
                    </el-option>
                </el-select>
            </div>
            <el-button v-waves class="filter-item search" type="primary" icon="el-icon-search" @click="handleFilter">
                查询
            </el-button>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
                添加
            </el-button>
        </div>
        
        <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        @sort-change="sortChange"
        ref="multipleTable"
        :default-sort="{prop:defSortField, order:defSortValue}"
        >
            <el-table-column label="编号" prop="id" align="center" width="70" type="index" :index="numEdit"></el-table-column>
            <el-table-column label="标题" prop="title" align="center" width="200"></el-table-column>
            <el-table-column label="描述" prop="desc" align="center" width="180"></el-table-column>
            <el-table-column label="年级" prop="grade" align="center" width="150" sortable="custom">
              <template slot-scope="{row}">
                <span>{{row.grades}}</span>
              </template>
            </el-table-column>
            <el-table-column label="科目" prop="subject" align="center" width="150" sortable="custom">
              <template slot-scope="{row}">
                <span>{{row.subjects}}</span>
              </template>
            </el-table-column>
            <el-table-column label="文件名" prop="filename" align="center" width="100">
              <template slot-scope="{row}">
                <a href="javascript:;" @click="handleViewDoc(row.filename, `文档`)" style="display:block;color:#1890ff;" v-if="row.filename">查看文档</a>
              </template>
            </el-table-column>
            <el-table-column label="二维码" prop="qrcode" align="center" width="100">
              <template slot-scope="{row}">
                <a href="javascript:;" @click="handleViewDoc(row.qrcode, `二维码`)" style="display:block;color:#1890ff;" v-if="row.qrcode">查看二维码</a>
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="remark" align="center" width="180"></el-table-column>
            <el-table-column label="创建者" prop="uid" align="center" width="180" v-if="isAdmin">
              <template slot-scope="{row}">
                <span>{{row.userids}}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" min-width="100" class-name="small-padding fixed-width">
                <!-- 解构 scope 中的 row 和 $index 出来 -->
                <template slot-scope="{row, $index}">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row, $index)">
                        编辑
                    </el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row, $index)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
      <!-- 分页 -->
      <el-pagination
        v-show="total>0"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentPage"
        @prev-click="handlePrevPage"
        @next-click="handleNextPage"
        :current-page.sync="currentPage"
        :page-size="limit"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="pagination">
      </el-pagination>
      <!-- Dialog -->
      <el-dialog :title="(currentID ?'编辑':'新增')+'资料'" :visible.sync="dialogFormVisible" @closed="handleCloseDialog" top="5vh" :before-close="beforeClose">
        <el-form ref="infomation" :model="infomation" label-position="left" label-width="120px" style="margin-left:30px;margin-top:30px;width:450px;">
          <el-form-item label="标题" prop="title" :rules="[
            {required: true, message:'请填写标题', trigger: 'blur'}
          ]">
            <el-input v-model="infomation.title" autocomplete="off" placeholder="请填写标题"/>
          </el-form-item>
          <el-form-item label="描述" prop="desc" :rules="[
            {required: true, message:'请填写描述', trigger: 'blur'}
          ]">
            <el-input v-model="infomation.desc" autocomplete="off" placeholder="请填写描述" type="textarea" :rows="5"/>
          </el-form-item>
          <!-- 年级 -->
          <el-form-item label="年级" prop="grade" :rules="[
            {required: true, message:'请填写年级', trigger: 'blur'}
          ]">
            <el-select v-model="infomation.grade" placeholder="请选择">
                <el-option
                v-for="item in this.gradeList"
                :key="item._id"
                :label="item.name"
                :value="item._id">
                </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="科目" prop="grade" :rules="[
            {required: true, message:'请填写科目', trigger: 'blur'}
          ]">
            <el-select v-model="infomation.subject" placeholder="请选择">
                <el-option
                v-for="item in this.subjectList"
                :key="item._id"
                :label="item.name"
                :value="item._id">
                </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="上传文档" prop="filename">
            <el-upload
            action="#"
            :on-change="handleChange"
            accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg,image/gif,image/jpg"
            :file-list="fileList"
            :limit="maxFileUploadSize"
            :auto-upload="false"
            :on-exceed="handleDocExceed"
            multiple
            :on-remove="handleRemove"
            >
            <el-button size="small" type="primary" icon="el-icon-upload2">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传图片,xlsx,docx,pdf文件，且不超过5M</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="二维码" prop="avatar">
                <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
                :ref="'elUpload'"
                :on-exceed="handleExceed"
                :on-change="handleChangePic"
                accept="image/png,image/jpeg,image/gif"
                :file-list="codeFileList"
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
          <el-form-item label="备注" prop="remark">
            <el-input v-model="infomation.remark" autocomplete="off" placeholder="请填写备注" type="textarea" :rows="5"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('infomation')" :loading="buttonLoading" icon="el-icon-upload2">提交</el-button>
            <el-button @click="resetTemp('infomation')" icon="el-icon-refresh-right" style="color:rgb(96,98,102);">重置</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- dialog -->
      <el-drawer
      :title="userTitle"
      :visible.sync="isShowUserDocList"
      :with-header="true"
      @closed="handleCloseDrawer"
      size="40%">
      <div style="height:calc(100% - 80px);">
        <div v-if="docList.length" style="text-align:center;">
          <el-table
          :data="docList"
          style="width: 100%;overflow-y:scroll;max-height:90%;">
          <el-table-column prop="name" label="材料名称"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handleViewDocDetail(row, $index)" v-loading.fullscreen.lock="documentTempLoading">
                查看材料详情
              </el-button>
              <el-button type="primary" size="mini" icon="el-icon-download" @click="handleViewDocDownload(row, $index)" v-loading.fullscreen.lock="documentTempLoading">
                下载材料
              </el-button>
            </template>
          </el-table-column>
          </el-table>
        </div>
        <el-drawer
          :title="userDocTitle"
          :append-to-body="true"
          direction="ttb"
          size="100%"
          :with-header="true"
          :visible.sync="isShowUserDoc">
          <div v-if="documentPicture" style="width:100%;text-align:center;margin-top:15px;">
            <el-image :src="documentPicture" fit="contain" :preview-src-list="[documentPicture]" class="doc-pic"></el-image>
          </div>
          <!-- word文档 -->
          <div ref="container" v-else-if="documentDocx" style="max-height:800px;overflow-y:scroll;"></div>
          <!-- excel 电子表格 -->
          <!-- {{xlsxPreview}} -->
          <div ref="xlsxContainer" v-else-if="documentXlsx" style="max-height:800px;overflow-y:scroll;padding-left:10px;"></div>
          <!-- <iframe ref="xlsxContainer" :src="xlsxPreview" width="100%" v-else-if="documentXlsx" style="height:800px;overflow-y:scroll;"></iframe> -->
          <!-- pdf -->
          <iframe ref="pdfContainer" :src="pdfPreview" width="100%" v-else-if="documentPdf" style="height:800px;overflow-y:scroll;"></iframe>
        </el-drawer>
      </div>
    </el-drawer>
    <!-- 抽屉结束 -->
    </div>
</template>
<script>
import waves from '@/directive/waves' // waves directive 水波纹效果
import {commonRequest, commonCloudFileUpload, commonCloudFileTempFile} from "@/api/common/commonRequest"
import {retRealData, saveToLocal, getFromLocal, getRefDate} from '@/utils/common/commonFunction'
import { getRealCookie } from '@/utils/auth'
import axios from 'axios'

export default {
  name: 'DocumentList',
  directives: { waves },
  data() {
    return {
        tableKey: 0,    //应该是类似于for循环的key的作用
        resetSkip: false,   //是否重置
        searchKeyword: "",    //查询关键字
        limit: retRealData(getFromLocal('stayLocalInfo'), 10, 'Max'),  //每页显示的条数
        sortField: retRealData(getFromLocal('stayLocalInfo'), 'lastUpdate', 'SortField'),//排序字段
        sortValue: retRealData(getFromLocal('stayLocalInfo'), 'desc', 'SortValue').replace('ending',''),//升序还是降序
        defSortField: retRealData(getFromLocal('stayLocalInfo'), 'lastUpdate', 'SortField'),
        defSortValue: retRealData(getFromLocal('stayLocalInfo'), 'descending', 'SortValue'),
        currentPage: 1,     //当前页数
        sendPostData: {},   //发送到后台的数据
        listLoading: false, //控制表格的加载
        buttonLoading: false, //控制按钮的loading状态
        dialogFormVisible: false,   //控制Dialog开启或关闭
        currentID: null,    //当前弹窗内容所对应的ID
        list: null, //表格数据
        total: 0,   //表格数个数量
        isShowUserDocList: false,  //是否显示用户列表
        isShowUserDoc: false,  //是否显示文档详情
        documentTempLoading: false,
        userDocTitle: "", //查看的图片标题
        documentPicture: null,
        documentDocx: null,
        documentXlsx: null,
        documentPdf: null,
        isNeeBackBtn: false,  //是否需要返回按钮
        docList: [], //获取到的文档列表
        userTitle: "",  //抽屉标题
        isAdmin: false, //是否为管理员
        pageSizes: [10,15,20,25,30], //切换每页显示的条数
        stayLocalInfo:{
            Max: '',
            SortField:'',
            SortValue: ''
        },
        isShow: false,  //评语展示flag
        content: '',    //评语
        mediator: '',   //调解员
        active: '',         //活跃状态选中值
        activeSubject: '',  //科目选中值
        gradeList: [{_id:"",name:"请选择"}],  //年级列表
        subjectList: [{_id:"",name:"请选择"}], //课程列表
        infomation: {
            title: '',
            desc: '',
            grade: '',
            subject: '',
            filename: '',   //多文件上传
            qrcode: '',  //视频二维码地址 | 单文件
            remark: ''  //备注
        },
        fileList: [],    //上传文档列表
        codeFileList: [],    //二维码文件地址
        fileType: [
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/jpg"
        ],  //上传的文件类型
        fileTypeCode: [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/jpg"
        ],
        maxFileUploadSize: 3,  //默认的文件上传个数
        failUpFile: false,  //是否有上传失败的文件
        users: [{_id:"",name:"请选择"}],
        creator: null
    }
  },
  created(){
    this.getGradeAndSubject()
    this.getList()
  },
  methods:{
    //关闭抽屉
    handleCloseDrawer(){
      this.isNeeBackBtn = false
    },
    handleViewDocDetail(row, index){
      this.documentTempLoading = true
      commonCloudFileTempFile(row['cloudUrl']).then(res=>{
        this.documentPicture = null
        this.documentDocx = null
        this.documentXlsx = null
        this.documentPdf = null
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

    // 下载材料
    handleViewDocDownload(row, index){
      const a = document.createElement('a')
      a.href = row['url']
      a.download = row['name']
      a.target="_blank"
      a.click()
    },
    //图片文档删除
    handleRemovePic(file, index = 0){
        let uFiles = this.$refs[`elUpload`].uploadFiles;
        uFiles.splice(0, 1)
        this.codeFileList = []
    },
    //  图片超过最大限制
    handleExceed(){
      this.msgDialog('二维码数量不能超过1张')
    },
    // 上传文档超过最大限制
    handleDocExceed(){
      this.msgDialog(`上传文档最多不能超过${this.maxFileUploadSize}个`)
    },
    handleChangePic(file, fileList, index = 0){
        const type = file.raw.type
        if(this.fileTypeCode.indexOf(type) < 0){
            this.msgDialog('文件类型为非图片类型，请重新选择')
            this.clearErrorFileInfo(file, fileList)
            return
        }

        //检查文件的类型和大小
        // 二维码图片理应不会超过1M
        if(file.size > 1024 * 1024){
            this.msgDialog('上传的文件大小超过1M，请重新选择')
            this.clearErrorFileInfo(file, fileList)
            return
        }
        
        this.codeFileList = [file]
    },
    //文档上传成功
    // file是单个文件，fileList是file的数组形式
    // file格式 {name: 'xx', percentage: 0, raw:File对象, size: byte, status:'上传状态', uid:'xx'}
    handleChange(file, fileList){
      //检查文件的类型和大小
      if(file.size > 1024 * 1024 * 5){
        this.msgDialog('上传的文件大小超过5M，请重新选择')
        this.clearErrorFileInfo(file, fileList)
        return
      }

      const type = file.raw.type
      if(this.fileType.indexOf(type) < 0){
        this.msgDialog('文件类型非07版及以上word文档、07版以上Excel、图片或pdf文档，请重新选择')
        this.clearErrorFileInfo(file, fileList)
        return
      }

        /* if(file.name.indexOf('.') >= 0){
          this.document.doc_name = file.name.substr(0, file.name.lastIndexOf('.'))
        }else{
          this.document.doc_name = file.name
        } */
        
        
        this.fileList = fileList
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
    //删除上传的文件
    // 第一个file应该是已删除的文件json
    handleRemove(file, fileList){
      this.fileList = fileList
    },
    // 上传 this.fileList or codeFileList
    upload(obj, userid, isIMG = false){
      const path = `document/${getRefDate('ymd', 0, '')}/${userid}/`
      let uploadFileData = [], uniftyUpload = [],
          fileNameGrp = [], fileExt = [];
      for(let uf=0; uf<obj.length; uf++){
        const unitfile = obj[uf]
        if(unitfile.cloudUrl && unitfile.cloudUrl.indexOf('cloud') >= 0){
          // 已上传文档
          let unitPush = {
              cloudUrl: unitfile.cloudUrl,
              ext: unitfile.name.substr(unitfile.name.lastIndexOf('.')+1),
              name: unitfile.name,
              isIMG
          }
          // console.log('aac')
          //阿里云oss http开头文件
          if(unitfile.url && unitfile.url.indexOf('http') === 0) unitPush.url = unitfile.url
          uploadFileData.push(unitPush)
        }else{
          // 待上传文档
          const docType = unitfile.name.substr(unitfile.name.lastIndexOf('.'))
          if(!docType) return `文件${unitfile.name}未获取到后缀名`
          const filename = `${new Date().getTime()}_${Math.ceil(Math.random()*1000000)}${docType}`
          uniftyUpload.push(commonCloudFileUpload(`${path}${filename}`, unitfile.raw))
          fileNameGrp.push(unitfile.name) //记录一下上传的文件名，用于上传失败的文件提示
          fileExt.push(docType && docType.replace(/\./g, '')) //获取文件后缀名
        }
      }

      return {uploadFileData, uniftyUpload, fileNameGrp, fileExt}
    },
    // 查看文档或图片
    handleViewDoc(row, title){
      if(Array.isArray(row) && row.length){
        this.isShowUserDocList = true
        this.userTitle = `${title}详情`
        this.docList = row
      }else{
        this.msgDialog('当前文档不存在')
      }
    },
    handleDelete(row, index) {
      this.confirmDialog('删除数据', '您确定需要删除该条数据吗').then(() => {
        //点击确认按钮
        this.sendPostData = {
          $url: "delInfomation",
          id: this.list[index]['_id'],
          limit: this.limit,
          skip: (this.currentPage-1) * this.limit,
          sortField: this.sortField,
          sortValue: this.sortValue,
          currDataLength: Array.isArray(this.list) ? this.list.length : 0,
          keyword: this.searchKeyword,  //搜索选项
          cid: getRealCookie('id'),
          active: this.active,
          activeSubject: this.activeSubject,
          creator: this.creator
        }
        this.listLoading = true
        commonRequest(this.sendPostData).then(res=>{
          this.handleDelDataRet(res, 1)
        }).catch(err=>{
          this.msgDialog(err)
          this.listLoading = false
        })
      })
    },

    // 删除
    handleDelDataRet(res, minus){
      if(res){
        if(!res.code){
          this.selectEle = []
          this.msgDialog(res.message, 'success')
          if(res.data){
              this.list = res.data
              this.total -= minus
          }else{
            //暂无数据
            this.list = null
            this.total = 0
          }
        }
        else this.msgDialog(res.message)
      }
      this.listLoading = false
    },
    // promise提交
    async uploadNext(
      uploadFileData,
      uniftyUpload,
      fileNameGrp,
      fileExt,
      baseName = "fileList",
      isIMG = false
    ){
      let failUpFile="";
      if(uniftyUpload.length){
        uniftyUpload = await Promise.all(uniftyUpload)
        for(const unit in uniftyUpload){
          if(uniftyUpload[unit]['fileID']){
            //  文件上传成功
            this[baseName][unit]['cloudUrl'] = uniftyUpload[unit]['fileID']
            uploadFileData.push({
              cloudUrl: this[baseName][unit]['cloudUrl'],
              ext: fileExt[unit],
              name: fileNameGrp[unit],
              isIMG
            })
          }else{
            // 文件上传失败
            failUpFile += `${fileNameGrp[unit]},错误描述：${uniftyUpload[unit]['errMsg']}。`
          }
        }
      }

      return {uploadFileData, failUpFile}
    },
    //通用上传文档
    async commonUp(userid, field = 'fileList', isIMG = false){
      let result = this.upload(this[field], userid, isIMG)
      if(typeof result === 'string'){
        // this.buttonLoading = false  //loading button
        this.msgDialog(result)
        return false
      }
      result = await this.uploadNext(result.uploadFileData, result.uniftyUpload, result.fileNameGrp, result.fileExt, field, isIMG)
      return {uploadFileData: result.uploadFileData, failUpFile: result.failUpFile}
    },
    // 表单提交
    submitForm(formName){
      this.$refs[formName].validate(async (valid)=>{
        if(valid){
          try{
            //上传文档（先上传到云存储，再从云存储上传到阿里云oss）
            const userid = getRealCookie('id')
            if(!userid){
              this.msgDialog('用户ID缺失,请重新登录后台')
              return
            }
            
            this.buttonLoading = true
            // 上传文档
            const doc = await this.commonUp(userid);
            if(doc == false){
              this.buttonLoading = false
              return
            }
            // 上传图片
            const image = await this.commonUp(userid, 'codeFileList', true);
            if(image == false){
              this.buttonLoading = false
              return
            }

            let failUpFile = '以下文件上传失败：'
            failUpFile += doc.failUpFile + image.failUpFile
            
            this.infomation.filename = doc.uploadFileData //上传文档，要么有数据，要么空数组
            this.infomation.qrcode = image.uploadFileData //上传图片，要么有数据，要么空数组
            // 上传数据
            this.sendPostData = {
              $url:'infomation',
              info: this.infomation,
              uid: userid,
              keyword: this.searchKeyword,
              active: this.active,
              activeSubject: this.activeSubject,
              sortField: this.sortField,
              sortValue: this.sortValue,
              skip: (this.currentPage-1)*this.limit,
              limit: this.limit,
              cid: getRealCookie('id'),
              creator: this.creator
            }
            //编辑
            if(this.currentID) this.sendPostData['id'] = this.currentID
            // 表示上传失败
            if(failUpFile.indexOf(',') >= 0){
              this.buttonLoading = false
              this.failUpFile = true
              this.msgDialog(`${failUpFile}请点击提交继续上传`)
              return
            }

            this.buttonLoading = true
            commonRequest(this.sendPostData).then(res=>{
              if(res.code){
                this.msgDialog(res.message)
              }else{
                this.dialogFormVisible = false  //关闭dialog
                if(res.data && res.data.list) this.list = res.data.list
                if(!this.currentID) this.total += 1 //新增数量+1
                if(res.data && res.data.label) this.isAdmin = true
              }
              this.buttonLoading = false
            }).catch(err=>{
              this.buttonLoading = false
              this.msgDialog(err)
            })
          }catch(error){
            this.buttonLoading = false
            this.msgDialog(error)
          }
        }
      })
    },
    //重置表单
    resetTemp(formName){
      this.fileList = []
      this.$refs[formName].resetFields()
    },
    //关闭对话框的回调
    handleCloseDialog(){
      this.currentID = null //重置当前ID
      this.dialogFormVisible = false //关闭当前的Dialog
      this.failUpFile = false
      this.fileList = []
      this.codeFileList = []
    },
    // 关闭前的回调
    beforeClose(done){
      if(this.failUpFile){
        this.confirmDialog('提示', '您还有未上传完全的文件，确定直接上传吗？').then(()=>{
          // 直接上传
          this.buttonLoading = true
          commonRequest(this.sendPostData).then(res=>{
            if(res.code){
              this.msgDialog(res.message)
            }else{
              if(res.data) this.list = res.data
              if(!this.currentID) this.total += 1 //新增数量+1
            }
            this.buttonLoading = false
            done()
          }).catch(err=>{
            this.buttonLoading = false
            done()
            this.msgDialog(err)
          })
        }).catch(()=>{
          // 取消
        })
      }else done()
    },
    //获取所有调解员
    handleUpdate(row, index){
        this.dialogFormVisible = true
        this.infomation = Object.assign({}, row)
        if(Array.isArray(row['filename']) && row['filename']) this.fileList = row['filename']
        if(Array.isArray(row['qrcode']) && row['qrcode']) this.codeFileList = row['qrcode']
        this.currentID = row['_id']
        this.$nextTick(() => {
            this.$refs['infomation'].clearValidate() //清除校验规则，但不重置
        })
    },
    getGradeAndSubject(){
        commonRequest({
            $url: 'getGradeAndSubject'
        }).then(res=>{
            if(res.code) this.msgDialog(res.message)
            if(res.data){
                if(res.data.grade) this.gradeList = [...this.gradeList, ...res.data.grade]
                if(res.data.subject) this.subjectList = [...this.subjectList, ...res.data.subject]
                if(res.data.maxSize) this.maxFileUploadSize = res.data.maxSize
                if(res.data.users) this.users = [...this.users, ...res.data.users]
            }
        }).catch(err=>{
            this.listLoading = false
            this.msgDialog(err) //弹出错误消息
        })
    },
    //查询列表
    getList() {
        this.listLoading = true
        this.sendPostData = {
            $url: 'getInfomation',
            sortField: this.sortField,
            sortValue: this.sortValue,
            skip: this.resetSkip ? 0 : (this.currentPage-1)*this.limit,
            keyword: this.searchKeyword,
            active: this.active,
            activeSubject: this.activeSubject,
            creator: this.creator,
            limit: this.limit,
            id: getRealCookie('id')
        }
        
        this.currentPage = this.resetSkip ? 1 : this.currentPage
        this.resetSkip = false
        
        commonRequest(this.sendPostData).then(res=>{
            this.listLoading = false
            let retData = res['data'] ? res['data'] : null
            if(!res.code){
              this.list = retData['codeList']
              this.total = retData['total']
            }else{
            //弹出错误消息
              this.list = null
              this.total = 0
              this.msgDialog(res.message)
            }
            if(retData && retData['label']) this.isAdmin = true
        }).catch(err=>{
            this.listLoading = false
            this.msgDialog(err) //弹出错误消息
        })
    },
    // 查询数据
    handleFilter() {
      this.resetSkip = true
      this.getList()
    },
    //新增数据
    handleCreate() {
        this.dialogFormVisible = true
        this.$nextTick(() => {
            this.resetTemp('infomation')
        })
    },
    //消息弹框
    msgDialog(msg, type = 'error'){
      this.$message({
        message: msg || '未知错误',
        type: type,
        duration: 5 * 1000 //弹出框持续时间5s
      })
    },
    //确认弹框
    confirmDialog(title, intro, type='warning'){
      return this.$confirm(intro, title, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type
      })
    },
    
    //对字段进行排序
    sortChange(data) {
      const { prop, order } = data
      this.sortField = prop
      this.sortValue = order == 'ascending' || !order ? 'asc' : 'desc'
      console.log(this.sortField, this.sortValue)
      this.storeDataToLocal(this.limit, prop, order)
      this.handleFilter()
    },
    //本地储存数据localStroage
    storeDataToLocal(pageSize, defField, defValue){
      this.stayLocalInfo.Max = pageSize
      this.stayLocalInfo.SortField = defField
      this.stayLocalInfo.SortValue = defValue
      saveToLocal('stayLocalInfo', JSON.stringify(this.stayLocalInfo))
    },
    
    //选择每页最大页数的下拉框改变
    handleSizeChange(val){
      //储存最新的页面改变数据
      this.limit = val
      this.storeDataToLocal(val, this.sortField, `${this.sortValue}ending`)
      this.getList()
    },
    //当前页的改变
    handleCurrentPage(val){
      this.handlePageChange(val)
    },
    //上一页的改变
    handlePrevPage(val){
      this.handlePageChange(val)
    },
    //下一页的改变
    handleNextPage(val){
      this.handlePageChange(val)
    },
    handlePageChange(val){
      this.currentPage = val
      this.getList()
    },
    //对编号进行计数
    numEdit(index){
      return (this.currentPage-1)*this.limit + index + 1
    },
  }
}
</script>
<style scoped>
  .search{
    margin-left: 10px;
  }

  .pagination{
    margin-top: 20px;
  }

  /* 按钮组 */
  .btn-group{
    margin: 10px 0 10px;
  }

  .search-cond{
    display:inline-block;
    margin:0 10px;
    position:relative;
    top:-3px;
  }

  /* // 点击查看大图以及移动垃圾箱 */
  .el-upload-list--picture-card .el-upload-list__item-actions{
        height: auto !important;
  }

  .el-upload-list--picture-card .el-upload-list__item > div{
        height: 100%;
  }
</style>