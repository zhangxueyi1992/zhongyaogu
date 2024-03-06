<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="foodType.search" placeholder="关键字" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item search" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button> -->
    </div>

    <div class="btn-group">
      <el-button type="danger" size="mini" @click="handleDelMutil" icon="el-icon-delete">批量删除</el-button>
      <el-button type="primary" size="mini" @click="handleOpenMutil" icon="el-icon-s-opportunity">批量冻结/解冻</el-button>
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
      <el-table-column label="编号" prop="id" align="center" width="80" type="index" :index="numEdit"></el-table-column>
      <el-table-column label="登录用户名" width="150px" prop="username"></el-table-column>
      <el-table-column label="姓名" width="150px" align="center" prop="name"></el-table-column>
      <el-table-column label="介绍" width="150px" align="center" prop="introduction">
          <template slot-scope="{row}">
            <el-popover
                placement="right"
                width="400"
                trigger="click">
                <p>{{row.introduction}}</p>
                <span slot="reference" style="display:block;">{{contInterception(row, 'introduction')}}</span>
            </el-popover>
            </template>
      </el-table-column>
      <el-table-column label="添加时间" sortable="custom" width="150px" align="center" prop="addtime">
        <template slot-scope="{row}">
          <span>{{dateFormat(row['addtime'])}}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属组" width="110px" align="center" prop="rolesActual">
          <template slot-scope="{row}">
            <div v-if="!row.label">
              <p v-for="(item,index) in row.rolesActual" :key="index">{{item}}</p>
            </div>
            <div v-else>---</div>
          </template>
      </el-table-column>
      <el-table-column label="账号状态" sortable="custom" width="150px" align="center" prop="active">
        <template slot-scope="{row}">
          <span>{{row['active'] ? '正常':'冻结'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" sortable="custom" width="150px" align="center" prop="sort"></el-table-column>
      <el-table-column label="绑定在线助手" width="150px" align="center" prop="mediatorName">
          <!-- <template slot-scope="{row}">
              <el-image :src="row.avatar" lazy v-if="row.avatar"></el-image>
              <span style="color:red" v-else>暂无图片</span>
          </template> -->
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row, $index)" icon="el-icon-edit">
            编辑
          </el-button>
          <el-button v-if="row.label !='super'" :type="!row['active'] ? 'warning':'success'" size="mini" @click="handleForbid(row, $index)" :icon="row['active'] ? 'el-icon-lock':'el-icon-unlock'">
            {{row['active'] ? '冻结':'解冻'}}
          </el-button>
          <el-button v-if="row.label !='super'" size="mini" type="danger" @click="handleDelete(row,$index)" icon="el-icon-delete">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 页码 -->
    <el-pagination
       v-show="total>0"
       background
       @size-change="handleSizeChange"
       @current-change="handleCurrentPage"
       @prev-click="handlePrevPage"
       @next-click="handleNextPage"
       :current-page.sync="currentPage"
       :page-size="limit"
       :page-sizes = "pageSizes"
       layout="total, sizes, prev, pager, next, jumper"
       :total="total"
       class="pagination">
    </el-pagination>

    <el-dialog :title="'用户'+(currentID ? '编辑':'添加')" :visible.sync="dialogFormVisible" @closed="handleCloseDialog" top="5vh">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="200px" style="width: 500px; margin-left:50px;">
        <el-form-item label="登录用户名" prop="username">
          <el-input v-model="temp.username" type="text" autocomplete="off" />
        </el-form-item>
        <el-form-item label="修改密码" prop="fixPWD" v-if="temp._id">
          <el-checkbox v-model="temp.fixPWD">修改密码</el-checkbox>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="temp.fixPWD || !temp._id">
          <el-input v-model="temp.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPWD" v-if="temp.fixPWD || !temp._id">
          <el-input v-model="temp.confirmPWD" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="介绍" prop="introduction">
          <el-input v-model="temp.introduction" maxlength="500" type="textarea" :rows="8" show-word-limit size="medium"/>
        </el-form-item>
        <!-- <el-form-item label="头像" prop="avatar">
          <div class="upload-file">
            <el-upload action="#" :auto-upload="false" name="food_show" list-type="picture-card" :on-change="handleUploadAvatar" :show-file-list="false" accept="image/png,image/jpg,image/jpeg,image/gif,image/webp">
              <i slot="default" class="el-icon-plus"></i>
            </el-upload>
            <div class="delete-file" v-if="temp.avatar">
              <i class="el-icon-error" @click="handleDelImage(temp, 'avatar')"></i>
              <img :src="temp.avatar" style="height:148px"/>
            </div>
          </div>
        </el-form-item> -->
        <el-form-item label="所属组" prop="roles" v-if="!temp.label">
          <!-- v-model绑定值如果和value相同则选中 -->
          <el-checkbox-group v-model="temp.roles" @change="handleCheckedRoleChange">
            <el-checkbox v-for="role in authList" :label="role['_id']" :key="role['_id']">{{role['name']}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="绑定在线助手" prop="mediator_id">
          <el-checkbox-group v-model="temp.users" @change="handleCheckedUserChange">
            <el-checkbox v-for="val in onlineHelperList" :label="val['_id']" :key="val['_id']" :disabled="!val.allow">{{val['name']}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model.number="temp.sort" />
        </el-form-item>
        <el-form-item :label="'账号状态'+(isSuperAdmin?'（超管不可编辑）':'')" prop="active">
          <template>
            <el-radio v-model="temp.active" :label="foodState.up" :disabled="isSuperAdmin">正常</el-radio>
            <el-radio v-model="temp.active" :label="foodState.down" :disabled="isSuperAdmin">冻结</el-radio>
          </template>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('dataForm')" v-loading.fullscreen.lock="fullscreenLoading" icon="el-icon-upload2">提交</el-button>
          <el-button @click="resetTemp('dataForm')" icon="el-icon-refresh-right" style="color:rgb(96,98,102);">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive 水波纹效果
import { parseTime } from '@/utils'
import { foodTypeOperate,uploadFile,deleteFile,tempFilePath } from '@/api/food-type'
import {commonRequest} from '@/api/common/commonRequest'

export default {
  name: 'FoodType',
  directives: { waves },
  filters: {},
  data() {
    var validateName = (rule, value, callback) => {
      if(value && value.indexOf(" ") >= 0){
        callback(new Error('登录用户名不能包含空格'))
      }else{
        callback()
      }
    };
    var checkSort = (rule, value, callback) => {
      if(String(value).indexOf(".") >= 0 || value <= 0){
        callback(new Error('排序必须为大于0的正整数'))
      }else{
        callback()
      }
    };
    var checkRoles = (rule, value, callback) => {
      if(!this.getArrayLength(value)){
        callback(new Error('所属组至少选择一项'))
      }else{
        callback()
      }
    };
    var checkConfirmPWD = (rule, value, callback) => {
      if(this.temp.password != value){
        callback(new Error('密码和确认密码不一致'))
      }else{
        callback()
      }
    };
    return {
      tableKey: 0,
      list: null, //有用
      total: 0,   //有用
      listLoading: true,
      dialogFormVisible: false, //控制Dialog的开关
      downloadLoading: false,
      // 新增
      sendPostData:{},
      currentPage: 1, //当前页数
      limit: localStorage.getItem('userMax') ? parseInt(localStorage.getItem('userMax')) : 10,  //每页显示的条数
      pageSizes: [10,15,20,25,30], //切换每页显示的条数
      temp: {
        name: null, //姓名
        sort: null,
        // avatar: null,
        introduction: null,
        roles: [],      //选中的组
        users: [],  //选中的用户
        username: null, //登录用户名
        fixPWD: false,  //修改密码
        password: null, //密码
        confirmPWD: null, //确认密码
        active: null
      },
      isSuperAdmin: false,  //是否是超管
      rules: {
        name: [
          { required: true, message: '请填写姓名', trigger: 'blur' },
          { min:1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' },
          { validator: validateName, type: "blur"}
        ],
        username: [
          { required: true, message: '请填写登录用户名', trigger: 'blur' },
          { min:1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        roles: [
          {validator: checkRoles, trigger: 'submit'}
        ],
        sort: [
          { required: true, message: '请填写排序', trigger: 'blur' },
          { type: 'number', message: '排序必须为数字', trigger: 'blur' },
          { validator: checkSort, trigger: 'blur'}
        ],
        password: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { min:6, message: '密码长度至少6位', trigger: 'blur' }
        ],
        confirmPWD: [
          { required: true, message: '请填写确认密码', trigger: 'blur' },
          { validator: checkConfirmPWD, trigger: 'blur'}
        ],
        active:[
          { required: true, message: '请选择账号状态', trigger: 'submit' }
        ]
      },
      currentID: null,  //当前ID，编辑弹出框的时候赋值
      currentIndex: null, //当前列表的索引值
      fullscreenLoading: false, //是否全屏加载
      selectEle:[], //选择需要批量删除的数据
      selectActive:[], //上架中的商品
      selectInactive: [], //下架中的商品
      foodType:{
        search:"" //查询值
      },
      resetSkip: false, //是否重置页码 
      sortField: localStorage.getItem('sortFieldUser') ? localStorage.getItem('sortFieldUser') :'sort',//排序字段
      sortValue: localStorage.getItem('sortValueUser') ? localStorage.getItem('sortValueUser').replace('ending','') :'asc',//升序还是降序
      defSortField: localStorage.getItem('sortFieldUser') ? localStorage.getItem('sortFieldUser') :'sort',
      defSortValue: localStorage.getItem('sortValueUser') ? localStorage.getItem('sortValueUser') :'ascending',
      authList: [], //所有权限组
      onlineHelperList: [], //在线助手列表
      foodState:{
        up: 1,
        down: 0
      }//是否冻结用户
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 新增
    getList() {
      this.listLoading = true
      this.sendPostData = {
        $url: 'userList',
        // table:'cmsuser',
        sortField: this.sortField,
        sortValue: this.sortValue,
        skip: this.resetSkip ? 0 : (this.currentPage-1)*this.limit,
        keyword: this.foodType.search ? this.foodType.search : '',
        limit: this.limit
      }
      
      this.currentPage = this.resetSkip ? 1 : this.currentPage
      this.resetSkip = false
      
      foodTypeOperate(this.sendPostData).then(res=>{
        let retData = res['data'] ? res['data'] : null
        this.listLoading = false
        if(!res.code){
          // 如果没有数据
          if(!this.getArrayLength(retData['user'])){
            this.list = null;
            this.total = 0;
          }
          
          this.getTempImageURL(retData['user'], retData['total']);
        }else{
          //弹出错误消息
          this.msgDialog(res.message)
        }
      }).catch(err=>{
          this.listLoading = false
          this.msgDialog(err) //弹出错误消息
      })
    },
    //选择每页最大页数的下拉框改变
    handleSizeChange(val){
      //储存最新的页面改变数据
      localStorage.setItem('userMax', val)
      this.limit = val
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
    numEdit(index){
      return (this.currentPage-1)*this.limit + index + 1
    },
    //消息弹框
    msgDialog(msg, type = 'error'){
      // console.log(type)
      this.$message({
        message: msg || '错误',
        type: type,
        duration: 5 * 1000 //弹出框持续时间5s
      })
    },
    //页面的数据改动
    handlePageChange(val){
      this.currentPage = val
      this.getList()
    },
    //提交表单
    submitForm(formName){
      this.$refs[formName].validate((valid)=>{
        if(valid){
          //验证无误后往后台发送数据
          this.fullscreenLoading = true
          this.sendPostData = {
            $url: "userUpdate",
            temp:this.temp,
            limit: this.limit,
            skip: (this.currentPage-1) * this.limit,
            sortField: this.sortField,
            sortValue: this.sortValue,
            keyword: this.foodType.search
          }
          //表示编辑模式下
          if(this.currentID){
            this.sendPostData['id'] = this.currentID
          }

          //使用此必须删除根据ID排序的方案，否则就会错乱
          foodTypeOperate(this.sendPostData).then(res=>{
            if(res){
              if(!res.code){
                this.msgDialog(res.message, 'success')
                if(res.data){
                    /* this.list = res.data
                    if(!this.currentIndex) this.total += 1 //新增数量+1 */
                    this.getTempImageURL(res.data, !this.currentIndex ? this.total+=1:this.total);
                }

                this.dialogFormVisible = false //关闭Dialog
              }
              else this.msgDialog(res.message)
            }
            this.fullscreenLoading = false
          }).catch(err=>{
            this.msgDialog(err)
            this.fullscreenLoading = false
          })
        }else{
          console.log('错误提交！！');
          return false;
        }
      })
    },
    //关闭Dialog的触发事件
    handleCloseDialog(){
      this.currentID = null //重置当前ID
      this.currentIndex = null //重置当前表格中的列索引
      this.dialogFormVisible = false //不显示当前的Dialog
      this.isSuperAdmin = false //改成非管理员
      this.formDataReset();
    },
    //点击编辑按钮处弹框
    handleUpdate(row, index) {
      // 此处不再是初始的temp，因为已经更改了
      this.temp = Object.assign({index: index}, row) // 复制对象【合并对象】
      if(row['label'] == 'super') this.isSuperAdmin = true
      this.currentID = row._id  //设置当前的ID
      this.currentIndex = index //设置当前的索引
      this.dialogFormVisible = true //打开Dialog
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
        this.getOnlineHelperListAndAuthList(this.currentID)
        // this.getAuthList()
      })
    },
    //获取权限列表
    /* getAuthList(){
      if(!this.authList.length){
        this.sendPostData = {
          $url: 'getAuthList',
        }

        this.fullscreenLoading = true
        foodTypeOperate(this.sendPostData).then(res=>{
          this.fullscreenLoading = false
          if(!res.code) this.authList = res.data
          else this.msgDialog(res.message)
        }).catch(err=>{
          this.fullscreenLoading = false
          this.msgDialog(err);
        })
      }
    }, */

    // 获取在线助手和权限列表
    getOnlineHelperListAndAuthList(id){
      const requestGrp = [
        commonRequest({$url: 'getOnlineHelperList', id}),
        commonRequest({$url: 'getAuthList'})
      ];
      this.fullscreenLoading = true
      Promise.all(requestGrp).then(res=>{
        let allMessage = ''
        if(res[0]){
          if(res[0].code){
            allMessage += (allMessage ? ',':'')+res[0].message
          }else{
            if(Array.isArray(res[0].data.mediatorList) && res[0].data.mediatorList.length){
              this.onlineHelperList = res[0].data.mediatorList
            }
            if(Array.isArray(res[0].data.selectedOpt) && res[0].data.selectedOpt.length){
              this.temp.users = res[0].data.selectedOpt
            }
          }
        }

        if(res[1]){
          if(res[1].code) allMessage += res[1].message
          else this.authList = res[1].data
        }
        this.fullscreenLoading = false
        if(allMessage) this.msgDialog(allMessage)
      }).catch(err=>{
        this.fullscreenLoading = false
        this.msgDialog(err);
      })
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
      this.selectActive = []
      this.selectInactive = []
      for(let index in selection){
        if(!selection[index]['label']){
          this.selectEle.push(selection[index]['_id'])
          if(selection[index]['active']){
            this.selectActive.push(selection[index]['_id'])
          }else{
            this.selectInactive.push(selection[index]['_id'])
          }
        }
      }
    },
    //批量删除
    handleDelMutil(){
      if(this.selectEle.length){
        this.confirmDialog('删除用户','您确定要删除这些用户吗？').then(()=>{
          this.sendPostData = {
            $url: "userDelMutil",
            delGroup: this.selectEle,
            limit: this.limit,
            skip: (this.currentPage-1) * this.limit,
            sortField: this.sortField,
            sortValue: this.sortValue,
            currDataLength: this.getArrayLength(this.list) ? this.getArrayLength(this.list) : 0,
            keyword: this.foodType.search,
            // table: 'cmsuser'
          }

          this.listLoading = true
          foodTypeOperate(this.sendPostData).then(res=>{
            this.handleDelDataRet(res, this.selectEle.length)
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
        this.msgDialog('请至少选择一项，超级管理员不可删除')
      }
    },
    //批量冻结解冻
    handleOpenMutil(){
      if(this.selectEle.length){
        this.confirmDialog('冻结/解冻','您确定要处理这些数据吗？').then(()=>{
          this.sendPostData = {
            $url: "userOpenMutil",
            openActive: this.selectActive,
            openInactive: this.selectInactive,
            // table: 'cmsuser'
          }

          this.listLoading = true
          foodTypeOperate(this.sendPostData).then(res=>{
            this.listLoading = false;
            if(!res.code){
              this.list = this.list.map(item=>{
                if(this.selectEle.indexOf(item['_id']) >= 0){
                  item['active'] = (item['active'] + 1) % 2
                }
                return item;
              })
              this.selectEle = []
              
              this.msgDialog(res.message, 'success')
            }else{
              this.msgDialog(res.message)
            }
          }).catch(err=>{
            this.msgDialog(err)
            this.listLoading = false
          })
        }).catch(()=>{
          //点击取消按钮，清空用户所选的值
          this.selectEle = [];
          this.selectActive = [];
          this.selectInactive = [];
          this.$refs.multipleTable.clearSelection();
        })

        
      }else{
        this.msgDialog('请至少选择一项，超级管理员不可冻结')
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
      this.selectEle = []
      this.selectActive = []
      this.selectInactive = []
      this.listLoading = false
    },
    // 查询数据
    handleFilter() {
      this.resetSkip = true
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    //确认框
    confirmDialog(title, intro, type='warning'){
      return this.$confirm(intro, title, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type
      })
    },
    //选择权限组
    handleCheckedRoleChange(evt){
      // console.log(evt)
      // console.log(this.checkedRole)
    },
    // 选中用户
    handleCheckedUserChange(evt){
      if(evt.length >= 2){
        this.temp.users = [evt[evt.length-1]]
      }
    },
    //修改头像
    handleUploadAvatar(file){
      this.handleUploadCommon('avatar', file);
    },

    //文件上传【公共部分】
    handleUploadCommon(field, file){
      let type = file && file.raw && file.raw.type,
          fileFormat = ['image/png','image/jpg','image/gif','image/jpeg','image/webp'],
          filename;
      
      type = type ? type : '';
      if(fileFormat.indexOf(type) < 0){
        this.msgDialog('上传的文件必须为图片')
        return false;
      }
      
      this.handleUploadFile(field, type, file);
    },

    //点击上传图片 field input file字段名
    handleUploadFile(field, type, file){
      let filePath = 'avatar/',
          filename = filePath + new Date().getTime()+'.'+type.replace('image/', ''),
          errMessage = '';

      this.fullscreenLoading = true;
      uploadFile(filename, file.raw).then(res=>{
        if(res.fileID){
          // 获取文件 CDN 下载链接
          this.temp[`cloud_${field}`] = res.fileID
          tempFilePath([res.fileID]).then(result=>{
            this.fullscreenLoading = false;
            result.fileList.forEach((el, index)=>{
              if(el.code === "SUCCESS"){
                  this.temp[field] = el.tempFileURL
              }else{
                  errMessage += el.fileID+": "+el.message+"\n";
              }
            })

            if(errMessage) this.msgDialog(errMessage)
          })
        }else{
          this.msgDialog(res.message ? res.message : '文件上传失败')
        }
      })
    },
    //对字段进行排序
    sortChange(data) {
      const {prop, order } = data
      this.sortField = prop
      this.sortValue = order == 'ascending' || !order ? 'asc' : 'desc'
      localStorage.setItem('sortFieldUser', prop)
      localStorage.setItem('sortValueUser', order ? order : 'ascending')
      this.handleFilter()
    },
    
    //重置表单
    resetTemp(formName) {
      // this.$refs[formName].resetFields();
      this.$refs[formName].clearValidate()
      this.temp['name'] = null
      this.temp['sort'] = null
      this.temp['introduction'] = null
      this.temp['username'] = null
      this.temp['password'] = null
      this.temp['confirmPWD'] = null

      if(!this.isSuperAdmin) this.temp['roles'] = []
    },
    //点击添加按钮处弹框
    handleCreate() {
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
        this.formDataReset();
        this.getAuthList();
      })
    },
    //表单数据重置
    formDataReset(){
      for(let index in this.temp){
        if(index == 'roles' || index == 'users'){
          this.temp[index] = []
        }else if(index == 'active'){
          this.temp[index] = 1
        }else if(index == 'fixPWD'){
          this.temp[index] = false
        }else{
          this.temp[index] = null
        }
      }
    },
    handleDelete(row, index) {
      // 删除数据
      this.confirmDialog('删除数据', '您确定需要删除该条数据吗').then(() => {
        //点击确认按钮
        this.sendPostData = {
          $url: "userTypeDel",
          id: this.list[index]['_id'],
          limit: this.limit,
          skip: (this.currentPage-1) * this.limit,
          sortField: this.sortField,
          sortValue: this.sortValue,
          currDataLength: this.getArrayLength(this.list) ? this.getArrayLength(this.list) : 0,
          keyword: this.foodType.search,
          // table:'cmsuser'
        }
        this.listLoading = true
        foodTypeOperate(this.sendPostData).then(res=>{
          this.handleDelDataRet(res, 1)
        }).catch(err=>{
          this.msgDialog(err)
          this.listLoading = false
        })
      })
    },

    //格式化时间
    dateFormat(time){
      if(time) return time.substr(0, 16)
      else return ''
    },

    //禁用和开启
    handleForbid(row, index){
      this.sendPostData = {
        $url: "forbit",
        state: row['active'] ? 0 : 1,
        id: row['_id'],
        // table: 'cmsuser'
      }

      this.confirmDialog((row['active']?'冻结':'解冻')+'用户', '是否需要'+(row['active']?'冻结':'解冻')+'该用户').then(()=>{
        this.listLoading = true
        foodTypeOperate(this.sendPostData).then(res=>{
            if(res){
              if(!res.code){
                this.msgDialog((row['active']?'冻结':'解冻')+'成功', 'success')
                this.list[index]['active'] = row['active'] ? 0 : 1
              }else{
                this.msgDialog(res.message)
              }
            }
            this.listLoading = false
        }).catch(err=>{
          this.msgDialog(err)
          this.listLoading = false
        })
      })
    },
    handleDownload() {
      //数据导出
      this.sendPostData = {
          $url: "userDownload",
          sortField: this.sortField,
          sortValue: this.sortValue,
          keyword: this.foodType.search,
          table: 'cmsuser',
          field: {
            username: true,
            name: true,
            label: true,
            introduction: true,
            roles:true,
            sort:true,
            active: true,
            addtime:true
          },
          category: 1
      }

      this.downloadLoading = true
      foodTypeOperate(this.sendPostData).then(res=>{
          if(res){
            if(!res.code){
              import('@/vendor/Export2Excel').then(excel => {
                const tHeader = ['编号', '登录用户名', '姓名', '是否超级管理员','介绍','所在权限组','排序','账号状态','添加时间']
                const filterVal = ['No', 'username', 'name', 'label', 'introduction','roles','sort','active','addtime']  //过滤的字段
                const data = this.formatJson(res.data, filterVal)

                excel.export_json_to_excel({
                  header: tHeader,
                  data,
                  filename: '用户列表-'+this.getCurrentDate()
                })
                this.downloadLoading = false
              })
            }else{
              this.msgDialog(res.message)
              this.downloadLoading = false
            }
          }
      }).catch(err=>{
        this.msgDialog(err)
        this.downloadLoading = false
      })
    },
    //字段过滤（返回二维数组，非数组对象）
    formatJson(data, filterVal) {
      return data.map((v,i) => filterVal.map(j => {
        if (j === 'active') {
          return v[j] ? '正常':'冻结'
        } else if(j === 'No') {
          return i+1
        }else if(j == 'type'){
          return v[j] ? v[j] : '暂无'
        }else if(j == 'label'){
          return v[j] ? '是' : '否'
        }else{
          return v[j]
        }
      }))
    },

    //当前日期
    getCurrentDate(sep = ''){
      let date = new Date();
      let currentTime = date.getFullYear()+sep+(date.getMonth() > 8 ? date.getMonth()+1 : '0'+(date.getMonth()+1))+sep+(date.getDate() > 9 ? date.getDate():'0'+date.getDate());

      return currentTime;
    },

    //字符串截取
    contInterception(content, field){
      let cont = content && content[field]
      
      if(cont){
        return (cont.length > 10 ? cont.substr(0, 10)+'...':cont)
      }else{
        return ''
      }
    },

    //判断数组
    getArrayLength(value){
      if(value && Array.isArray(value) && value.length){
        return value.length
      }else return false
    },

    //获取临时图片（默认头像）
    getTempImageURL(data, total, field='avatar'){
      this.list = data;
      this.total = total;
      /* let tempFile = [],
          tempFileBig = [],
          errMessage = '',
          pattern = /^https?/,
          isReplace = [];
      for(let index in data){
        if(!pattern.test(String(data[index][field])) && data[index][field]){
          if(data[index][field]) tempFile.push(data[index][field]);
          isReplace.push(true)
        }else{
          // 如果包含http|s 开头的地址则过滤
          isReplace.push(false)
        }
      }
      
      if(tempFile.length){
        tempFilePath(tempFile).then(result=>{
            this.listLoading = false
            this.fullscreenLoading = false
            
            let i = 0
            isReplace.forEach((value, index)=>{
              if(value){
                if(result.fileList[i]['code'] === "SUCCESS"){
                  data[index][`cloud_${field}`] = data[index][field];
                  data[index][field] = result.fileList[i]['tempFileURL'];
                }else{
                  data[index][`cloud_${field}`] = data[index][field]
                  data[index][field] = ''
                  errMessage += result.fileList[i].fileID+": "+result.fileList[i]['code']+"\n";
                }

                i++;
              }else{
                //cloud_avatar 设置成和原来一样的
                data[index][`cloud_${field}`] = data[index][field];
              }
            })
            
            this.list = data;
            this.total = total;

            if(errMessage) this.msgDialog(errMessage)
        }).catch(err=>{
          this.listLoading = false
          this.fullscreenLoading = false
          this.msgDialog(err)
        })
      }else{
        this.list = data;
        this.total = total;
      } */
    },

    //点击删除图片（单张）
    handleDelImage(temp, field){
      this.confirmDialog('删除图片', '是否需要删除此图片？').then(()=>{
        let pattern = /^https?/
        
        // 如果是以http|s开头的图片
        if(pattern.test(temp[`cloud_${field}`])){
          this.temp[field] = this.temp[`cloud_${field}`] = '';
          if(this.temp['index'] && this.list[this.temp['index']]){
            this.list[this.temp['index']][field] = this.list[this.temp['index']][`cloud_${field}`] = ''
          }
          return;
        }

        this.fullscreenLoading = true

        deleteFile(temp[`cloud_${field}`]).then(res=>{
          this.fullscreenLoading = false;
          res.fileList.forEach((el) => {
            if (el.code === "SUCCESS") {
              this.msgDialog('删除成功','success')
              this.temp[field] = '';
              this.temp[`cloud_${field}`] = '';
              // console.log(this.temp);
              if(this.temp['index'] && this.list[this.temp['index']]){
                this.list[this.temp['index']][field] = this.list[this.temp['index']][`cloud_${field}`] = ''
              }
            } else {
              this.msgDialog('删除失败，请稍后在试');
            }
          })
        })
      })
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

  /* 上传文件 */
  .upload-file{
    display: flex;
  }

  /* 上传文件 */
  .upload-file{
    display: flex;
  }

  /* 删除文件 */
  .delete-file{
    margin-left: 10px;
    position: relative;
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
</style>
