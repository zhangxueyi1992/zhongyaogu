<template>
    <el-dialog title="申请列表" :visible.sync="controlShow">
        <el-table :data="gridData" v-loading="loading" @closed="handleCloseDialog">
            <el-table-column property="username" label="申请人姓名" width="150"></el-table-column>
            <el-table-column property="mobile" label="联系电话" width="200"></el-table-column>
            <el-table-column property="addtime" label="申请时间"></el-table-column>
        </el-table>
        <div id="again">
            <el-button type="primary" size="mini" icon="el-icon-refresh" @click="getApplyInfoList()">
                重新获取
          </el-button>
        </div>
    </el-dialog>
</template>
<script>
    export default {
        name:"ApplyList",
        props:{
            gridData:{
                type: [Array, Object],
                default: null
            },
            controlShow:{
                type: Boolean,
                default: false
            },
            loading:{
                type: Boolean,
                default: false
            }
        },
        data(){
            return {
                dialogTableVisible: false
            }
        },
        methods:{
            getApplyInfoList(){
                this.$emit('again')
            },
            handleCloseDialog(){
                this.dialogTableVisible = false
            }
        },
        watch:{
            controlShow(val){
                if(val === true){
                    this.dialogTableVisible = true
                }

                return
            }
        }
    }
</script>
<style scoped>
    #again{
        text-align: center;
        margin-top: 20px;
    }
</style>
