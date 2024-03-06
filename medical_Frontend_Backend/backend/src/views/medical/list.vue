<template>
    <div class="app-container">
        <div class="filter-container">
            <el-input v-model="searchKeyword" placeholder="请输入药材名称" style="width: 300px;" class="filter-item" @keyup.enter.native="handleFilter" />
            <el-button v-waves class="filter-item search" type="primary" icon="el-icon-search" @click="handleFilter">
                查询
            </el-button>
            <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
                添加
            </el-button>
        </div>
        <!-- 暂时先隐藏 -->
        <div class="btn-group">
            <el-button type="danger" size="mini" @click="handleDelMutil" icon="el-icon-delete">批量删除</el-button>
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
        @select="handleSelect"
        @select-all="handleSelectAll"
        ref="multipleTable"
        :default-sort="{prop:defSortField, order:defSortValue}"
        >
        <el-table-column type="selection" width="55" label="全选" align="center"></el-table-column>
        <el-table-column label="编号" prop="id" align="center" width="70" type="index" :index="numEdit"></el-table-column>
        <el-table-column label="药材名称" prop="name" align="center" width="200"></el-table-column>
        <el-table-column label="药材图片" prop="picture" align="center" width="400">
          <template slot-scope="{row}">
            <el-image 
                style="width: 100px;"
                :src="mediaBaseUrl+row.picture" 
                :preview-src-list="previewMerge"
                v-if="row.picture"
            >
            </el-image>
            <!-- <img :src="mediaBaseUrl+row.picture" style="width: 100px;"/> -->
          </template>
        </el-table-column>
        <!-- 另起页面收听 -->
        <el-table-column label="药材音频" prop="audioUrl" align="center" width="240">
          <template slot-scope="{row}">
            <el-button type="primary" v-if="row.audioUrl" @click="handleView(row.audioUrl, 'audio')">查看</el-button>
          </template>
        </el-table-column>
        <!-- 另起页面查看 -->
        <el-table-column label="药材视频" prop="videoUrl" align="center" width="240">
          <template slot-scope="{row}">
            <el-button type="primary" v-if="row.videoUrl" @click="handleView(row.videoUrl, 'video')">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" align="center" width="80" sortable="custom"></el-table-column>
        <el-table-column label="操作" align="center" min-width="300" class-name="small-padding fixed-width">
            <!-- 解构 scope 中的 row 和 $index 出来 -->
            <template slot-scope="{row,$index}">
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
      <!-- dialog -->
      <el-dialog :title="state=='audio'?'音频播放':(state=='video'?'视频播放':(currentID ?'编辑':'新增')+'药材')" :visible.sync="dialogFormVisible" @closed="handleCloseDialog" top="5vh">
        <div v-if="state == 'form'">
          <div id="image-progress" v-if="imageProgress" :style="'width:'+imageProgress+'%;height:3px;background:red;margin-bottom:5px;'"></div>
            <div id="audio-progress" v-if="audioProgress" :style="'width:'+audioProgress+'%;height:3px;background:green;margin-bottom:5px;'"></div>
            <div id="video-progress" v-if="videoProgress" :style="'width:'+videoProgress+'%;height:3px;background:blue;margin-bottom:5px;'"></div>
            <el-form ref="medical" :model="medical" label-position="left" label-width="120px" style="margin-left:30px;margin-top:30px;width:450px;" :rules="rule">
              <el-form-item label="药材名称" prop="name">
                <el-input v-model="medical.name" autocomplete="off" placeholder="请填写药材名称"/>
              </el-form-item>
              <el-form-item label="药材图片" prop="picture">
                <el-upload
                    action="#"
                    list-type="picture-card"
                    :auto-upload="false"
                    :limit="1"
                    :on-exceed="(files, fileList)=> this.handleAllowExceed('药材图片')"
                    :on-change="handleChangePic"
                    accept="image/png,image/jpeg,image/gif,image/jpg"
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
                        <div slot="tip" class="el-upload__tip">只能上传jpg,png,gif文件，不超过5M<span style="color:red;display:block;">建议尺寸：1024×580</span></div>
                    </el-upload>
              </el-form-item>
              <!-- 药材音频 -->
              <el-form-item label="药材音频" prop="audioUrl">
                <el-upload
                action="#"
                :on-change="handleChangeAudio"
                accept="audio/ogg,audio/x-wav,audio/mp4a-latm,audio/mpeg"
                :file-list="fileAudioList"
                :limit="1"
                :auto-upload="false"
                :on-exceed="(files, fileList)=> this.handleAllowExceed('药材音频')"
                multiple
                :on-remove="handleRemoveAudio"
                >
                <el-button size="small" type="primary" icon="el-icon-upload2">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传ogg,wav,m4a,mp3格式文件，且不超过90M</div>
                </el-upload>
              </el-form-item>
              <!-- 药材视频 -->
              <el-form-item label="药材视频" prop="videoUrl">
                <el-upload
                action="/api/upload"
                :on-change="handleChangeVideo"
                accept="video/mp4"
                :file-list="fileVideoList"
                :limit="1"
                :auto-upload="false"
                :on-exceed="(files, fileList)=> this.handleAllowExceed('药材视频')"
                multiple
                :on-remove="handleRemoveVideo"
                >
                <el-button size="small" type="primary" icon="el-icon-upload2">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传mp4格式的文件，且不超过1G</div>
                </el-upload>
              </el-form-item>
              <el-form-item label="排序" prop="sort">
                <el-input v-model="medical.sort" autocomplete="off" placeholder="请填写排序"/>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm('medical')" :loading="buttonLoading" icon="el-icon-upload2">提交</el-button>
                <el-button @click="resetTemp('medical')" icon="el-icon-refresh-right" style="color:rgb(96,98,102);">重置</el-button>
              </el-form-item>
            </el-form>
        </div>
        <div v-else-if="state == 'audio'" style="text-align:center;">
          <audio :src="mediaPlayUrl" controls id="ao">浏览器不支持音频播放</audio>
        </div>
        <div v-else style="text-align:center;">
          <video :src="mediaPlayUrl" controls style="height:500px;width:95%;" id="vo">浏览器不支持视频播放</video>
        </div>
      </el-dialog>
    </div>
