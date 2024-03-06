<template>
  <div class="app-container">
    <!-- 滚动到顶部 在 App.vue内-->
    <el-backtop :right="20"></el-backtop>
    <div class="filter-container">
      <el-input v-model="searchKeyword" placeholder="事务名称关键字" style="max-width: 250px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="searchMobile" placeholder="电话号码" style="max-width: 160px;margin-left:10px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!-- <el-input v-model="searchLicense" placeholder="车牌号" style="max-width: 200px;margin-left:10px;" class="filter-item" @keyup.enter.native="handleFilter" /> -->
      <div class="block search-cond">
        <span>事务创建时间：</span>
        <el-date-picker
            v-model="accident_time"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions">
        </el-date-picker>
      </div>
      <el-button v-waves class="filter-item search" type="primary" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-download" @click="handleExport" :loading="exportLoading">
        导出
      </el-button>
    </div>

    <div :class="'btn-group'+(isSticky ? ' sticky':'')">
      <el-button type="danger" size="mini" @click="handleDelMutil" icon="el-icon-delete" v-if="isMultiDel">批量删除</el-button>
      <!-- 发送短信每次只能勾选1个选项 -->
      <el-button type="primary" size="mini" @click="handleSendMsg" icon="el-icon-message">发送短信</el-button>
      <!-- 查看短信 -->
      <el-button type="primary" size="mini" @click="handleViewMsg" icon="el-icon-view">查看发送短信</el-button>
      <!-- 上传材料每次只能勾选1个选项 -->
      <el-button type="primary" size="mini" @click="handleUploadDoc" icon="el-icon-upload">上传文档</el-button>
      <el-button type="primary" size="mini" @click="handleDownloadDoc" icon="el-icon-download" :loading="documentDownloading">下载文档</el-button>
      <el-button type="primary" size="mini" @click="handleDownloadQRCode" icon="el-icon-s-grid" :loading="QRcodeLoading">下载二维码</el-button>
      <!-- 查看签名 -->
      <el-button type="primary" size="mini" @click="handleViewSign" icon="el-icon-view" :loading="signLoading">查看签名</el-button>
      <!-- 添加详情 -->
      <el-button type="primary" size="mini" @click="handleAddEditDetail" icon="el-icon-edit" :loading="detailLoading">添加/编辑事务附件</el-button>
      <!-- 签发 -->
      <el-button type="primary" size="mini" icon="el-icon-edit-outline" @click="handleIssue" :loading="issueLoading">签发</el-button>
      <!-- 完成事务 -->
      <el-button type="primary" size="mini" icon="el-icon-circle-check" @click="handleOverMediator" :loading="overLoading">完成事务</el-button>
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
      <el-table-column label="事务名称" prop="accident_name" align="center" width="120"></el-table-column>
      <!-- <el-table-column label="事务介绍" prop="accident_intro" align="center" width="180"></el-table-column> -->
      <el-table-column label="事务创建时间" prop="accident_date" align="center" width="160" sortable="custom"></el-table-column>
      <el-table-column label="用户" width="260" prop="accident_memberInfo">
        <template slot-scope="{row}">
          <div v-for="(item, index) in row.accident_memberInfo_bak" :key="index">
            姓名：{{item.name}}<br>联系电话：{{item.mobile}}<br>身份验证码：{{item.code}}<br>证件类型：{{item.cert}}<br>证件号码：{{item.cert_no}}<br><!-- 车型：{{item.models}}<br>车牌号：{{item.license}}<br>车主：{{item.car_master}}<br> -->人员类别：{{item.member_type}}
            <div v-if="item.userDoc">
              <a href="javascript:;" style="display:block;color:red;" @click="handleViewUserDoc(item.userDoc, item.name, item.code, row['_id'])">查看用户上传材料</a>
            </div>
            <el-divider v-if="index+1 != row.accident_memberInfo_bak.length"></el-divider>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="在线助手" width="90">
        <template slot-scope="{row}">
          <div v-for="(item, index) in row.mediatorList" :key="index">{{item}}<br></div>
        </template>
      </el-table-column>
      <el-table-column label="在线时间" prop="accident_mediate" align="center" width="280" sortable="custom">
        <template slot-scope="{row}">
          <span>{{dateFormat(row['accident_mediate'])}}</span>
        </template>
      </el-table-column>
      <el-table-column label="求助状态" prop="accident_state" align="center" width="150">
        <template slot-scope="{row}">
          <!-- <span v-if="row['accident_isComplete']" style="color:red;">{{row['accident_state']}}</span>
          <span v-else>{{row['accident_state']}}</span> -->
          <span :style="row['accident_isComplete']?'color:red;':''" v-html="row['accident_state']"></span>
          <br />
          <span v-if="row.usage" style="color:red;">{{`本月已使用${Math.ceil(row.usage/60)}分钟`}}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" width="90" v-if="isMultiDel">
        <template slot-scope="{row}">
          <span>{{row.uname}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="180" class-name="small-padding fixed-width">
        <!-- 解构 scope 中的 row 和 $index 出来 -->
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" icon="el-icon-video-play" @click="handleChat(row, $index)" :disabled="row.disabled">
            音视频聊天
          </el-button>
          <br />
          <el-button type="primary" size="mini" icon="el-icon-video-camera" @click="handleViewVideo(row, $index)" style="margin-top:15px">
            查看录制视频
          </el-button>
          <br />
          <el-button type="primary" size="mini" icon="el-icon-view" @click="handleViewDoc(row, $index)" style="margin-top:15px">
            查看文档
          </el-button>
          <br />
          <el-button type="primary" size="mini" icon="el-icon-view" @click="handleViewQRcode(row, $index)" style="margin-top:15px">
            查看二维码
          </el-button>
          <br v-if="!row['accident_isComplete']"/>
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row, $index)" v-if="!row['accident_isComplete']" style="margin-top:15px">
            编辑
          </el-button>
          <br />
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row, $index)" style="margin-top:15px" v-if="row.delBtn">
            删除
          </el-button>
          <!-- 不是真删除，修改状态即可 -->
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
       :disabled="pageDisabled"
       class="pagination">
    </el-pagination>

    <el-dialog :title="status=='form' ? '事务'+(currentID ? '编辑':'添加'):status=='upload'?'上传文档':(status=='view'?'查看短信':status=='detail'?'添加/编辑事务附件': status=='viewQRCode'?'查看二维码':status=='message'?'发送短信':(status=='live'?'音视频聊天':status=='record'?'查看已录制视频':'查看签名'))" :visible.sync="dialogFormVisible" @closed="handleCloseDialog" v-loading="viewCodeLoading" top="5vh" width="75%" :show-close="!pageDisabled" :close-on-click-modal="!pageDisabled" :close-on-press-escape="!pageDisabled">
      <!-- AddEditAccident -->
      <el-form ref="accident" :rules="rules" :model="accident" label-position="left" label-width="120px" style="width: 1000px; margin-left:30px;" v-if="status=='form'">
        <el-form-item label="事务名称" prop="accident_name">
            <el-input v-model="accident.accident_name" autocomplete="off" placeholder="请填写事务名称" style="width:450px;"/>
        </el-form-item>
        <el-form-item label="事务介绍" prop="accident_intro">
            <el-input type="textarea" :rows="5" v-model="accident.accident_intro" autocomplete="off" placeholder="请填写事务介绍" style="width:450px;"/>
        </el-form-item>
        <el-form-item label="事务创建时间" prop="accident_date">
            <el-date-picker
              v-model="accident.accident_date"
              type="datetime"
              placeholder="请选择事务创建时间"
              format="yyyy-MM-dd HH:mm"
              @change="handleSelectOver">
            </el-date-picker>
        </el-form-item>
        <el-form-item label="用户" prop="accident_memberInfo">
          <template>
            <table id="relation-ship">
              <tr>
                <th>姓名<span style="color:red;">*</span></th>
                <th>联系电话<span style="color:red;">*</span></th>
                <th>证件类型</th>
                <th>证件号码</th>
                <!-- <th>车型</th> -->
                <!-- <th>车牌号</th> -->
                <!-- <th>是否为车主</th> -->
                <th>人员类别<span style="color:red;">*</span></th>
                <th>&nbsp;</th>
              </tr>
              <tr v-for="(item, index) in accident.accident_memberInfo" :key="index">
                <td>
                  <el-input v-model="item['name']" type="text" autocomplete="off" placeholder="请填写姓名" style="width:150px;" :disabled="item['disabled']?true:false"/>
                </td>
                <td>
                  <el-input v-model="item['mobile']" type="text" autocomplete="off" placeholder="请填写电话号码" style="width:180px;" :disabled="item['disabled']?true:false"/>
                </td>
                <td>
                  <el-select v-model="item['cert']" style="min-width:200px;">
                    <el-option
                      v-for="(item, index) in certList"
                      :key="index"
                      :label="item"
                      :value="item">
                    </el-option>
                  </el-select>
                </td>
                <td>
                  <el-input v-model="item['cert_no']" type="text" autocomplete="off" placeholder="请填写证件号码" style="width:240px;"/>
                </td>
                <!-- <td>
                  <el-select v-model="item['models']" style="min-width:200px;">
                    <el-option
                      v-for="(item, index) in models"
                      :key="index"
                      :label="item"
                      :value="item">
                    </el-option>
                  </el-select>
                </td>
                <td>
                  <el-input v-model="item['license']" type="text" autocomplete="off" placeholder="请填写车牌号" style="width:150px;"/>
                </td>
                <td>
                  <el-select v-model="item['car_master']" style="width:100px;">
                    <el-option
                      v-for="(item, index) in ['是','否']"
                      :key="index"
                      :label="item"
                      :value="item">
                    </el-option>
                  </el-select>
                </td> -->
                <td>
                  <el-select v-model="item['member_type']" style="width:200px;">
                    <el-option
                      v-for="(item, index) in mTypeList"
                      :key="index"
                      :label="item"
                      :value="item">
                    </el-option>
                  </el-select>
                </td>
                <td>
                  <el-button type="danger" @click="handleRemoveMobile(index, item._id ? item._id:null)" size="mini" icon="el-icon-delete" v-if="index">删除</el-button>
                  <el-button type="danger" @click="handleRemoveMobile(index, item._id ? item._id:null)" size="mini" icon="el-icon-delete" v-else-if="accident.accident_memberInfo.length === 1">清除</el-button>
                </td>
              </tr>
            </table>
            <el-button type="primary" class="add-mobile" size="mini" @click="handleAddMobile" icon="el-icon-circle-plus-outline">添加用户</el-button>
            <el-button type="primary" class="add-mobile" size="mini" @click="handleSelectApply" icon="el-icon-check">选择申请用户</el-button>
          </template>
        </el-form-item>
        <el-form-item label="在线助手" :rules="[
            {required: true, message:'请勾选在线助手', trigger: 'submit'}
          ]">
          <div id="mediator">
            <el-checkbox-group v-model="accident_mediator" @change="handleMediator">
              <!-- :label是实际获取的值 -->
              <el-checkbox v-for="(item, index) in mediatorList" :label="item._id" :key="index">{{item.name}}</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
        <el-form-item label="在线时间" prop="accident_mediate">
            <el-date-picker
              v-model="accident.accident_mediate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm">
            </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('accident')" :loading="buttonLoading" icon="el-icon-upload2">提交</el-button>
          <el-button @click="resetTemp('accident')" icon="el-icon-refresh-right" style="color:rgb(96,98,102);">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 查看二维码 -->
      <div v-else-if="status=='viewQRCode'">
        <el-image 
        class="el-upload-list__item-thumbnail"
        :src="viewQRCode['tempFile']"
        fit="contain"
        :preview-src-list="[viewQRCode['tempFile']]"
        style="margin-left:25%;"
        >
        </el-image>
        <a href="javascript:;" @click="handleDownloadSignature(viewQRCode['cloudFileID'])" style="display:block;color:#58b6d5;">下载二维码</a>
      </div>
      <!-- uploadDocument -->
      <el-form ref="uploadDoc" :model="uploadDoc" label-position="left" label-width="120px" style="margin-left:30px;margin-top:30px;" v-else-if="status=='upload'">
        <el-form-item label="上传文档">
          <el-upload
          action="#"
          :on-change="handleChange"
          accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
          :file-list="fileList"
          :auto-upload="false"
          :on-remove="handleRemove"
          >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传docx,pdf文件，且不超过5M</div>
          </el-upload>
        </el-form-item>
        <!-- 上传公章/to be continue -->
        <!-- <el-form-item label="上传公章">
          <el-upload
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :limit="1"
          :ref="'picUpload'"
          :on-exceed="handleOffical"
          :on-change="handleChangeOffical"
          accept="image/png,image/jpeg,image/gif"
          :file-list="fileListPic"
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
                  @click="handleRemovePicSingle(file)"
                  >
                  <i class="el-icon-delete"></i>
                  </span>
              </span>
              </div>
              <div slot="tip" class="el-upload__tip">只能上传jpg,png,gif文件</div>
          </el-upload>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="submitForm('uploadDoc')" :loading="buttonLoading" icon="el-icon-upload2">提交</el-button>
        </el-form-item>
      </el-form>
      <!-- uploadAccidentDetail -->
      <el-form ref="accidentDetail" :rules="detailRule" :model="accidentDetail" label-position="left" label-width="120px" style="margin-left:30px;margin-top:30px;" v-else-if="status=='detail'">
        <el-form-item label="事务附件" prop="list">
          <div class="accident-detail" v-for="(item, index) in accidentDetail.list" :key="index">
            <div style="font-size:14px;font-weigth:bolder;color:red;" v-if="item.identity">{{item.name}}（{{item.identity}}）</div>
            <el-input type="textarea" autocomplete="off" placeholder="请填写事务附件" :rows="5" v-model="item.intro" class="accident-intro"/>
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="config"
              :ref="'elUpload_'+index"
              :on-exceed="handleExceed"
              :on-change="(file,fileList)=>handleChangePic(file, fileList, index)"
              accept="image/png,image/jpeg,image/jpg,,image/gif"
              :file-list="item.picList"
              multiple
              >
                <i slot="default" class="el-icon-plus"></i>
                <div slot="file" slot-scope="{file}">
                  <el-image 
                    class="el-upload-list__item-thumbnail"
                    :src="file.url"
                    fit="contain"
                    :preview-src-list="srcList"
                    @click="handleImageShow(index)"
                    >
                  </el-image>
                  <span class="el-upload-list__item-actions">
                    <span
                      class="el-upload-list__item-delete"
                      @click="handleRemovePic(file, index)"
                    >
                      <i class="el-icon-delete"></i>
                    </span>
                  </span>
                </div>
                <div slot="tip" class="el-upload__tip">只能上传jpg,png,gif文件，最多{{config}}张图片</div>
            </el-upload>
            
            <el-button type="danger" v-if="index" @click="handleRemoveAccidentDetail(index)" size="mini" icon="el-icon-delete">删除</el-button>
            <el-divider></el-divider>
          </div>
          <el-button type="primary" class="add-mobile" size="mini" @click="handleAddDetail" icon="el-icon-circle-plus-outline">添加事务附件</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('accidentDetail')" :loading="buttonLoading" icon="el-icon-upload2">提交</el-button>
        </el-form-item>
      </el-form>
      <!-- viewShortMessage -->
      <el-table
        :data="shortMessageView"
        stripe
        style="width: 100%"
        v-loading="fullscreenLoading"
        v-else-if="status=='view'">
        <el-table-column prop="addtime" label="日期" width="180"></el-table-column>
        <el-table-column prop="content" label="短信内容" width="380"></el-table-column>
        <el-table-column prop="recipient" label="收信人" width="300">
          <template slot-scope="{row}">
            <div v-for="(item, index) in row.recipient" :key="index">姓名：{{item.name}}<br>电话号码：{{item.mobile}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="method" label="短信发送方式">
          <template slot-scope="{row}">
            <span v-if="row['method'] === 'A'">第三方短信</span>
            <span v-else>腾讯云开发短信</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 查看视频录制 -->
      <div v-else-if="status=='record'" style="width:100%;max-height:600px;overflow-y:auto;">
        <el-table
        :data="showRecordView"
        stripe
        style="width: 100%"
        v-loading="recordLoading"
        >
        <el-table-column label="视频名称" width="280">
          <template slot-scope="{row, $index}">
            <div v-if="recordIndex === $index">
              <el-input v-model="row.name" placeholder="请输入视频名称" @focus="$event.target.select()"></el-input>
              <el-button type="primary" icon="el-icon-edit" @click="handleFixed(row.name)" style="margin-top:6px;">修改</el-button>
              <el-button type="default" icon="el-icon-close" @click="handleCancel($index)" style="margin-top:6px;">取消</el-button>
            </div>
            <span v-else>{{row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="录制时间" width="380"></el-table-column>
        <!-- <el-table-column label="共享二维码" width="300">
          <template slot-scope="{row}">
            <el-image :src="row.qrcodeAddressReal" :fit="'fit'" v-show="row.qrcodeAddressReal"></el-image>
          </template>
        </el-table-column> -->
        <el-table-column label="操作">
          <template slot-scope="{row, $index}">
            <!-- 文件名 -->
            <a :href="baseURL+suffix(row.fileAddress)" style="color:#58b6d5;" target="_blank">查看录像</a>
            <span style="padding:0 5px;position:relative;top:-2px;">|</span>
            <a href="javascript:void(0);" style="color:#58b6d5;" @click="handleChangeName($index, row.name)">修改名称</a>
            <span style="padding:0 5px;position:relative;top:-2px;">|</span>
            <a href="javascript:void(0);" style="color:#58b6d5;" @click="handleShare($index, row.qrcodeAddressReal, row.name, row.fileAddress, row.time, row.qrcodeAddress)">共享</a>
            <span style="padding:0 5px;position:relative;top:-2px;">|</span>
            <a href="javascript:void(0);" style="color:#58b6d5;" @click="handleShare($index, row.qrcodeAddressShortReal, row.name, row.fileAddressShort, row.time, row.qrcodeAddressShort, true)">共享（短链接）</a>
          </template>
        </el-table-column>
        </el-table>
      </div>
      <!-- view Signature -->
      <el-form label-position="left" label-width="120px" style="margin-left:30px;" v-else-if="status=='sign'">
        <el-form-item :label="'签名'+(index+1)" v-for="(item, index) in signList" :key="index">
          <el-image 
            style="width: 350px;"
            :src="item.tempUrl"
            fit="contain">
          </el-image>
          <!-- 下载 -->
          <a href="javascript:;" @click="handleDownloadSignature(item.cloudFileId)" style="display:block;color:#58b6d5;">下载签名</a>
        </el-form-item>
        <div v-if="!signList.length" style="text-align:center;">暂无签名</div>
      </el-form>
      <!-- !livepush 音视频聊天-->
      <div v-else-if="status==='live'">
        <el-row>
          <el-col :span="24">
            <el-button type="primary" @click="handleJoinRoom" icon="el-icon-right" :loading="joinRoomLoading" :disabled="joinRoomState">加入房间</el-button>
            <el-button type="primary" @click="handleLeaveRoom" icon="el-icon-back" style="margin-left:15px;" :loading="leaveLoading">离开房间/关闭屏幕共享</el-button>
            <el-button type="primary" @click="handlePrivateChat" icon="el-icon-user-solid" style="margin-left:15px;" :loading="privateChatLoading" :disabled="privateRoomState">开启私聊</el-button>
            <el-button type="primary" @click="handleUpdateUserState" icon="el-icon-refresh" style="margin-left:15px;" :loading="userStateLoading">更新用户状态</el-button>
            <el-button type="primary" @click="handleSharedScreen" icon="el-icon-monitor" :loading="shareLoading" :disabled="shareState">分享屏幕</el-button>
            <el-button type="primary" @click="handleStartRecord" icon="el-icon-video-camera" :loading="startLoading" :disabled="startState">开启录制</el-button>
            <el-button type="primary" @click="handleEndRecord" icon="el-icon-timer" :loading="endLoading">结束录制</el-button>
            <el-button type="primary" @click="handleRecordState" icon="el-icon-search" :loading="recordStateLoading">查询录制状态</el-button>
          </el-col>
          <el-col :span="24" style="margin-top:20px;">
            <div style="font-size:14px;margin-bottom:15px;">请选择用户：</div>
            <el-radio-group v-model="privateMember" style="display:flex;">
              <el-radio :label="item" v-for="(item, index) in userList" :key="index">{{item.name}}</el-radio>
           </el-radio-group>
          </el-col>
        </el-row>
        <div class="container">
          <div class="row video-group">
            <div class="col">
              <div id="remote-playerlist" style="display:flex;flex-flow:row wrap;justify-content:center;"></div>
            </div>
            <div class="w-100"></div>
            <div class="col" style="display:flex;justify-content:center;">
              <p id="local-player-name" class="player-name"></p>
              <div id="local-player" class="player"></div>
              <div id="danmu" ref="danmuRef">
                <ul id="danmu-list">
                  <li v-for="(item, index) in danmuList" :key="index">
                    {{item.nickname?item.nickname+'：':''}}{{item.message_content}}
                  </li>
                  <li style="color:red" v-if="isDanmuBreak">弹幕正在连接...</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- sendShortMessage -->
      <el-form ref="shortMessage" :rules="shortRules" :model="shortMessage" label-position="left" label-width="120px" style="width: 400px; margin-left:30px;" v-else>
        <el-form-item label="短信内容" prop="content">
            <el-input autocomplete="off" placeholder="请填写短信内容" :rows="3" type="textarea" v-model="shortMessage.content" clearable/>
        </el-form-item>
        <el-form-item label="模板列表">
          <el-radio-group v-model="smsUnit" @input="handleSmsChk">
              <el-radio :label="index" v-for="(item, index) in smsList" :key="index">{{item.title}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="收信人" prop="recipient">
          <el-checkbox-group v-model="checkedRecipient" @change="handleCheckedCitiesChange">
            <!-- :label是实际获取的值 -->
            <el-checkbox v-for="(item, index) in shortMessage.recipient" :label="item" :key="index">{{item.name}}：{{item.mobile}}（{{item.member_type}}）</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('shortMessage')" :loading="buttonLoading" icon="el-icon-upload2" :disabled="time > 0 ? true:false">{{time>0 ? time:'提交'}}</el-button>
          <el-button @click="resetTemp('shortMessage')" icon="el-icon-refresh-right" style="color:rgb(96,98,102);">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 抽屉 -->
    <el-drawer
      :title="userTitle"
      :visible.sync="isShowUserDocList"
      :with-header="true"
      @closed="handleCloseDrawer"
      :size="qrcodeAddr?'35%':'60%'">
      <div style="height:calc(100% - 80px);">
        <div v-if="docList.length" style="text-align:center;height:68%;">
          <el-table
          :data="docList"
          style="width: 100%;overflow-y:scroll;max-height:100%;">
          <el-table-column prop="name" label="材料名称"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handleViewDocDetail(row, $index, docList)" v-loading.fullscreen.lock="documentTempLoading">
                查看材料详情
              </el-button>
            </template>
          </el-table-column>
          </el-table>
          <el-button type="primary" size="mini" icon="el-icon-back" @click="handleReturn" style="margin-top:15px;" v-if="isNeeBackBtn">
                  返回
          </el-button>
          <el-button type="primary" size="mini" icon="el-icon-refresh" @click="handleRepeat" style="margin-top:15px;" v-if="_id && codes">
                  重新获取
          </el-button>
        </div>
        <div v-else-if="applyList.length" style="text-align:center;">
          <el-table
          :data="applyList"
          style="width: 100%;overflow-y:scroll;max-height:90%;">
          <el-table-column prop="username" label="姓名" width="120"></el-table-column>
          <el-table-column prop="mobile" label="联系电话" width="155">
            <template slot-scope="{row}">
              <span>{{row.mobile}}</span>
            </template>
          </el-table-column>
          <el-table-column property="license" label="证件类型" width="100"></el-table-column>
          <el-table-column property="licenseNo" label="证件号码" width="250"></el-table-column>
          <el-table-column prop="addtime" label="申请时间"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button type="primary" size="mini" icon="el-icon-check" @click="handleJoinDetail(row, $index)">
                选择
              </el-button>
              <br v-if="row.fileID"/>
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handleViewLicense(row, $index)" style="margin-top:10px;" v-loading.fullscreen.lock="documentTempLoading" v-if="row.fileID">
                查看证件信息
              </el-button>
              <br v-if="row.uploadFile"/>
              <el-button type="primary" size="mini" icon="el-icon-view" @click="handleUploadFileInfo(row, $index)" style="margin-top:10px;" v-loading.fullscreen.lock="documentTempLoading" v-if="row.uploadFile">
                查看上传材料
              </el-button>
            </template>
          </el-table-column>
          </el-table>
          <el-button type="primary" size="mini" icon="el-icon-refresh" @click="getApplyInfoList()" style="margin-top:15px;" v-loading.fullscreen.lock="documentTempLoading">
                重新获取
          </el-button>
        </div>
        <div v-else-if="qrcodeAddr" style="margin:10px auto;text-align:center;">
          <el-image :src="qrcodeAddr" :fit="'fit'" @load="handleLoadOver" v-show="loadingState"></el-image>
          <div v-show="loadingState" style="display:flex;just;justify-content:center">
            <el-button type="primary" icon="el-icon-printer" @click="handlePrinter" :loading="printLoading" style="margin-right:10px;">打印二维码</el-button>
            <el-button type="primary" icon="el-icon-full-screen" @click="handleSendQRCode" :loading="sendLoading" style="margin-right:10px;">发送二维码</el-button>
            <el-button type="primary" icon="el-icon-download" @click="handleDownloadVideoQRCode" :loading="videoQrCodeLoading" style="margin-right:10px;">下载二维码</el-button>
            <el-button type="primary" icon="el-icon-refresh" @click="handleRepeatCreate" v-show="currentFileAddr && currentFileAddr.length < 45" :loading="qrCodeRepeatLoading">重新生成二维码</el-button>
          </div>
          <div style="text-align:center;" v-show="!loadingState">二维码加载中...</div>
        </div>
        <el-drawer
          :title="userDocTitle"
          :append-to-body="true"
          direction="ttb"
          size="100%"
          :with-header="true"
          :visible.sync="isShowUserDoc">
          <el-image :src="documentPicture[0]" v-if="documentPicture" fit="contain" :preview-src-list="documentPicture" class="doc-pic"></el-image>
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
              <div style="text-align:center;font-size:16px;">{{index ? '背面':'正面'}}</div>
              <el-image :src="item" fit="contain" :preview-src-list="[item]" class="doc-pic" v-if="item"></el-image>
            </div>
          </div>
        </el-drawer>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive 水波纹效果
import {commonRequest, commonCloudFileDownload, commonCloudFileUpload, commonCloudFileTempFile} from "@/api/common/commonRequest"
import {validateMobileAndName, validateAccidentDetail} from '@/utils/formValidation/accidentValidation'
import {retRealData, saveToLocal, getFromLocal, getRefDate, getRandCode, deleteLocal} from '@/utils/common/commonFunction'
import {getToken, getRealCookie} from '@/utils/auth'
import ArRTC from "ar-rtc-sdk"
import {cloudApp} from '@/main'
import axios from 'axios'
import qrcode from 'qrcode'

export default {
  name: 'AccidentList',
  directives: { waves },
  data() {
    return {
      smsUnit: -1,  //选择的短信模板的值
      privateMember:null,
      tableKey: 0,
      list: null, //有用
      total: 0,   //有用
      listLoading: true,  //控制表格加载框
      dialogFormVisible: false, //控制Dialog的开关
      viewCodeLoading: false, //查看小程序码的加载显示
      fullscreenLoading: false, //是否全屏加载
      recordLoading: false, //视频录制的加载
      buttonLoading:false,  //按钮加载中
      QRcodeLoading: false, //下载按钮加载中...
      documentDownloading: false, //下载文档按钮
      signLoading: false, //签名按钮控制
      detailLoading: false, //事务附件按钮控制
      exportLoading: false, //导出loading
      leaveLoading: false,  //
      documentTempLoading: false, //全局加载
      joinRoomLoading: false, //加入聊天房间
      joinRoomState: false, //加入房间的状态
      shareLoading: false,  //屏幕分享
      startLoading: false,  //开始录制
      endLoading: false,  //结束录制
      recordStateLoading: false,  //查询录制状态
      startState: false,  //开始状态  //每次刷新之前调用关闭录制按钮，localStorage有sid和ResourceId则发送，否则不发送
      shareState: false,  //分享状态
      privateChatLoading: false,  //私聊加载
      userStateLoading: false,  //用户状态
      privateRoomState: false,  //私聊状态
      overLoading: false, //完成事务loading
      issueLoading: false,  //签发Loading
      currentPage: 1,       //当前页数
      searchKeyword: "",    //查询关键字
      searchMobile: "",   //查询电话号码
      searchLicense: "",  //查询车牌号
      limit: retRealData(getFromLocal('stayLocalAccident'), 10, 'Max'),  //每页显示的条数
      sortField: retRealData(getFromLocal('stayLocalAccident'), 'accident_date', 'SortField'),//排序字段
      sortValue: retRealData(getFromLocal('stayLocalAccident'), 'desc', 'SortValue').replace('ending',''),//升序还是降序
      defSortField: retRealData(getFromLocal('stayLocalAccident'), 'accident_date', 'SortField'),
      defSortValue: retRealData(getFromLocal('stayLocalAccident'), 'descending', 'SortValue'),
      resetSkip: false, //是否重置页码 
      pageSizes: [10,15,20,25,30], //切换每页显示的条数
      currentID: null,  //当前ID，编辑弹出框的时候赋值
      currentIndex: null, //当前列表的索引值
      selectEle:[], //选择需要批量删除的数据，勾选的_id
      collectTempPicture: {}, //收集临时获取到的图片二维码数据
      uploadDoc:{}, //上传文档
      accidentDetail:{
        list: [{
          intro: '',
          picList: []
        }]
      },  //事务附件
      signList:[],  //签名列表
      pageDisabled: false,  //翻译的禁止与展示
      accident: {
        accident_name: "",
        accident_intro: "",
        accident_date: "",
        accident_mediate: "",
        accident_memberInfo: [
          {
            name: '',
            mobile: '',
            models: '',
            cert: '',
            cert_no: '',
            license: '',
            code: '',
            car_master: '',
            member_type: '',
            position: 0
          }
        ]
      },
      isMultiDel: false,  //多选按钮是否出现
      danmu: null,  //弹幕连接数据库
      danmuList: [],  //弹幕列表
      isDanmuBreak: false,  //弹幕是否连接中断
      maxScroll: 5000000, //滚动的最大距离
      timeMachine: null,  //定时器
      accident_mediator: [],  //求助列表不能放里面（复选框的选中值不能放置在内）
      rules: {
        accident_name: [
            {required: true, message: '请输入事务名称', trigger: 'blur'}
        ],
        accident_date:[
            {required: true, message: '请选择事务创建时间', trigger: 'blur'}
        ],
        accident_mediate:[
            {required: true, message: '请选择在线时间', trigger: 'blur'}
        ],
        accident_memberInfo:[
            {validator: validateMobileAndName, trigger: "submit"}
        ]
      },
      sendPostData:{}, //发送的post数据
      pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
      },
      accident_time: "",    //搜索项的日期选择
      stayLocalAccident: {
        SortField: '',
        SortValue: '',
        Max: ''
      },//本地留存localStorage
      status: 'form',   //当前状态 form|message|upload|view|sign
      shortMessage: {
        template: "", //模板ID
        content: "",  //短信内容
        recipient: [] //收件人
      }, //发送短信
      shortRules:{
        content:[
          {required: true, message: '请输入短信内容', trigger: 'blur'}
          // { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        recipient: [
          {required: true, message: '请勾选收信人', trigger: 'submit'}
        ]
      },
      detailRule:{
        list:[
          {validator: validateAccidentDetail, trigger: "submit"}
        ]
      },
      checkedRecipient: [],  //复选框选中项
      mediator: [], //在线助手复选框列表
      shortMessageView: null,  //查看短信
      showRecordView: null, //查看视频录制内容
      fileList: [],  //文件列表
      fileListPic: [],  //文件上传图片组
      fileType: [
        // 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/pdf'
      ],  //文件类型
      imgFileType: [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif'
      ],  //图片文件类型
      srcList:[""],  //预览图列表
      viewQRCode: null, //查看图片二维码
      mediatorList: [],  //在线助手列表
      isShowUserDocList: false,  //是否显示用户列表
      isShowUserDoc: false,  //是否显示文档详情
      userTitle: "",   //用户标题
      userDocTitle: "", //查看的图片标题
      docList: [], //获取到的文档列表
      applyList: [],      //申请列表
      tempApplyList: [],  //临时申请列表，用来暂存appList
      documentPicture: null, //文档图片
      licensePicture: null, //证件信息图片
      documentDocx: null,  //word文档
      documentPdf: null, //pdf文档
      documentXlsx: null, //xlsx文档
      pdfPreview: "",  //pdf预览
      xlsxPreview: "", //xlsx预览
      isSticky: false, //吸顶
      offsetTop: 0,
      smsList: [], //获取短信模板
      smsType: '', //短信类型
      // models: [{_id:'',name:'请选择车型'}],  //车牌列表
      models: ['请选择车型'],  //车牌列表
      // certList: [{_id:'',name:'请选择证件类型'}],  //车牌列表
      certList: ['请选择证件类型'],
      // mTypeList: [{_id:'',type:'请选择人员类别',position: 0}],
      mTypeList: ['请选择人员类别'],  //人员类别
      positionList: null,
      usedApplyId: [],  //已经使用的申请ID列表
      countDown: null,   //倒计时
      time: getFromLocal('time') || 0,  //时间
      isNeeBackBtn: false, //是否需要返回按钮
      config: 0,
      codes: null,
      _id: null,
      localTracks:{
        videoTrack: null,
        audioTrack: null
      },
      roomIdAndUserId: null,
      client: null,
      remoteUsers: {},
      chatMode: '2',
      recordIndex: null,
      recordName: '',
      baseURL: 'https://hyyc-5ghntdc93de0347c-1318708170.tcloudbaseapp.com/video.html?url=',
      qrcodeAddr: null,
      currentFileAddr: null,
      recordCloudAddr: null,
      recordTime: null,
      loadingState: false,
      printLoading: false,
      sendLoading: false, //发送二维码
      videoQrCodeLoading: false,  //下载二维码
      qrCodeRepeatLoading: false,
      currentQrCodeIndex: null,
    }
  },
  created() {
    this.getList()
    this.getMediatorList()
    this.getSmsList()
    // this.getModels()
    this.getCerts()
    this.getMtype()
    // 获取配置信息
    this.getConfig()
    // 关闭录制，以防止刷新
    this.handleEndRecord(false, 0)
    // 防止刷新之后不能删除正在直播的房间
    deleteLocal('roomIds')
  },
  mounted(){
    window.addEventListener('scroll', this.initHeight)
    this.$nextTick(()=>{
      this.offsetTop = document.querySelector('.btn-group').offsetTop;
    })
    this.countDownEvent(this.time)
  },
  destroyed(){
    window.removeEventListener('scroll', this.initHeight)
  },
  computed:{
   userList(){
    return this.list && this.currentIndex !== null  ?
           this.list[this.currentIndex]['accident_memberInfo_bak'] : []
   }
  },
  methods: {
    //吸顶
    initHeight() {
      // 设置或获取位于对象最顶端和窗口中可见内容的最顶端之间的距离 (被卷曲的高度)
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      //如果被卷曲的高度大于吸顶元素到顶端位置 的距离
      this.isSticky = scrollTop > this.offsetTop ? true : false;
    },
    //Model
    getMtype(){
      commonRequest({
        $url: 'getMTypeData'
      }).then(res => {
        if(res.code) this.msgDialog(res.message)
        else{
          if(Array.isArray(res.data) && res.data.length){
            let pList = {}, newMType = []
            // this.mTypeList = res.data
            for(let unit in res.data){
              newMType.push(res.data[unit]['type'])
              pList[res.data[unit]['type']] = res.data[unit]['position']
              // pList[res.data[unit]['_id']] = res.data[unit]['position']
            }
            this.mTypeList = newMType
            this.positionList = pList
          }
        }
      }).catch(err=>{
        this.msgDialog(err)
      })
    },
    // 获取配置信息
    getConfig(){
      commonRequest({
        $url: 'getConfig'
      }).then(res => {
        if(res.code) this.msgDialog(res.message)
        else if(res.data) this.chatMode = res.data
      }).catch(err=>{
        this.msgDialog(err)
      })
    },
    //结束录制
    handleEndRecord(evt, t = 1){
      if(evt !== false && !this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }
      
      let currentRecordUserInfo = getFromLocal('recordInfo')
      if(currentRecordUserInfo && typeof currentRecordUserInfo === 'string'){
        currentRecordUserInfo = JSON.parse(currentRecordUserInfo)
        const id = evt === false ? currentRecordUserInfo.id : this.currentID
        const sid = currentRecordUserInfo.sid || null
        const resourceId = currentRecordUserInfo.resourceId || null
        const roomId = currentRecordUserInfo.roomId || null
        if(id && sid && resourceId && roomId){
          this.endLoading = true
          commonRequest({
            $url: 'stopRecord',
            id,
            resourceId,
            roomId,
            cmsUserId: getToken(),
            sid
          }).then(res=>{
            this.endLoading = false
            this.startState = false //结束录制
            if(res.code) this.msgDialog(res.message)
            else{
              if(t && res.message) this.msgDialog(res.message,'success')
            }
            deleteLocal('recordInfo')
          }).catch(err => {
            this.endLoading = false
            this.msgDialog(err)
            deleteLocal('recordInfo')
          })
        }
      }else{
        if(evt !== false) this.msgDialog('请求参数不全')
      }
    },

    //开启录制
    handleStartRecord(){
      if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }

      if(this.roomIdAndUserId){
        this.startLoading = true
        commonRequest({
            $url: 'beginRecord',
            roomId: this.roomIdAndUserId.roomId,
            cmsUserId: getToken(),
            uid: this.roomIdAndUserId.userId,
            id: this.currentID
          }).then(res=>{
            this.startLoading = false
            if(res.code) this.msgDialog(res.message)
            else{
              if(res.message) this.msgDialog(res.message, 'success')
              this.startState = true  //不允许再次点击开始录制
              const recordInfo = {
                id: this.currentID,
                resourceId: res.data && res.data.resourceId || "",
                sid: res.data && res.data.sid || "",
                roomId: this.roomIdAndUserId.roomId
              }
              saveToLocal('recordInfo', JSON.stringify(recordInfo));
            }
          }).catch(err => {
            this.startLoading = false
            this.msgDialog(err)
          })
      }else{
        this.msgDialog('请先开启加入房间或分享屏幕')
      }
    },

    //获取证件列表
    getCerts(){
      commonRequest({
        $url: 'getCertData'
      }).then(res => {
        if(res.code) this.msgDialog(res.message)
        else{
          if(Array.isArray(res.data) && res.data.length) this.certList = res.data 
        }
      }).catch(err=>{
        this.msgDialog(err)
      })
    },
    //获取车牌列表
    getModels(){
      commonRequest({
        $url: 'getModelsData'
      }).then(res => {
        if(res.code) this.msgDialog(res.message)
        else{
          if(Array.isArray(res.data) && res.data.length) this.models = res.data 
        }
      }).catch(err=>{
        this.msgDialog(err)
      })
    },
    //获取短信模板
    getSmsList(){
      commonRequest({
        $url: 'getSmsTemplateListByAccident'
      }).then(res => {
        if(res.code) this.msgDialog(res.message)
        else{
          if(Array.isArray(res.data) && res.data.length) this.smsList = res.data 
        }
      }).catch(err=>{
        this.msgDialog(err)
      })
    },
    //获取在线助手列表
    getMediatorList(){
      commonRequest({
        $url: 'getValidMediatorList'
      }).then(res => {
        if(res.code) this.msgDialog(res.message)
        else{
          if(Array.isArray(res.data) && res.data.length) this.mediatorList = res.data 
        }
      }).catch(err=>{
        this.msgDialog(err)
      })
    },
    // 新增
    getList() {
      const cmsUserId = getRealCookie('id')
      if(!cmsUserId){
        this.msgDialog('当前用户ID缺失')
        return
      }
      this.listLoading = true
      this.sendPostData = {
        $url: 'getAccidentList',
        sortField: this.sortField,
        sortValue: this.sortValue,
        skip: this.resetSkip ? 0 : (this.currentPage-1)*this.limit,
        keyword: this.searchKeyword,
        mobile: this.searchMobile,
        license: this.searchLicense,
        accidentTime: this.accident_time,
        limit: this.limit,
        cmsUserId: cmsUserId
      }
      
      this.currentPage = this.resetSkip ? 1 : this.currentPage
      this.resetSkip = false

      /* let commonRequestArr = []
      commonRequestArr.push(
        commonRequest(this.sendPostData),
        commonRequest({$url: 'getModelsData'}),
        commonRequest({$url: 'getSmsTemplateListByAccident'}),
        commonRequest({$url: 'getValidMediatorList'})
      )

      Promise.all(commonRequestArr).then(res=>{
        this.listLoading = false
        //第一个
        if(res[0]){
          let retData = res[0]['data'] ? res[0]['data'] : null
          if(!res[0].code){
            this.list = retData['codeList']
            this.total = retData['total']
          }else{
            //弹出错误消息
            this.list = null
            this.total = 0
            this.msgDialog(res[0].message)
          }
        }

        //第二个
        if(res[1]){
          if(res[1].code) this.msgDialog(res[1].message)
          else{
            if(res[1].data) this.models = [{_id:'',name:'请选择车型'}, ...res[1].data]
          } 
        }

        //第三个
        if(res[2]){
          if(res[2].code) this.msgDialog(res[2].message)
          else{
            if(res[2].data) this.smsList = res[2].data 
          }
        }

        //第四个
        if(res[3]){
          if(res[3].code) this.msgDialog(res[3].message)
          else{
            if(res[3].data) this.mediatorList = res[3].data 
          }
        }
      }).catch(err=>{
        this.listLoading = false
        this.msgDialog(err)
      }) */
      commonRequest(this.sendPostData).then(res=>{
        let retData = res['data'] ? res['data'] : null
        this.listLoading = false
        if(!res.code){
          this.list = retData['codeList']
          this.total = retData['total']
          this.config = retData['config']
          this.isMultiDel = retData['isMultiBtn']
          if(retData['isLiveOver'] === false){
            //请求关闭直播统计
            this.handleLeaveRoom()
          }
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
    numEdit(index){
      return (this.currentPage-1)*this.limit + index + 1
    },
    //消息弹框
    msgDialog(msg, type = 'error'){
      this.$message({
        message: msg || '未知错误',
        type: type,
        duration: 5 * 1000 //弹出框持续时间5s
      })
    },
    //页面的数据改动
    handlePageChange(val){
      this.currentPage = val
      this.getList()
    },
    //计时器
    countDownEvent(timer){
      if(timer){
        this.time = timer
        this.countDown = setInterval(()=>{
          if(this.time <= 0){
            clearInterval(this.countDown)
          }else{
            this.time -= 1
            saveToLocal('time', this.time)
          }
        }, 1000)
      }
    },
    //提交表单
    submitForm(formName){
      this.$refs[formName].validate(async (valid)=>{
        if(valid){
          //验证无误后往后台发送数据
          switch(formName){
            case 'accident':
              //创建或更改事务
              for(let unit in this.accident.accident_memberInfo){
                if(this.accident.accident_memberInfo[unit]['member_type']){
                  this.accident.accident_memberInfo[unit]['position'] = this.positionList 
                  && this.positionList[this.accident.accident_memberInfo[unit]['member_type']]
                  || this.accident.accident_memberInfo[unit]['position']
                  || 0
                }else{
                  this.accident.accident_memberInfo[unit]['position'] = this.accident.accident_memberInfo[unit]['position'] || 0
                }
              }
              const cmsUserId = getRealCookie('id')
              if(!cmsUserId){
                this.msgDialog('当前用户ID缺失')
                return
              }
              this.sendPostData = {
                $url: "editAccidentList",
                accidentName: this.accident.accident_name,
                accidentIntro: this.accident.accident_intro,
                accidentDate: this.accident.accident_date,
                accidentMemberInfo: this.accident.accident_memberInfo,
                accidentMediate: this.accident.accident_mediate,
                accidentMediator: this.accident_mediator, //在线助手
                accidentTime: this.accident_time, //搜索选项
                keyword: this.searchKeyword,  //关键词搜索
                mobile: this.searchMobile,
                license: this.searchLicense,
                limit: this.limit,
                skip: (this.currentPage-1) * this.limit,
                sortField: this.sortField,
                sortValue: this.sortValue,
                usedApplyId: this.usedApplyId.length ? this.usedApplyId : null,
                cmsUserId: cmsUserId
              }
              break;
            case 'shortMessage':
              //发送短信
              this.sendPostData = {
                $url: "sendShortMessageDoubleMethod",
                recipient: this.checkedRecipient,
                content: this.shortMessage.content,
                template: this.shortMessage.template,
                id: this.selectEle && this.selectEle[0],  //事务的ID，数组类型，只获取第一个
                type: this.smsType //模板类型
              }
              break;
          }

          //查看是否选择了收信人
          if(formName == 'shortMessage' && !this.checkedRecipient.length){
            this.msgDialog("请选择收件人")
            return
          }

          //添加在线助手上传
          if(formName == 'accident' && !this.accident_mediator.length){
            this.msgDialog("请选择在线助手")
            return
          }

          //上传文件
          if(formName == 'uploadDoc'){
            if(!this.fileList.length && !this.fileListPic.length){
              this.msgDialog('请选择上传文档')  //或公章
              return
            }

            const fileDoc = this.fileList && this.fileList[0] || null
            const officePic = this.fileListPic && this.fileListPic[0] || null
            let docPath, officePath, result1, result2;

            this.buttonLoading = true
            if(fileDoc){
              const docSuffix = fileDoc.name.substr(fileDoc.name.lastIndexOf('.'))
              docPath = `document/`+getRefDate('ymd', 0, '')+'/'+getRandCode()+docSuffix
              result1 = await commonCloudFileUpload(docPath, fileDoc.raw)
              if(result1.fileID) result1 = result1.fileID
              else{
                this.buttonLoading = false
                this.msgDialog("文件"+fileDoc.name+"上传失败："+result1.errMsg)
                return
              }
            }

            if(officePic){
              const picSuffix = officePic.name.substr(officePic.name.lastIndexOf('.'))
              officePath = `office/`+getRefDate('ymd', 0, '')+'/'+getRandCode()+picSuffix
              result2 = await commonCloudFileUpload(officePath, officePic.raw)
              if(result2.fileID) result2 = result2.fileID
              else{
                this.buttonLoading = false
                this.msgDialog("文件"+officePic.name+"上传失败："+result2.errMsg)
                return
              }
            }

            let send = {
              $url: "storeDocument",
              id: this.selectEle && this.selectEle[0]
            }

            if(result1) send['result1'] = result1
            if(result2) send['result2'] = result2
            
            commonRequest(send).then(result=>{
              this.buttonLoading = false
              if(!result.code){
                if(result.data){
                  this.addDescTxt(this.selectEle[0], result.data.text, '<br>（已签发）', result.data.cloudUrl)
                }
                this.dialogFormVisible = false
                this.msgDialog(result.message, 'success')
              }else this.msgDialog(result.message)
            }).catch(err=>{
              this.buttonLoading = false
              this.msgDialog(err)
            })

            return  
          }

          //上传事务图片
          if(formName == "accidentDetail"){
            this.buttonLoading = true
            let path = `accident_detail/`+getRefDate('ymd', 0, '')+`/`
            for(let unit in this.accidentDetail.list){
              let picList = this.accidentDetail.list[unit]['picList']
              for(let unit2 in picList){
                if(picList[unit2].url && picList[unit2].url.indexOf("blob") >= 0){
                  let filename = picList[unit2].name,result;

                  filename = new Date().getTime()+'_'+Math.ceil(Math.random()*1000000)+filename.substr(filename.lastIndexOf('.'))
                  result = await commonCloudFileUpload(path+filename, picList[unit2].raw)
                  if(result.fileID){
                    //云文件ID
                    this.accidentDetail.list[unit]['picList'][unit2].cloudFileID = result.fileID
                    //删除原文件二进制
                    delete this.accidentDetail.list[unit]['picList'][unit2].raw
                  }else this.msgDialog("文件"+picList[unit2].name+"上传失败 "+result.errMsg)
                }
              }
            }

            //上传事务附件
            commonRequest({
              $url: "uploadAccidentDetail",
              list: this.accidentDetail.list,
              username: this.$store.state.user.name,
              id: this.selectEle && this.selectEle[0]
            }).then(result=>{
              this.buttonLoading = false
              if(!result.code){
                this.dialogFormVisible = false
                this.msgDialog(result.message, 'success')
              }else this.msgDialog(result.message)
            }).catch(err=>{
              this.buttonLoading = false
              this.msgDialog(err)
            })
            
            return
          }
          
          //添加事务/编辑模式下
          if(this.currentID){
            this.sendPostData['id'] = this.currentID
          }
          this.buttonLoading = true //按钮加载
          
          //使用此必须删除根据ID排序的方案，否则就会错乱
          commonRequest(this.sendPostData).then(res=>{
            this.buttonLoading = false
            if(res){
              if(!res.code){
                this.msgDialog(res.message, 'success')
                if(res.data){
                  if(formName === 'shortMessage'){
                    this.addDescTxt(this.selectEle[0], res.data)  //求助状态
                  }else{
                    this.usedApplyId = [] //选择用户列表
                    this.applyList = [] //申请人列表
                    this.list = res.data
                    if(!this.currentIndex) this.total += 1 //新增数量+1
                  }
                }

                this.dialogFormVisible = false //关闭Dialog
                if(formName === 'shortMessage') this.countDownEvent(30)
              }
              else this.msgDialog(res.message)
            }
          }).catch(err=>{
            this.buttonLoading = false
            this.msgDialog(err)
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
      this.buttonLoading = false
      this.isNeeBackBtn = false //返回按钮不显示
      this.privateMember = null
      this.privateChatLoading = false
      this.startLoading = false
      this.joinRoomLoading = false
      this.shareLoading = false
      this.recordIndex = null
      this.recordName = ''
      this.selectEle = []
      this.usedApplyId = []
      this.smsUnit = -1
      this.qrcodeAddr = null
      this.currentFileAddr = null
      this.recordCloudAddr = null
      this.recordTime = null
      this.currentQrCodeIndex = null
      this.loadingState = false
      // this.selectRow = []
      this.$refs.multipleTable.clearSelection()
    },
    //点击编辑按钮处弹框
    handleUpdate(row, index) {
      //防止深度双向绑定
      this.status = 'form'
      if(row.accident_memberInfo_bak){
        row.accident_memberInfo = JSON.parse(JSON.stringify(row.accident_memberInfo_bak))
      }
      this.accident_mediator = row.accident_mediator ? row.accident_mediator : []
      //防止双向绑定
      this.accident = Object.assign({}, row) 
      this.currentID = row._id  //设置当前的ID
      this.currentIndex = index //设置当前的索引
      this.dialogFormVisible = true //打开Dialog
      this.$nextTick(() => {
        this.$refs['accident'].clearValidate() //清除校验规则，但不重置
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
      for(let index in selection){
        this.selectEle.push(selection[index]['_id'])
        if(index == 0){
          // this.selectRow = selection[index]['accident_memberInfo']
          this.shortMessage.recipient = selection[index]['accident_memberInfo']
        }
      }
    },
    //批量删除
    handleDelMutil(){
      const cmsUserId = getRealCookie('id')
      if(!cmsUserId){
        this.msgDialog('当前用户ID缺失')
        return
      }

      if(this.selectEle.length){
        this.confirmDialog('删除数据','您确定要删除这些数据吗？').then(()=>{
          this.sendPostData = {
            $url: "deleteAccidentMutil",
            delGroup: this.selectEle,
            limit: this.limit,
            skip: (this.currentPage-1) * this.limit,
            sortField: this.sortField,
            sortValue: this.sortValue,
            currDataLength: Array.isArray(this.list) ? this.list.length : 0,
            accidentTime: this.accident_time, //搜索选项
            keyword: this.searchKeyword, //搜索选项
            mobile: this.searchMobile,
            license: this.searchLicense,
            cmsUserId: cmsUserId
          }

          this.listLoading = true
          commonRequest(this.sendPostData).then(res=>{
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
    //对字段进行排序
    sortChange(data) {
      const {prop, order } = data
      this.sortField = prop
      this.sortValue = order == 'ascending' || !order ? 'asc' : 'desc'
      this.storeDataToLocal(this.limit, prop, order)
      this.handleFilter()
    },

    //本地储存数据localStroage
    storeDataToLocal(pageSize, defField, defValue){
      this.stayLocalAccident.Max = pageSize
      this.stayLocalAccident.SortField = defField
      this.stayLocalAccident.SortValue = defValue
      saveToLocal('stayLocalAccident', JSON.stringify(this.stayLocalAccident))
    },
    
    //重置表单
    resetTemp(formName) {
      if(formName == 'shortMessage'){
        this.shortMessage.content = "";
        this.shortMessage.template = "";
        this.checkedRecipient = []
      }else{
        // this.$refs[formName].resetFields();
        this.$refs[formName].clearValidate();
        this.accident = {
          accident_name: "",
          accident_intro: "",
          accident_date: "",
          accident_mediate: "",
          accident_memberInfo: [
            {
              name: '',
              mobile: '',
              code: '',
              cert: '',
              cert_no: '',
              car_master: '',
              models: '',
              license: '',
              member_type: '',
              position: 0
            }
        ]
        }
        this.accident_mediator = []
      }
    },
    //点击添加按钮处弹框
    handleCreate() {
        this.status = 'form'
        this.dialogFormVisible = true
        this.$nextTick(() => {
            this.resetTemp('accident')
        })
    },
    handleDelete(row, index) {
      const cmsUserId = getRealCookie('id')
      if(!cmsUserId){
        this.msgDialog('当前用户ID缺失')
        return
      }
      // 删除数据
      this.confirmDialog('删除数据', '您确定需要删除该条数据吗').then(() => {
        //点击确认按钮
        this.sendPostData = {
          $url: "deleteAccident",
          id: this.list[index]['_id'],
          limit: this.limit,
          skip: (this.currentPage-1) * this.limit,
          sortField: this.sortField,
          sortValue: this.sortValue,
          currDataLength: Array.isArray(this.list) ? this.list.length : 0,
          keyword: this.searchKeyword,  //搜索选项
          mobile: this.searchMobile,
          license: this.searchLicense,
          accidentTime: this.accident_time, //搜索选项
          cmsUserId: cmsUserId
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

    //添加号码
    handleAddMobile(){
      if(this.accident.accident_memberInfo.length >= 6){
        this.msgDialog('最多只能添加6个号码')
      }else{
        this.accident.accident_memberInfo.push({
          name: '',
          mobile: '',
          models: '',
          license: '',
          cert: '',
          cert_no: '',
          car_master: '',
          member_type: '',
          position: 0
        })
      }
    },

    //删除号码
    handleRemoveMobile(index, id = null){
      const accidentTitle = this.accident.accident_memberInfo[index].name || ''
      if(index) this.accident.accident_memberInfo.splice(index, 1)
      else{
        this.accident.accident_memberInfo = [
          {
              name: '',
              mobile: '',
              code: '',
              cert: '',
              cert_no: '',
              car_master: '',
              models: '',
              license: '',
              member_type: '',
              position: 0
          }
        ]
      }

      if(id && this.usedApplyId.indexOf(id) >= 0){
        this.usedApplyId.splice(this.usedApplyId.indexOf(id), 1)
      }

      let isReplaceTitle = true
      for(let unit in this.accident.accident_memberInfo){
        if(this.accident.accident_memberInfo[unit]['name'] === accidentTitle && this.accident.accident_memberInfo[unit]['disabled']){
          isReplaceTitle = false
          break
        }
      }

      if(isReplaceTitle) this.accident.accident_name = this.accident.accident_name.replace(new RegExp(accidentTitle, 'g'), '')
    },

    //格式化日期
    dateFormat(date){
      if(Array.isArray(date) && date.length == 2){
        return getRefDate('ymdHi', new Date(date[0]).getTime())+' 至 '+getRefDate('ymdHi', new Date(date[1]).getTime())
      }

      return getRefDate('ymdHi')+' 至 '+getRefDate('ymdHi')
    },

    //上传文档
    handleUploadDoc(){
        if(!this.selectEle.length){
            this.msgDialog('请勾选一项上传文档')
            return
        }

        if(this.selectEle.length > 1){
            this.msgDialog('只能勾选一项上传文档')
            return
        }
        this.fileList = []  //重置文件列表
        this.fileListPic = [] //重置公章列表
        this.status = 'upload'
        this.dialogFormVisible = true
    },

    //文档上传成功
    handleChange(file, fileList){
      try{
        //检查文件的类型和大小
        if(file.size > 1024 * 1024 * 5){
          this.msgDialog('上传的文件大小超过5M，请重新选择')
          this.clearErrorFileInfo(file, fileList)
          return
        }

        const type = file.raw.type
        if(this.fileType.indexOf(type) < 0){
          this.msgDialog('文件类型非word文档或者pdf文档，请重新选择')
          this.clearErrorFileInfo(file, fileList)
          return
        }
        
        this.fileList = [file]
      }catch(err){

      }
    },

    //删除上传的文件
    handleRemove(file, fileList){
      this.fileList = []
    },

    //图片文档上传成功
    handleChangePic(file, fileList, index = 0){
      const type = file.raw.type
      if(this.imgFileType.indexOf(type) < 0){
        this.clearErrorImageInfo(file, index)
        return
      }
      
      this.accidentDetail.list[index].picList.push(file)
    },

    //图片上传成功
    handleChangeOffical(file, fileList){
      const type = file.raw.type
      if(this.imgFileType.indexOf(type) < 0){
          this.msgDialog('文件类型为非图片类型，请重新选择')
          this.clearErrorFileInfo(file, fileList, true)
          return
      }

      //检查文件的类型和大小
      if(file.size > 1024 * 1024 * 5){
          this.msgDialog('上传的文件大小超过5M，请重新选择')
          this.clearErrorFileInfo(file, fileList, true)
          return
      }
      
      this.fileListPic = [file]
    },

    //点击查看图片详情
    handleImageShow(index){
      const picList = this.accidentDetail.list[index].picList
      let srcList = []
      for(let unit in picList) srcList.push(picList[unit].url)
      this.srcList = srcList
    },

    //图片文档删除
    handleRemovePic(file, index = 0){
      this.$nextTick(()=>{
        let uFiles = this.$refs[`elUpload_${index}`][0].uploadFiles,
            picList = this.accidentDetail.list[index].picList;
        
        for(let unit in picList){
          if(file.uid == picList[unit]['uid']){
            picList.splice(unit, 1)
            uFiles.splice(unit, 1)
            this.srcList.splice(unit, 1)
            break
          }
        }

        if(!this.srcList.length) this.srcList = [""]
        this.accidentDetail.list[index].picList = picList
      })
    },

    //单张图片删除
    handleRemovePicSingle(){
      let uFiles = this.$refs[`picUpload`].uploadFiles
      uFiles.splice(0, 1)
      this.fileListPic = []
    },

    //图片超过最大限制
    handleExceed(){
      this.msgDialog('图片数量不能超过'+this.config+'张')
    },

    //公章最大限制
    handleOffical(){
      this.msgDialog('图片数量不能超过1张')
    },

    //清除添加的文件信息
    clearErrorFileInfo(file, fileList, isUnit = false){
      for(let unit in fileList){
        if(fileList[unit]['uid'] == file.uid){
          fileList.splice(unit, 1)
          break
        }
      }

      if(!isUnit) this.fileList = fileList
      else this.fileListPic = fileList
    },

    //清除添加的非文件信息
    clearErrorImageInfo(file, index){
      const uFiles = this.$refs[`elUpload_${index}`][0].uploadFiles
      for(let unit in uFiles){
        if(file.uid == uFiles[unit].uid){
          uFiles.splice(unit, 1)
        }
      }
    },

    //发送短信
    handleSendMsg(){
        if(!this.selectEle.length){
            this.msgDialog('请勾选一项发送短信')
            return
        }

        if(this.selectEle.length > 1){
            this.msgDialog('只能勾选一项发送短信')
            return
        }

        this.status = 'message'
        this.dialogFormVisible = true

        //this.shortMessage.recipient = this.selectRow  //获取要发送的人的手机号和姓名
        this.shortMessage.content = ""  //将内容置空
        this.shortMessage.template = ""
        this.checkedRecipient = []  //将复选框的所选项置空
    },

    //发送短信的复选框的选中
    handleCheckedCitiesChange(val){
      this.checkedRecipient = val
    },

    //在线助手勾选
    handleMediator(val){
      //复选框不能放在 对象里？
      this.accident_mediator = val
    },

    //查看短信
    handleViewMsg(){
      if(!this.selectEle.length){
        this.msgDialog('请勾选一项查看短信')
        return
      }

      if(this.selectEle.length > 1){
        this.msgDialog('只能勾选一项查看短信')
        return
      }

      this.shortMessageView = null
      this.status = 'view'
      this.dialogFormVisible = true
      this.fullscreenLoading = true //table loading v-loading 指令

      commonRequest({
        $url: 'getRefShortMessage',
        id: this.selectEle && this.selectEle[0]
      }).then(res=>{
        this.fullscreenLoading = false
        if(res){
          if(!res.code){
            this.shortMessageView = res.data
          }else{
            if(res.message != 'NoData') this.msgDialog(res.message)
          }
        }
      }).catch(err=>{
        this.fullscreenLoading = false
        this.msgDialog(err)
      })
    },

    //查看签名
    handleViewSign(){
      if(!this.selectEle.length){
        this.msgDialog('请勾选一项查看签名')
        return
      }

      if(this.selectEle.length > 1){
        this.msgDialog('只能勾选一项查看签名')
        return
      }

      this.status = 'sign'
      
      this.signLoading = true //签名按钮加载
      commonRequest({
        $url: 'getViewSignature',
        id: this.selectEle && this.selectEle[0]
      }).then(res=>{
        this.signLoading = false
        if(res){
          if(!res.code){
            this.dialogFormVisible = true
            this.signList = res.data
          }else this.msgDialog(res.message)
        }
      }).catch(err=>{
        this.signLoading = false
        this.msgDialog(err)
      })
    },

    //下载文档
    handleDownloadDoc(){
      if(!this.selectEle.length){
        this.msgDialog('请勾选一项下载文档')
        return
      }

      if(this.selectEle.length > 1){
        this.msgDialog('只能勾选一项下载文档')
        return
      }

      this.documentDownloading = true
      commonRequest({
        $url: 'getOfficeDoc',
        id: this.selectEle && this.selectEle[0]
      }).then(res=>{
        if(res){
          if(!res.code){
            commonCloudFileDownload(res.data).then(result=>{
              this.documentDownloading = false
              this.selectEle = []
              this.$refs.multipleTable.clearSelection();
            }).catch(err=>{
              this.documentDownloading = false
              this.msgDialog(err)
            })
          }else{
            this.documentDownloading = false
            this.msgDialog(res.message)
          }
        }else this.documentDownloading = false
      }).catch(err=>{
        this.documentDownloading = false
        this.msgDialog(err)
      })
    },

    //下载二维码
    handleDownloadQRCode(){
      if(!this.selectEle.length){
        this.msgDialog('请勾选一项下载二维码')
        return
      }

      if(this.selectEle.length > 1){
        this.msgDialog('只能勾选一项下载二维码')
        return
      }

      //下载二维码
      this.QRcodeLoading = true
      commonRequest({
        $url: 'getQRcode',
        id: this.selectEle && this.selectEle[0]
      }).then(res=>{
        if(res){
          if(!res.code){
            commonCloudFileDownload(res.data).then(result=>{
              this.selectEle = []
              this.$refs.multipleTable.clearSelection();
              this.QRcodeLoading = false
            }).catch(err=>{
              this.QRcodeLoading = false
              this.msgDialog(err)
            })
          }else{
            this.QRcodeLoading = false
            this.msgDialog(res.message)
          }
        }else this.QRcodeLoading = false
      }).catch(err=>{
        this.QRcodeLoading = false
        this.msgDialog(err)
      })
    },

    //下载签名
    handleDownloadSignature(cloudFileId){
      if(cloudFileId){
        commonCloudFileDownload(cloudFileId).then(result=>{

        }).catch(err=>{
          this.msgDialog(err)
        })
      }else{
        this.msgDialog('云文件ID为空')
      }
    },

    //添加/编辑 事务附件
    handleAddEditDetail(){
      if(!this.selectEle.length){
        this.msgDialog('请勾选一项添加/编辑事务附件')
        return
      }

      if(this.selectEle.length > 1){
        this.msgDialog('只能勾选一项添加/编辑事务附件')
        return
      }

      this.status = 'detail'
      this.detailLoading = true

      commonRequest({
        $url: 'getAccidentDetail',
        id: this.selectEle && this.selectEle[0]
      }).then(res=>{
        this.detailLoading = false
        if(res.code) this.msgDialog(res.message)
        else{
          this.dialogFormVisible = true
          if(res.data) this.accidentDetail.list = res.data
          else{
            this.accidentDetail.list = [
              {
                intro: "",
                picList: [],
                _openid: "",
                identity: "",
                name: ""
              }
            ]
          }
        }
      }).catch(err=>{
        this.detailLoading = false
        this.msgDialog(err)
      })
    },

    //添加事务附件
    handleAddDetail(){
      if(this.accidentDetail.list.length >= this.config){
        this.msgDialog('最多只能添加'+this.config+'组事务附件')
      }else{
        this.accidentDetail.list.push({
          intro: "",
          picList: [],
          _openid: "",
          identity: "",
          name: ""
        })
      }
    },

    //删除事务附件
    handleRemoveAccidentDetail(index){
      this.accidentDetail.list.splice(index, 1)
    },

    //导出
    handleExport(){
      const cmsUserId = getRealCookie('id')
      if(!cmsUserId){
        this.msgDialog('当前用户ID缺失')
        return
      }
      //数据导出
      this.sendPostData = {
          $url: "accidentExport",
          sortField: this.sortField,
          sortValue: this.sortValue,
          keyword: this.searchKeyword,
          mobile: this.searchMobile,
          license: this.searchLicense,
          accidentTime: this.accident_time, //搜索选项
          cmsUserId: cmsUserId
      }

      this.exportLoading = true
      commonRequest(this.sendPostData).then(res=>{
        if(!res.code){
          import('@/vendor/Export2Excel').then(excel => {
            let tHeader, filterVal;
            if(this.isMultiDel){
              tHeader = ['编号', '事务名称', '事务介绍', '创建发生时间', '事务用户', '在线助手', '在线时间', '求助状态','创建者']
              filterVal = ['No', 'accident_name', 'accident_intro', 'accident_date', 'accident_memberInfo', 'accident_mediator', 'accident_mediate', 'accident_state','uname']  //过滤的字段
            }else{
              tHeader = ['编号', '事务名称', '事务介绍', '创建发生时间', '事务用户', '在线助手', '在线时间', '求助状态']
              filterVal = ['No', 'accident_name', 'accident_intro', 'accident_date', 'accident_memberInfo', 'accident_mediator', 'accident_mediate', 'accident_state']  //过滤的字段
            }
            
            const data = this.formatJson(res.data, filterVal)

            excel.export_json_to_excel({
              header: tHeader,
              data,
              filename: '事务列表-'+getRefDate('ymd', 0, '')
            })
            this.exportLoading = false
          })
        }else{
          this.msgDialog(res.message)
          this.exportLoading = false
        }
      }).catch(err=>{
        this.msgDialog(err)
        this.exportLoading = false
      })
    },

    //字段过滤（返回二维数组，非数组对象）
    formatJson(data, filterVal) {
      return data.map((v,i) => filterVal.map(j => {
        if (j === 'accident_memberInfo') {
          let tempData = ""
          for(let unit in v[j]){
            // "\n"+"车型："+(v[j][unit]['models']?v[j][unit]['models']:'')+"\n"+"车牌号："+(v[j][unit]['license'] ? v[j][unit]['license'] : '')+"\n"+"车主："+(v[j][unit]['car_master'] ? v[j][unit]['car_master']:'')+
            tempData += "姓名："+v[j][unit]['name']+"\n"+"联系电话："+v[j][unit]['mobile']+"\n"+"身份验证码："+v[j][unit]['code']+"\n"+"证件类型："+(v[j][unit]['cert'] ? v[j][unit]['cert']:'')+"\n"+"证件号码："+(v[j][unit]['cert_no'] ? v[j][unit]['cert_no']:'')+"\n"+"人员类别："+(v[j][unit]['member_type'] ? v[j][unit]['member_type']:'')+"\n"
          }
          tempData = tempData.substr(0, tempData.length-1)  //去除最后的 \n
          return tempData
        } else if(j === 'No') {
          return i+1
        }else if(j == 'accident_mediate'){
          let tempTime = ""
          for(let unit in v[j]){
            tempTime += getRefDate('ymdHi', new Date(v[j][unit]).getTime())+' 至 '
          }
          tempTime = tempTime.substr(0, tempTime.length-3)  //去除最后的 \n
          return tempTime
        }else{
          return v[j]
        }
      }))
    },

    //查看二维码
    handleViewQRcode(row, index){
      //显示二维码的图片
      this.listLoading = true
      commonRequest({
        $url: 'viewQRCode',
        id: row['_id']
      }).then(res=>{
        this.listLoading = false
        if(res.code){
          this.msgDialog(res.message)
        }else{
          this.status = 'viewQRCode'
          this.dialogFormVisible = true
          this.viewQRCode = res.data
        }
      }).catch(err=>{
        console.log(err)
        this.listLoading = false
        this.msgDialog(err)
      })
    },

    //音视频聊天
    handleChat(row, index){
      //有当前正在直播【备用，以防万一】
      if(getFromLocal('roomIds') && getFromLocal('roomIds') !== row['_id']){
        let roomName = ''
        for(const u of this.list){
          if(u === getFromLocal('roomIds')){
            roomName = u['accident_name']
            break;
          }
        }
        if(!roomName){
          this.msgDialog(`事务名称丢失`)
          return
        }
        this.msgDialog(`事务“${roomName}”正在直播，请先关闭该直播后重试`)
        return
      }
      this.status = 'live'
      this.dialogFormVisible = true
      this.currentID = row['_id']
      this.currentIndex = index
    },

    //屏幕分享
    handleSharedScreen(roomId = null, isPrivate = false, detail = null, flag = null){
      //首先获取token
      if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }
      // console.log(this.$store.state.user.name)
      const cmsUserId = getToken()
      if(!cmsUserId){
        this.msgDialog('后台用户ID获取失败，请重新登录后台')
        return
      }

      if(!isPrivate){
        //公聊
        this.joinRoomState = true;     //公聊按钮禁止
        this.privateRoomState = true;  //私聊按钮禁止
        this.shareLoading = true;  //分享loading...
      }else{
        //私聊
        // this.joinRoomState = true
      }

      this.sendPostData = {
        $url: 'getRealTokenByWeb',
        id: this.currentID,
        cmsUserId
      }

      if(roomId) this.sendPostData['roomId'] = roomId
      if(isPrivate) this.sendPostData['isPrivate'] = true
      if(flag) this.sendPostData['flag'] = 'reset_token'
      if(detail){
        if(detail.openid) delete detail.openid
        this.sendPostData['detail'] = detail
      }
      
      commonRequest(this.sendPostData).then(async result=>{
        if(result.code){
          this.shareFail(result.message)
        }else{
          if(result.data){
            commonRequest({
                $url: 'recordAccident',
                id: this.currentID,
                beginLive: false,
                cmsuserid: getRealCookie('id')
            }).then(async res=>{
              if(res.code){
                this.shareFail(res.message)
              }else{
                try{
                  const {token, roomId, appid} = result.data
                  let userId = result.data.userId
                  this.client =  ArRTC.createClient({ mode: "rtc", codec: "h264" });
                  this.client.on("user-published", this.handleUserPublished);
                  this.client.on("user-unpublished", this.handleUserUnpublished);
                  this.roomIdAndUserId = {userId, roomId};
                  // console.log(token)
                  [ userId, this.localTracks.videoTrack,this.localTracks.audioTrack ] = await Promise.all([
                    // join the channel
                    this.client.join(appid, roomId, token || null, userId),
                    // ** create local tracks, using microphone and screen
                    ArRTC.createScreenVideoTrack(),
                    ArRTC.createMicrophoneAudioTrack()
                  ]);
                  // this.localTracks.audioTrack = await ArRTC.createMicrophoneAudioTrack();
                  // play local video track
                  this.localTracks.videoTrack.play("local-player");
                  // publish local tracks to channel
                  await this.client.publish(Object.values(this.localTracks));
                  this.recordLocalRoomName();
                  this.shareLoading = false;  //分享loading消失
                  this.shareState = true;   //分享state显示
                  this.isDanmuBreak = true  //进入房间，准备开始连接弹幕
                  this.linkRealTimeDB(roomId) //连接数据库
                  if(isPrivate){
                    this.privateChatLoading = false
                    this.privateRoomState = true
                  }
                  // 开启直播
                  this.statisticalTime()
                  // 开启直播
                }catch(e){
                  this.shareFail(null)
                  if(e && e.message && (e.message.indexOf('TOKEN_INVALID') >= 0 || e.message.indexOf('TOKEN_EXPIRED') >= 0)){
                    this.handleSharedScreen(null, false, null, true)
                  }else this.msgDialog(e)
                }
              }
            }).catch(error=>{
              this.shareFail(error)
            })
          }else{
            this.shareFail("数据缺失")
          }
        }
      }).catch(err=>{
        this.shareFail(err)
      })
    },

    // 统计时间
    statisticalTime(){
      commonRequest({
          $url: 'recordAccident',
          id: this.currentID,
          beginLive: true,
          cmsuserid: getRealCookie('id')
      }).then(async res=>{
        if(res.code){
          // this.shareFail(res.message)
          // 如果失败则每隔 6s 重新执行一次
          setTimeout(()=>{this.statisticalTime()}, 6000)
        }
      }).catch(error=>{
        // this.shareFail(error)
        // 如果失败则每隔 6s 重新执行一次
        setTimeout(()=>{this.statisticalTime()}, 6000)
      })
    },

    recordLocalRoomName(){
      // 记录房间的名称
      if(Array.isArray(this.list)){
        const listCopy = this.list.slice()
        for(const u in listCopy){
          if(listCopy[u]['_id'] === this.currentID){
            saveToLocal('roomIds', listCopy[u]['_id'])
            this.pageDisabled = true
            listCopy[u].disabled = false
          }else{
            listCopy[u].disabled = true
          }
        }

        this.list = listCopy
      }
    },

    joinRoomFail(isPrivate, message){
      this.shareState = false  //不允许分享屏幕
      if(!isPrivate){
        this.joinRoomLoading = false
        this.privateRoomState = false  //不允许私聊
      }else{
        this.privateChatLoading = false
        this.joinRoomState = false //不允许公聊
      }
      if(message) this.msgDialog(message)
    },

    shareFail(message){
      this.privateChatLoading = false
      this.joinRoomState = false;
      this.privateRoomState = false;
      this.shareLoading = false;
      if(message) this.msgDialog(message)
    },

    //加入房间
    handleJoinRoom(roomId = null, isPrivate = false, detail = null, flag = null){
      //首先获取token
      if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }

      const cmsUserId = getToken()
      if(!cmsUserId){
        this.msgDialog('后台用户ID获取失败，请重新登录后台')
        return
      }

      this.sendPostData = {
        $url: 'getRealTokenByWeb',
        id: this.currentID,
        cmsUserId
      }

      if(roomId) this.sendPostData['roomId'] = roomId
      if(isPrivate) this.sendPostData['isPrivate'] = true
      if(flag) this.sendPostData['flag'] = 'reset_token'

      if(!isPrivate){
        //公聊
        this.joinRoomLoading = true
        this.privateRoomState = true  //不允许私聊
        this.shareState = true  //不允许分享屏幕
      }else{
        //私聊
        // this.joinRoomState = true
      }

      if(detail){
        if(detail.openid) delete detail.openid
        this.sendPostData['detail'] = detail
      }
      commonRequest(this.sendPostData).then(async result=>{
        if(result.code){
          this.joinRoomFail(isPrivate, result.message)
        }else{
          if(result.data){
            // 开启直播【第一次先判断各种条件，第二次再开启直播】
            commonRequest({
              $url: 'recordAccident',
              id: this.currentID,
              beginLive: false,
              cmsuserid: getRealCookie('id')
            }).then(async res=>{
              if(res.code){
                this.joinRoomFail(isPrivate, res.message)
              }else{
                try{
                  const {token, roomId, appid} = result.data
                  const role = 'host'
                  let userId = result.data.userId
                  this.client = ArRTC.createClient({ mode: "live", codec: "h264", role: role });
                  this.client.on("user-published", this.handleUserPublished);
                  this.client.on("user-unpublished", this.handleUserUnpublished);
                  this.roomIdAndUserId = {userId, roomId};
                  userId = await this.client.join(appid, roomId, token || null, userId);
                  this.localTracks.audioTrack = await ArRTC.createMicrophoneAudioTrack();
                  this.localTracks.videoTrack = await ArRTC.createCameraVideoTrack();
                  // play local video track
                  this.localTracks.videoTrack.play("local-player");
                  await this.client.publish(Object.values(this.localTracks));
                  this.recordLocalRoomName();
                  if(!isPrivate){
                    this.joinRoomLoading = false
                    this.joinRoomState = true
                  }else{
                    this.privateChatLoading = false
                    this.privateRoomState = true
                  }
                  this.isDanmuBreak = true  //进入房间，准备开始连接弹幕
                  this.linkRealTimeDB(roomId) //连接数据库
                  this.statisticalTime()  //开启直播
                }catch(e){
                  this.joinRoomFail(isPrivate, null)
                  if(e && e.message && (e.message.indexOf('TOKEN_INVALID') >= 0 || e.message.indexOf('TOKEN_EXPIRED') >= 0)){
                    this.handleJoinRoom(null, false, null, true)
                  }else this.msgDialog(e)
                }
              }
            }).catch(error=>{
              //失败
              this.joinRoomFail(isPrivate, error)
            })
          }else{
            this.joinRoomFail(isPrivate, '数据缺失')
          }
        }
      }).catch(err=>{
        this.joinRoomFail(isPrivate, err)
      })
      
    },

    //退出房间
    async handleLeaveRoom(){
      /* if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      } */

      this.leaveLoading = true
      commonRequest({
        $url: 'closeAccident',
        // id: this.currentID,
        cmsuserid: getRealCookie('id')
      }).then(async res=>{
        this.leaveLoading = false
        if(res.code){
          this.msgDialog(res.message)
        }else{
          for (const trackName in this.localTracks) {
            var track = this.localTracks[trackName];
            if(track) {
              track.stop();
              track.close();
              this.localTracks[trackName] = undefined;
              this.isDanmuBreak = false;  //关闭弹幕
              this.roomIdAndUserId = null;  //房间号和用户ID置空
              // 关闭websocket
              if(this.danmu){
                this.danmu.close();
                this.danmu = null;
              }
              // 清除定时器
              if(this.timeMachine){
                  clearTimeout(this.timeMachine);
                  this.timeMachine = null;
              }
              this.danmuList = [] //清空弹幕列表
            }
          }
          this.handleEndRecord(false);  //录制结束
          // remove remote users and player views
          $('#remote-playerlist, #local-player').empty();
          this.remoteUsers = {};
          if(this.client) await this.client.leave();
          deleteLocal('roomIds');  //清除本地缓存
          const listCopy = this.list.slice()
          for(const u in listCopy){
            listCopy[u].disabled = false
            // 当前事务直播时长
            if(res.data && listCopy[u]['_id'] === res.data.id && res.data.usage){
              listCopy[u]['usage'] = this.list[u]['usage'] ? (Number(res.data.usage)+Number(this.list[u]['usage'])): Number(res.data.usage)
            }
          }
          this.list = listCopy
          this.joinRoomState = false
          this.privateRoomState = false
          this.shareState = false
          this.privateChatLoading = false
          this.pageDisabled = false
        }
      }).catch(err=>{
        this.leaveLoading = false
        this.msgDialog(err)
      })
    },

    handleUserPublished(user, mediaType) {
      const id = user.uid;
      this.remoteUsers[id] = user;
      this.subscribe(user, mediaType);
    },

    handleUserUnpublished(user) {
      const id = user.uid;
      delete this.remoteUsers[id];
      $(`#player-wrapper-${id}`).remove();
      /* if(user['_audio_muted_'] === true && user['_video_muted_'] === false){
        //麦克风关闭不用关闭画面，摄像头需要
      }else $(`#player-wrapper-${id}`).remove(); */
    },

    async subscribe(user, mediaType){
      const uid = user.uid;
      // subscribe to a remote user
      await this.client.subscribe(user, mediaType);
      // <p class="player-name">remoteUser(${uid})</p>
      if (mediaType === 'video') {
        if($(`#player-wrapper-${uid}`).length){
          $(`#player-wrapper-${uid}`).remove();
        }
        const player = $(`
          <div id="player-wrapper-${uid}">
            <div id="player-${uid}" class="player" style="width:500px;height:500px;margin-top:14px;margin-left:5px;margin-right:5px;"></div>
          </div>
        `);
        $("#remote-playerlist").append(player);
        // console.log(JSON.stringify(user));
        user.videoTrack.play(`player-${uid}`);
      }
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    },

    //查看文档
    handleViewDoc(row, index){
      if(row['offical_doc']){
        this._id = null
        this.codes = null
        this.isShowUserDocList = true
        this.userTitle = `上传文档`
        this.docList = [{name: '上传文档', cloudUrl: row['offical_doc']}]
      }else{
        this.msgDialog('当前文档不存在')
      }
    },

    //完成事务
    handleOverMediator(){
      if(!this.selectEle.length){
        this.msgDialog('请勾选一项完成事务')
        return
      }

      if(this.selectEle.length > 1){
        this.msgDialog('只能勾选一项完成事务')
        return
      }

      this.confirmDialog('完成事务', '您确定该事务求助已完成？（完成后不可编辑）').then(() => {
        this.overLoading = true
        commonRequest({
          $url: 'mediatorDone',
          id: this.selectEle && this.selectEle[0]
        }).then(res=>{
          this.overLoading = false
          if(!res.code){
            const selectEle = this.selectEle[0]
            this.msgDialog(res.message, 'success')
            this.list.map(item=>{
              if(item._id == selectEle){
                item.accident_isComplete = true
                item.accident_state = '已完成'+item.accident_state.substr(3)
              }
              return item
            })
            this.selectEle = []
            this.$refs.multipleTable.clearSelection();
          }else this.msgDialog(res.message)
        }).catch(err=>{
          this.overLoading = false
          this.msgDialog(err)
        })
      })
    },

    //签发
    handleIssue(){
      if(!this.selectEle.length){
        this.msgDialog('请勾选一项签发')
        return
      }

      if(this.selectEle.length > 1){
        this.msgDialog('只能勾选一项签发')
        return
      }

      this.confirmDialog('签发', '是否生成正式求助文档？').then(() => {
        this.issueLoading = true
        commonRequest({
          $url: 'issue',
          id: this.selectEle && this.selectEle[0]
        }).then(res=>{
          this.issueLoading = false
          
          if(!res.code){
            if(res.data) this.addDescTxt(this.selectEle[0], res.data.text, null, res.data.cloudUrl) //求助状态
            this.msgDialog(res.message, 'success')
            this.selectEle = []
            this.$refs.multipleTable.clearSelection();
          }else this.msgDialog(res.message)
        }).catch(err=>{
          this.issueLoading = false
          this.msgDialog(err)
        })
      })
    },

    //添加描述文本
    addDescTxt(id, data, filter = null, newDocumentAddr = null){
      this.list.map(item=>{
        if(item._id == id){
          if(filter){
            item.accident_state = item.accident_state.replace(new RegExp(filter, 'g'), '')
          }
          
          if(newDocumentAddr) item.offical_doc = newDocumentAddr
          if(typeof item.accident_state === 'string' && item.accident_state.indexOf(data) < 0){
            item.accident_state += data
          }
        }
        return item
      })
    },

    //查看用户上传材料
    handleViewUserDoc(doc, name, code, id){
      this.isShowUserDocList = true
      this.userTitle = `${name}上传的材料`
      this.docList = doc
      this.codes = code
      this._id = id
    },

    //查看用户材料详细信息
    handleViewDocDetail(row, index, dList = null){
      this.documentTempLoading = true
      // const fileCategory = typeof row === 'object' ? row['cloudUrl'] : row
      const picExt = ['jpg', 'jpeg', 'png', 'gif']
      let cUrl = row['cloudUrl']
      const tail = cUrl.indexOf('.') >= 0 && cUrl.substr(cUrl.lastIndexOf('.')+1) || ''
      if(picExt.indexOf(tail) >= 0){
        let pictureHub = []
        for(const unit in dList){
          const fileExt = dList[unit]['cloudUrl'].indexOf('.') >= 0 && dList[unit]['cloudUrl'].substr(dList[unit]['cloudUrl'].lastIndexOf('.')+1) || ''
          if(picExt.indexOf(fileExt) >= 0 && dList[unit]['cloudUrl'] !== cUrl){
            pictureHub.push(dList[unit]['cloudUrl'])
          }
        }
        pictureHub.unshift(cUrl)
        if(pictureHub.length > 1) cUrl = pictureHub
      }
      
      commonCloudFileTempFile(cUrl).then(res=>{
        this.documentPicture = null
        this.documentDocx = null
        this.documentXlsx = null
        this.documentPdf = null
        this.licensePicture = null
        const file = res.fileList && res.fileList[0] && res.fileList[0].tempFileURL || null
        let pictureGrpList = null
        if(Array.isArray(res.fileList) && res.fileList.length > 1){
          pictureGrpList = []
          for(const unit in res.fileList){
            const uPic = res.fileList[unit] && res.fileList[unit].tempFileURL || ''
            if(!uPic){
              this.msgDialog('文件'+cUrl[unit]+'不存在')
              return
            }
            pictureGrpList.push(uPic)
          }
        }
        if(file){
          const fileExt = file.indexOf('.') >= 0 && file.substr(file.lastIndexOf('.')+1) || ''
          this.userDocTitle = row['name']
          switch(fileExt.toLowerCase()){
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
              this.documentTempLoading = false
              this.documentPicture = pictureGrpList || [file]
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

    //选择短信模板
    handleSmsChk(evt){
      this.shortMessage.content = this.smsList[evt].content
      this.shortMessage.template = this.smsList[evt].template
      this.smsType = this.smsList[evt].type
    },

    //开启私聊
    handlePrivateChat(){
      if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }

      if(!this.privateMember){
        this.msgDialog('请选择用户')
        return
      }

      const cmsUserId = getToken()
      if(!cmsUserId){
        this.msgDialog('后台用户ID获取失败，请重新登录后台')
        return
      }
      // console.log(this.privateMember)
      const detail = {
        openid: this.privateMember.openid, 
        name: this.privateMember.name,
        member_type: this.privateMember.member_type,
      }

      this.privateChatLoading = true
      this.joinRoomState = true //不允许公聊
      this.shareState = true  //不允许分享屏幕
      commonRequest({
        $url: 'singleChat',
        id: this.currentID,
        detail: detail
      }).then(res=>{
        if(res.code){
          this.privateChatLoading = false
          this.joinRoomState = false
          this.shareState = false
          this.msgDialog(res.message)
        }else{
          //保存当时的ID
          commonRequest({
            $url: 'trtcAddRealTime',
            selectOpenid: detail.openid,
            // type: this.chatMode === '2' ? 'live':'video',
            type: 'video',
            id: this.currentID,
            name: detail.name,
            memberType: detail.member_type,
            mediatorName: cmsUserId,
            isWeb: true
          }).then(result=>{
            if(result.code){
              this.privateChatLoading = false
              this.joinRoomState = false
              this.shareState = false
              this.msgDialog(result.message)
            }else{
              //获取到了房间号
              const roomId = result.data
              if(this.chatMode === '2'){
                //带桌面分享的
                this.handleSharedScreen(roomId, true, detail)
              }else{
                // 带摄像头的
                this.handleJoinRoom(roomId, true, detail)
              }
            }
          }).catch(error=>{
            this.privateChatLoading = false
            this.joinRoomState = false
            this.shareState = false
            this.msgDialog(error)
          })
        }
      }).catch(err=>{
        this.privateChatLoading = false
        this.joinRoomState = false
        this.shareState = false
        this.msgDialog(err)
      })
    },

    //更新用户状态
    handleUpdateUserState(){
      if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }
      if(this.currentIndex === null){
        this.msgDialog('索引ID获取失败，请关闭重试')
        return
      }
      this.userStateLoading = true
      commonRequest({
        $url: 'updateUserState',
        id: this.currentID,
      }).then(res=>{
        this.userStateLoading = false
        if(res.code){
          this.msgDialog(res.message)
        }else{
          if(this.list && res.data){
            this.list[this.currentIndex]['accident_memberInfo_bak'] = null
            this.list[this.currentIndex]['accident_memberInfo_bak'] = res.data
            this.privateMember = null
          }else{
            this.msgDialog('用户状态更新失败')
          }
        }
      }).catch(err=>{
        this.userStateLoading = false
        this.msgDialog(err)
      })
    },

    //选择申请人
    handleSelectApply(){
      this.isShowUserDocList = true
      this.userTitle = `申请帮助`
      this.docList = []

      if(this.tempApplyList.length) this.applyList = this.tempApplyList
      
      if(!this.applyList.length){
        this.getApplyInfoList()
      }
    },

    //选择加入项
    handleJoinDetail(row, index){
      const mInfo = this.accident.accident_memberInfo
      const isNext = mInfo[0].name
      || mInfo[0].mobile || mInfo[0].models || mInfo[0].cert
      || mInfo[0].cert_no || mInfo[0].license || mInfo[0].code
      || mInfo[0].car_master || mInfo[0].member_type || mInfo[0].position
      || mInfo.length > 1

      //创建新的项
      let newItem = {
        _id: row._id,
        disabled: true,  //让在线助手无法去修改，只能修改人员选项
        name: row.username,
        mobile: row.mobile,
        cert_no: row.licenseNo, //证件号码
        license: row.licensePlate, //车牌号
        car_master: row.isOwner, //是否为车主
        member_type: '',  //人员类别
        models: row.carType,
        cert: row.license,
        position: 0,
        code: '',
        openid: row._openid
      }

      //查找车型
      /* if(this.models){
        for(let unit in this.models){
          if(this.models[unit]['name'] === row.carType){
            newItem['models'] = this.models[unit]['_id']
            break;
          }
        }

        if(!newItem['models']) newItem['models'] = ''
      } */

        //查找证件类型
      /* if(this.certList){
        for(let unit in this.certList){
          if(this.certList[unit]['name'] === row.license){
            newItem['cert'] = this.certList[unit]['_id']
            break;
          }
        }

        if(!newItem['cert']) newItem['cert'] = ''
      } */

      if(isNext){
        //车型和 models | carType ,  证件类型 cert | license
        // models  certList licensePlate
        this.accident.accident_memberInfo.push(newItem)
      }else{
        //在原有项上面创建
        this.accident.accident_memberInfo = [newItem]
      }

      //已添加使用的申请
      if(this.usedApplyId.indexOf(row['_id']) < 0){
        this.usedApplyId.push(row['_id']) 
      }

      if(this.accident.accident_name.indexOf(row.username) < 0){
        this.accident.accident_name += row.username
        let tempName = this.accident.accident_name
        tempName = tempName.match(/\(\d{2}\-\d{2}\-\d{2}\)/g, '')
        if(tempName){
          this.accident.accident_name = this.accident.accident_name.replace(/\(\d{2}\-\d{2}\-\d{2}\)/g, '')
          this.accident.accident_name += tempName[0]
        }
      }
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
          this.userDocTitle =  `${row.username}的${row.license}信息`
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
      // this.isShowUserDocList = true
      this.isNeeBackBtn = true
      this.docList = row.uploadFile
      this.userTitle = `${row.username}上传的材料`
      this.tempApplyList = this.applyList
      this.applyList = []
    },

    //获取申请人信息
    getApplyInfoList(){
      this.documentTempLoading = true
      commonRequest({
        $url: 'getApplyList'
      }).then(res=>{
        this.documentTempLoading = false
        
        if(!res.code){
          this.applyList = res.data
        }else this.msgDialog(res.message)
      }).catch(err=>{
        this.documentTempLoading = false
        this.msgDialog(err)
      })
    },

    //时间选择结束
    handleSelectOver(){
      let mediate = this.accident.accident_date
      
      this.accident.accident_name = this.accident.accident_name.replace(/\(\d{2}\-\d{2}\-\d{2}\)/g, '')
      if(mediate){
        mediate = getRefDate('ymd', new Date(mediate).getTime())
        this.accident.accident_name += `(${mediate.substring(2, 10)})`
      }
    },

    //返回
    handleReturn(){
      this.isNeeBackBtn = false
      this.applyList = this.tempApplyList
      this.tempApplyList = []
      this.docList = [] 
      this.userTitle = `申请帮助`
    },

    //关闭抽屉
    handleCloseDrawer(){
      this.isNeeBackBtn = false
      this.docList = []
      this.qrcodeAddr = null
      this.currentFileAddr = null
      this.recordCloudAddr = null
      this.recordTime = null
      this.currentQrCodeIndex = null
      this.loadingState = false
    },

    //重新获取用户材料
    handleRepeat(){
      if(!this.codes || !this._id){
        this.msgDialog('未获取到事务ID或身份码')
        return
      }

      this.documentTempLoading = true
      commonRequest({
        $url: 'getUserDocRepeat',
        code: this.codes,
        id: this._id
      }).then(res=>{
        this.documentTempLoading = false
        if(!res.code){
          this.docList = res.data
        }else this.msgDialog(res.message)
      }).catch(err=>{
        this.documentTempLoading = false
        this.msgDialog(err)
      })
    },

    // 连接实时数据库
    linkRealTimeDB(roomId){
      if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }
      const db = cloudApp.database();
      const _this = this;
      if(!this.danmu){
        this.danmu = db.collection('contact_live').where({
          // accident_id: this.currentID,
          roomId: roomId,
          message_date: Number(getRefDate('ymd', 0, ''))
        }).orderBy('message_time', 'asc')
        .watch({
          onChange: function(snapshot){
            const doc = snapshot['docChanges'];
            // 不需要初始化数据，但是不要删除
            const msgType = snapshot['msgType'];
             if(msgType === 'INIT_EVENT' || msgType === undefined){
              setTimeout(()=>{
                _this.isDanmuBreak = false;
              }, 1000);
              // _this.getDanmuToday(_this.currentID);
            }
            let addData = [];
            for(let index in doc){
              if(doc[index]['dataType'] === 'add'){
                addData.push({
                  nickname: doc[index]['doc']['nickname'],
                  message_content: doc[index]['doc']['message_content']
                })
              }
            }
            if(addData.length){
              //新增数据
              _this.danmuList = _this.danmuList.concat(addData);
              setTimeout(()=>{
                // this.maxScroll++;
                document.getElementById('danmu').scrollTo(0, 5000000);
              }, 100);
            }
            
            if(_this.timeMachine){
              clearTimeout(_this.timeMachine);
              _this.timeMachine = null;
            }
          },
          onError: function(err){
            // 连接失败
            const realError = err && err.errMsg && err.errMsg.type || ''
            if(realError.indexOf('timeout') >= 0){
              _this.isDanmuBreak = true;
              _this.netLinkRepeat();
            }else{
              _this.msgDialog(err);
            }
          }
        })
      }
    },

    //获取数据库的内容最近30条数据
    getDanmuToday(id){
      commonRequest({
        $url: 'get_message_live_today',
        id: id
      }).then(res=>{
        if(!res.code){
          this.danmuList = res.data
          setTimeout(()=>{
            document.getElementById('danmu').scrollTo(0, this.maxScroll);
          }, 100);
        }else this.msgDialog(res.message)
      }).catch(err=>{
        this.msgDialog(err)
      })
    },

    //重新连接实时数据库，6s一次重连
    netLinkRepeat(){
      const _this = this
      _this.timeMachine = setTimeout(()=>{
        if(_this.danmu){
          _this.danmu.close();
          _this.danmu = null;
        }
        _this.linkRealTimeDB() //重新连接弹幕数据
      }, 6000);
    },

    //查看已经录制的视频
    handleViewVideo(row, index){
      this.showRecordView = null
      this.status = 'record'
      this.dialogFormVisible = true
      this.recordLoading = true
      this.currentIndex = row['_id']
      commonRequest({
        $url: 'getRecordVideo',
        id: row['_id']
      }).then(res=>{
        this.recordLoading = false
        if(res){
          if(!res.code){
            this.showRecordView = res.data
          }else{
            if(res.message != 'NoData') this.msgDialog(res.message)
          }
        }
      }).catch(err=>{
        this.recordLoading = false
        this.msgDialog(err)
      })
    },

    //获取文件后缀
    suffix(filename){
      return filename.match(/\d{8,}.*?mp4/)
    },

    //修改录像名称
    handleChangeName(index, name){
      if(!this.currentIndex){
        this.msgDialog('事务ID获取失败');
        return;
      }

      if(this.recordIndex != null && this.recordIndex !== index){
        this.showRecordView[this.recordIndex].name = this.recordName
      }
      this.recordIndex = index
      this.recordName = name
    },

    // 共享
    handleShare(index, realAddress, name, fileAddress, time, cloudAddr, isShort = false){
      this.currentQrCodeIndex = index
      this.recordTime = time
      if(realAddress){
        this.isShowUserDocList = true
        this.userTitle = `${name}二维码`
        this.qrcodeAddr = realAddress
        this.currentFileAddr = fileAddress
        this.recordCloudAddr = cloudAddr
      }else{
        if(!this.currentIndex){
          this.msgDialog('事务ID获取失败');
          return;
        }

        this.recordLoading = true
        commonRequest({
          $url: 'createShareRecordQrcode',
          id: this.currentIndex,
          index: index,
          isShort: isShort
        }).then(res=>{
          this.recordLoading = false
          if(res){
            if(!res.code){
              if(!isShort){
                // 长链接
                this.showRecordView[index].qrcodeAddressReal = res.data.fileAddr
                this.showRecordView[index].qrcodeAddress = res.data.cloudFileID//云地址
              }else{
                // 短链接
                this.showRecordView[index].qrcodeAddressShortReal = res.data.fileAddr
                this.showRecordView[index].fileAddressShort = res.data.shortLinkUrl
                this.showRecordView[index].qrcodeAddressShort = res.data.cloudFileID//云地址
              }
              
              this.isShowUserDocList = true
              this.userTitle = `${name}二维码`
              this.qrcodeAddr = res.data.fileAddr //二维码地址
              this.currentFileAddr = !isShort ? fileAddress : res.data.shortLinkUrl  //视频文件地址 oss xx .mp4
              this.recordCloudAddr = res.data.cloudFileID
              setTimeout(()=>{
                if(res.message) this.msgDialog(res.message, 'success')
              }, 500)
            }else{
              this.msgDialog(res.message)
            }
          }
        }).catch(err=>{
          this.recordLoading = false
          this.msgDialog(err)
        })
      }
    },

    //取消修改录像
    handleCancel(index){
      this.recordIndex = null
      this.showRecordView[index].name = this.recordName
      this.recordName = null
    },

    //修改录像名称
    handleFixed(val){
      if(this.recordIndex == null){
        this.msgDialog('记录ID获取失败');
        return;
      }

      if(!this.currentIndex){
        this.msgDialog('事务ID获取失败');
        return;
      }

      if(!val){
        this.msgDialog('视频名称不能为空');
        return;
      }

      this.recordLoading = true
      commonRequest({
        $url: 'editRecordName',
        id: this.currentIndex,
        index: this.recordIndex,
        name: val
      }).then(res=>{
        this.recordLoading = false
        if(res){
          if(!res.code){
            if(res.message) this.msgDialog(res.message, 'success')
            this.recordIndex = null
          }else{
            this.msgDialog(res.message)
          }
        }
      }).catch(err=>{
        this.recordLoading = false
        this.msgDialog(err)
      })
    },

    //图片加载完毕
    handleLoadOver(){
      this.loadingState = true
    },

    // 打印二维码
    handlePrinter(){
      if(!this.currentFileAddr){
        this.msgDialog('打印地址不存在')
        return
      }

      this.printLoading = true
      // if(this.userTitle) this.userTitle = this.userTitle.replace(`二维码`, '')
      commonRequest({
        $url: 'printQRcode',
        address: this.currentFileAddr,
        name: this.userTitle && this.userTitle.replace(`二维码`, '') || null,
        isChange: this.currentFileAddr.length < 45 ? false: true
      }).then(res=>{
        this.printLoading = false
        if(res){
          if(!res.code){
            if(res.message) this.msgDialog(res.message, 'success')
          }else{
            this.msgDialog(res.message)
          }
        }
      }).catch(err=>{
        this.printLoading = false
        this.msgDialog(err)
      })
    },
    //重新生成二维码【防止短链接过期】
    handleRepeatCreate(){
      if(this.currentQrCodeIndex == null){
        this.msgDialog('索引缺失')
        return
      }

      if(!this.currentIndex){
        this.msgDialog('事务ID获取失败');
        return;
      }

      this.qrCodeRepeatLoading = true
      commonRequest({
        $url: 'newQrCode',
        id: this.currentIndex,
        index: this.currentQrCodeIndex
      }).then(res=>{
        this.qrCodeRepeatLoading = false
        if(res){
          if(!res.code){
            // 二维码生成成功
            this.currentFileAddr = res.data.fileAddr
            this.showRecordView[index].qrcodeAddressShortReal = res.data.fileAddr //二维码图片地址
            this.showRecordView[index].fileAddressShort = res.data.shortLinkUrl //阿里云短链接地址
            if(res.message) this.msgDialog(res.message, 'success')
          }else{
            this.msgDialog(res.message)
          }
        }
      }).catch(err=>{
        this.qrCodeRepeatLoading = false
        this.msgDialog(err)
      })
    },
    // 下载视频二维码
    handleDownloadVideoQRCode(){
      // this.QRcodeLoading = true
      if(!this.recordCloudAddr){
        this.msgDialog('文件暂未找到，请关闭该窗口后重试');
        return;
      }

      this.videoQrCodeLoading = true
      commonCloudFileDownload(this.recordCloudAddr).then(result=>{
        this.videoQrCodeLoading = false
      }).catch(err=>{
        this.videoQrCodeLoading = false
        this.msgDialog(err)
      })
    },
    // 发送二维码
    handleSendQRCode(){
      if(!this.currentIndex){
        this.msgDialog('事务ID缺失')
        return
      }

      if(!this.recordTime){
        this.msgDialog('录制时间获取失败')
        return
      }

      if(!this.recordCloudAddr){
        this.msgDialog('云二维码地址获取失败')
        return
      }

      const t = this.recordTime.substr(0, 10).replace('-','年').replace('-','月')+'日'

      this.sendLoading = true
      commonRequest({
        $url: 'message',
        message: t+this.userTitle.replace('二维码','')+`录像二维码`,
        nickname: getRealCookie('name'),
        sendMsgMedia: {'image0': `${this.recordCloudAddr}`}, //二维码云存储地址
        id: this.currentIndex,
        timeLong: null
      }).then(res=>{
        this.sendLoading = false
        if(!res.code){
          if(res.message) this.msgDialog(res.message, 'success')
        }else this.msgDialog(res.message)
      }).catch(err=>{
        this.sendLoading = false
        this.msgDialog(err)
      })
    },
    //查询录制状态
    handleRecordState(){
      if(!this.currentID){
        this.msgDialog('事务ID获取失败，请关闭重试')
        return
      }
      let recordInfo = getFromLocal('recordInfo')
      if(typeof recordInfo === 'string') recordInfo = JSON.parse(recordInfo)
      const sid = recordInfo && recordInfo.sid || null
      const resourceId = recordInfo && recordInfo.resourceId || null

      if(sid && resourceId){
        this.recordStateLoading = true
        commonRequest({
            $url: 'recordState',
            sid: sid,
            resourceId: resourceId
          }).then(res=>{
            this.recordStateLoading = false
            if(res.code) this.msgDialog(res.message)
            else{
              if(res.message) this.msgDialog(res.message, 'success')
              
            }
          }).catch(err => {
            this.recordStateLoading = false
            this.msgDialog(err)
          })
      }else{
        this.msgDialog('请先开启视频录制')
      }
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

  /* 吸顶 */
  .sticky{
    margin: 0 !important;
    padding: 15px 0;
    position: fixed;
    top: 0;
    width: 100%;
    background-color: white;
    z-index: 1000;
  }

  .search-cond{
    display:inline-block;
    margin:0 10px;
    position:relative;
    top:-3px;
  }

  /* 号码列表 */
  .mobile-list{
    display: flex;
    flex-flow: row nowrap;
    margin-bottom: 8px;
    width: 1658px;
  }

  .mobile-list:first-child{
    width: 1570px;
  }

  .mobile-input{
    flex: 0 1 19%;
    margin-right: 1%;
  }

  .mobile-list:last-child{
    margin-right: 0;
  }


  .accident-intro{
    margin-bottom: 10px;
    width: 90%;
  }

  .el-upload-list--picture-card .el-upload-list__item-actions{
    height: auto !important;
  }

  .el-upload-list--picture-card .el-upload-list__item > div{
    height: 100%;
  }

  #mediator .el-checkbox{
    width: 100px;
  }

  .doc-pic{
    width: 25%;
    margin-left: 37.5%;
  }

  .el-table::before{
    z-index: 0 !important;
  }

  .el-radio{
    display: block !important;
    margin-bottom: 10px;
  }

  #relation-ship tr th{
    padding: 0;
    font-size: 16px;
  }
  #local-player{
    width:500px;
    height:500px;
    margin-top:10px;
  }
  #danmu{
    width:500px;
    height:500px;
    margin-top:10px;
    overflow-y: auto;
  }
  #danmu-list{
    list-style: none;
    padding: 0;
    margin: 0;
  }
  #danmu-list >li:first-child{
    padding-top: 5px;
  }
  #danmu-list >li{
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 5px;
    white-space: pre-wrap;
    font-size: 16px;
  }
</style>