</template>
<script>
import waves from '@/directive/waves' // waves directive 水波纹效果
import {commonRequest} from "@/api/common/commonRequest"
import {localCall} from '@/utils/commFunc'
import {retRealData, saveToLocal, getFromLocal, getRefDate, getRandCode} from '@/utils/common/commonFunction'
import axios from 'axios'

export default {
  name: 'MedicalList',
  directives: { waves },
  data() {
    var checkSort = (rule, value, callback)=>{
        if(value && isNaN(value)){
            callback(new Error('排序必须为数字'))
        }else if(value < 0 || value > 999){
            callback(new Error('排序必须在1-999之间'))
        }else{
            callback()
        }
    };
    return {
        mediaBaseUrl: 'http://localhost:3000/',  //后台地址
        rule:{
            name:[
                {required: true, message:'请填写药材名称', trigger: 'blur'}
            ],
            picture:[
                {required: true, message:'请上传药材图片', trigger: 'submit'}
            ],
            sort:[
                {required: true, message:'请填写排序', trigger: 'blur'},
                {validator: checkSort, trigger: 'blur'}
            ]
        },
        tableKey: 0,    //应该是类似于for循环的key的作用
        resetSkip: false,   //是否重置
        searchKeyword: "",    //查询关键字
        limit: retRealData(getFromLocal('stayLocalMedical'), 10, 'Max'),  //每页显示的条数
        sortField: retRealData(getFromLocal('stayLocalMedical'), 'sort', 'SortField'),//排序字段
        sortValue: retRealData(getFromLocal('stayLocalMedical'), 'desc', 'SortValue').replace('ending',''),//升序还是降序
        defSortField: retRealData(getFromLocal('stayLocalMedical'), 'sort', 'SortField'),
        defSortValue: retRealData(getFromLocal('stayLocalMedical'), 'descending', 'SortValue'),
        currentPage: 1,     //当前页数
        sendPostData: {},   //发送到后台的数据
        listLoading: false, //控制表格的加载
        buttonLoading: false, //控制按钮的loading状态
        dialogFormVisible: false,   //控制Dialog开启或关闭
        currentID: null,    //当前弹窗内容所对应的ID
        list: null, //表格数据
        total: 0,   //表格数个数量
        selectEle: [],  //复选框选中项
        pageSizes: [10,15,20,25,30], //切换每页显示的条数
        medical:{
            name: "",      //药材名称
            picture: "",    //药材图片
            sort: "",       //排序
            audioUrl: "",   //药材音频
            videoUrl: ""    //药材视频
        },
        stayLocalMedical:{
            Max: '',
            SortField:'',
            SortValue: ''
        },
        fileList: [],
        fileVideoList: [],  //音频列表
        fileAudioList: [],  //视频列表
        imgFileType: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/gif'
        ],  //允许的图片文件类型
        audioFileType: [
            'audio/ogg',
            'audio/x-wav',
            'audio/mp4a-latm',
            'audio/mpeg'    //mp3
        ],   //允许的音频文件类型
        videoFileType: [
            'video/mp4'
        ],   //允许的视频文件类型
        imageProgress: 0,   //图片上传进度条
        videoProgress: 0,   //视频上传进度条
        audioProgress: 0,   //音频上传进度条
        uploadImage: null,
        uploadAudio: null,
        uploadVideo: null,
        previewMerge: [], //预览集合
        mediaPlayUrl: null,  //媒体播放地址
        state: 'form'  //dialog标题
    }
  },
  created(){
    this.getList()
  },
  methods:{
    // 查阅音视频
    handleView(url, type){
      this.state = type
      this.dialogFormVisible = true
      this.mediaPlayUrl = this.mediaBaseUrl + url
    },
    //查询列表
    getList() {
        this.listLoading = true
        this.sendPostData = {
            sortField: this.sortField,
            sortValue: this.sortValue,
            skip: this.resetSkip ? 0 : (this.currentPage-1)*this.limit,
            keyword: this.searchKeyword,
            limit: this.limit
        }
        
        this.currentPage = this.resetSkip ? 1 : this.currentPage
        this.resetSkip = false
        
        const requestUrl = '/api/medical/list'
        localCall(requestUrl, this.sendPostData).then(res=>{
            this.listLoading = false
            res = res.data
            let retData = res['data'] ? res['data'] : null
            if(!res.code){
              this.previewMerge = []
              this.list = retData['codeList'].map(item=>{
                if(item.picture){
                  this.previewMerge.push(this.mediaBaseUrl+item.picture)
                }
                return item
              })
              this.total = retData['total']
            }else{
            //弹出错误消息
              this.list = null
              this.total = 0
              this.msgDialog(res.message)
            }
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
    //新增数据
    handleCreate() {
        this.state = 'form'
        this.dialogFormVisible = true
        this.$nextTick(() => {
            this.resetTemp('medical')
        })
    },
    //编辑数据
    handleUpdate(row, index) {
      //防止双向绑定
      this.medical = Object.assign({}, row)
      this.fileList = [{url: this.mediaBaseUrl + row.picture}]
      if(row['videoUrl']) this.fileVideoList = [{url: this.mediaBaseUrl + row.videoUrl, name:'视频.mp4'}]
      if(row['audioUrl']) this.fileAudioList = [{url: this.mediaBaseUrl + row.audioUrl, name:'音频'+row['audioUrl'].slice(row['audioUrl'].indexOf('.'))}]
      this.currentID = row.id  //设置当前的ID
      this.state = 'form'
      this.dialogFormVisible = true //打开Dialog
      this.$nextTick(() => {
        this.$refs['medical'].clearValidate() //清除校验规则，但不重置
      })
    },
    // 上传文件
    async uploadFile(fileObject, bar){
        const _this = this
        const formData = new FormData()
        formData.append('file', fileObject.raw)
        return axios.post('/api/upload', formData, {
           headers: { 'Content-Type': 'multipart/form-data' },
           onUploadProgress: function(progressEvent){
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            _this[bar] = percentCompleted;
           }
        })
    },

    submitForm(formName){
      if(this.fileList.length) this.medical.picture = true
      this.$refs[formName].validate(async (valid)=>{
        if(valid){
            this.sendPostData = {
                keyword: this.searchKeyword,  //关键词搜索
                limit: this.limit,
                skip: (this.currentPage-1) * this.limit,
                sortField: this.sortField,
                sortValue: this.sortValue,
                name:this.medical.name,
                sort:this.medical.sort
            }

            if(!this.fileList.length){
              this.msgDialog('请选择药材图片')
              return
            }

            //上传文件（始终保持第一个是图片文件）
            // 第二个条件表示是已上传文件
            let uploadFileGrp = []
            if(!this.uploadImage && this.fileList[0].url.indexOf('uploads') < 0){
              uploadFileGrp.push(this.uploadFile(this.fileList[0], 'imageProgress'))
            }else{
              uploadFileGrp.push([])
            }

            //如果有老文件仍旧使用老文件|图片
            if(this.fileList.length && this.fileList[0].url.indexOf('uploads') >= 0){
              this.uploadImage = this.fileList[0].url.slice(this.fileList[0].url.indexOf('uploads'))
            }
            
            // 音频文件 & 无之前存留的文件
            // 第二个条件表示是已上传文件
            // 待上传文件无url，只有图片有url
            if(this.fileAudioList.length && !this.fileAudioList[0].url && !this.uploadAudio){
                uploadFileGrp.push(this.uploadFile(this.fileAudioList[0], 'audioProgress'))
            }
            // 视频文件 & 无之前存留的文件
            // 第二个条件表示是已上传文件
            // console.log(3)
            if(this.fileVideoList.length && !this.fileVideoList[0].url && !this.uploadVideo){
                uploadFileGrp.push(this.uploadFile(this.fileVideoList[0], 'videoProgress'))
            }

            //如果有老文件仍旧使用老文件|音频
            if(this.fileAudioList.length && this.fileAudioList[0].url && this.fileAudioList[0].url.indexOf('uploads') >= 0){
              this.uploadAudio = this.fileAudioList[0].url.slice(this.fileAudioList[0].url.indexOf('uploads'))
            }

            //如果有老文件仍旧使用老文件|视频
            if(this.fileVideoList.length && this.fileVideoList[0].url && this.fileVideoList[0].url.indexOf('uploads') >= 0){
              this.uploadVideo = this.fileVideoList[0].url.slice(this.fileVideoList[0].url.indexOf('uploads'))
            }

            this.buttonLoading = true
            try{
                uploadFileGrp = await Promise.all(uploadFileGrp)
                // 上传的图片
                const tempImage = uploadFileGrp &&
                uploadFileGrp[0] &&
                uploadFileGrp[0]['data'] &&
                uploadFileGrp[0]['data']['file'] || null
                if(tempImage) this.uploadImage = tempImage['destination'] + tempImage['filename']
                //上传的音频/视频
                const tempMedia = uploadFileGrp &&
                uploadFileGrp[1] &&
                uploadFileGrp[1]['data'] &&
                uploadFileGrp[1]['data']['file'] || null
                if(tempMedia){
                    if(tempMedia['mimetype'] == 'video/mp4') this.uploadVideo = tempMedia['destination'] + tempMedia['filename']
                    else this.uploadAudio = tempMedia['destination'] + tempMedia['filename']
                }

                //上传的视频
                const tempMedia2 = uploadFileGrp &&
                uploadFileGrp[2] &&
                uploadFileGrp[2]['data'] &&
                uploadFileGrp[2]['data']['file'] || null
                if(tempMedia2) this.uploadVideo = tempMedia2['destination'] + tempMedia2['filename']
            }catch(e){
                // to be continue
                this.msgDialog(e)
                return
            }

            //编辑
            if(this.currentID){
                this.sendPostData['id'] = this.currentID
            }

            if(this.uploadImage) this.sendPostData['image'] = this.uploadImage
            if(this.uploadAudio) this.sendPostData['audio'] = this.uploadAudio
            if(this.uploadVideo) this.sendPostData['video'] = this.uploadVideo

            localCall('/api/medical/edit', this.sendPostData).then(result=>{
                this.buttonLoading = false
                result = result.data
                if(!result.code){
                if(result.data){
                    this.list = result.data.map(item=>{
                      if(item.picture){
                        this.previewMerge.push(this.mediaBaseUrl+item.picture)
                      }
                      return item
                    })
                    if(!this.currentID) this.total += 1 //新增数量+1
                }

                this.dialogFormVisible = false //关闭Dialog
                this.msgDialog(result.message, 'success')
                }else this.msgDialog(result.message)
            }).catch(err=>{
                this.buttonLoading = false
                this.msgDialog(err)
            })
        }
      })
    },
    //对字段进行排序
    sortChange(data) {
      const { prop, order } = data
      this.sortValue = order == 'ascending' || !order ? 'asc' : 'desc'
      this.storeDataToLocal(this.limit, prop, order)
      this.handleFilter()
    },
    //本地储存数据localStroage
    storeDataToLocal(pageSize, defField, defValue){
      this.stayLocalMedical.Max = pageSize
      this.stayLocalMedical.SortField = defField
      this.stayLocalMedical.SortValue = defValue
      saveToLocal('stayLocalMedical', JSON.stringify(this.stayLocalMedical))
    },
    // 单个复选框 selection是一个组， row是当前
    handleSelect(selection, row){
      this.handleSelectCommon(selection)
    },
    //全选
    handleSelectAll(selection){
      this.handleSelectCommon(selection)
    },
    //选择需要删除的对象
    handleSelectCommon(selection){
      this.selectEle = []
      for(let index in selection){
        this.selectEle.push(selection[index]['id'])
      }
    },
    //重置表单
    resetTemp(formName){
      this.$refs[formName].clearValidate()
      this.medical = {
            name: "",      //药材标题
            picture: "",    //图片地址
            sort: "",       //排序
            audioUrl: "",   //药材音频
            videoUrl: ""    //药材视频
        }
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
    //单个删除
    handleDelete(row, index) {
      this.confirmDialog('删除数据', '您确定需要删除该条数据吗').then(() => {
        //点击确认按钮
        this.sendPostData = {
          id: this.list[index]['id'],
          limit: this.limit,
          skip: (this.currentPage-1) * this.limit,
          sortField: this.sortField,
          sortValue: this.sortValue,
          currDataLength: Array.isArray(this.list) ? this.list.length : 0,
          keyword: this.searchKeyword
        }
        this.listLoading = true
        localCall('/api/medical/delete', this.sendPostData).then(result=>{
          this.handleDelDataRet(result.data, 1)
        }).catch(err=>{
          this.msgDialog(err)
          this.listLoading = false
        })
      })
    },
    //多个删除
    handleDelMutil(){
      if(this.selectEle.length){
        this.confirmDialog('删除数据','您确定要删除这些数据吗？').then(()=>{
          this.sendPostData = {
            delGroup: this.selectEle,
            limit: this.limit,
            skip: (this.currentPage-1) * this.limit,
            sortField: this.sortField,
            sortValue: this.sortValue,
            currDataLength: Array.isArray(this.list) ? this.list.length : 0,
            keyword: this.searchKeyword
          }

          this.listLoading = true
          localCall('/api/medical/deleteMulti', this.sendPostData).then(res=>{
            this.handleDelDataRet(res.data, this.selectEle.length)
          }).catch(err=>{
            this.msgDialog(err)
            this.listLoading = false
          })
        }).catch(()=>{
          //点击取消按钮，清空用户所选的值
          this.selectEle = []
          this.$refs.multipleTable.clearSelection();
        })

        
      }else{
        this.msgDialog('请至少选择一项')
      }
    },
    
    //删除共同
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
    //关闭对话框的回调
    handleCloseDialog(){
      this.currentID = null //重置当前ID
      this.dialogFormVisible = false //不显示当前的Dialog
      this.selectEle = []
      this.fileList = []
      this.fileAudioList = []
      this.fileVideoList = []
      this.imageProgress = 0
      this.audioProgress = 0
      this.videoProgress = 0
      this.uploadImage = null
      this.uploadAudio = null
      this.uploadVideo = null
      this.buttonLoading = false
      
      if(this.state == 'video' || this.state == 'audio'){
        const mediaType = this.state == 'video' ? 'vo':'ao'
        document.getElementById(mediaType).pause();
        document.getElementById(mediaType).removeAttribute('src');
        document.getElementById(mediaType).load();
      }
      this.mediaPlayUrl = null
      this.$refs.multipleTable.clearSelection()
    },

    handleAllowExceed(title){
        this.msgDialog(`${title}最大数量为1`)
    },

    handleChangePic(file, fileList){
        const type = file.raw.type
        if(this.imgFileType.indexOf(type) < 0){
            this.msgDialog('文件类型为非图片类型，请重新选择')
            this.clearErrorFileInfo(file, fileList)
            return
        }

        //检查文件的类型和大小
        if(file.size > 5 * 1024 * 1024){
            this.msgDialog('上传的文件大小超过5M，请重新选择')
            this.clearErrorFileInfo(file, fileList)
            return
        }
        
        this.fileList = [file]
    },
    // 音频
    handleChangeAudio(file, fileList){
      //检查文件的类型和大小
      if(file.size > 1024 * 1024 * 90){
        this.msgDialog('上传的药材音频文件大小超过90M，请重新选择')
        this.clearErrorFileInfo(file, fileList)
        return
      }

      const type = file.raw.type
      if(this.audioFileType.indexOf(type) < 0){
        this.msgDialog('药材音频文件非允许类型，请重新选择')
        this.clearErrorFileInfo(file, fileList)
        return
      } 
      this.fileAudioList = fileList
    },

    // 视频
    handleChangeVideo(file, fileList){
      if(file.size > 1024 * 1024 * 1024){
        this.msgDialog('上传的药材视频文件大小超过1G，请重新选择')
        this.clearErrorFileInfo(file, fileList)
        return
      }

      const type = file.raw.type
      if(this.videoFileType.indexOf(type) < 0){
        this.msgDialog('药材视频文件非允许类型，请重新选择')
        this.clearErrorFileInfo(file, fileList)
        return
      } 
      this.fileVideoList = fileList
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

    //删除图片
    handleRemovePic(file){
        this.uploadImage = null
        this.fileList = []
    },

    //删除音频
    handleRemoveAudio(){
        this.uploadAudio = null
        this.fileAudioList = []
    },

    //删除视频
    handleRemoveVideo(){
        this.uploadVideo = null
        this.fileVideoList = []
    }
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

  /* 点击查看大图以及移动垃圾箱 */
   .el-upload-list--picture-card .el-upload-list__item-actions{
    height: auto !important;
   }

   .el-upload-list--picture-card .el-upload-list__item > div{
    height: 100%;
   }
</style>