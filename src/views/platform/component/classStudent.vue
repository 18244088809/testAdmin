<template>
  <div class="pad0">
    <el-table
      :data="classAllStuList"
      @selection-change="changeSelectStu"
      style="width: 100%;margin:0px"
      tooltip-effect="light"
    >
      <el-table-column prop="id" label="学号" width="60"></el-table-column>
      <el-table-column prop="Realname" label="姓名">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="'Tel:'+scope.row.Telephone"
            placement="top"
          >
            <span class="color-1f85aa font-w6 cursor">{{ scope.row.Realname }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="Sex" label="性别" width="50"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import {
  getAllClass,
  editClassInfo,
  addClassInfo,
  getOneClass,
  addClassOpenData,
  getClassOpenData,
  getTimeTableByMonth,
  addTimeTableBy,
  addTimeTag,
  getTimeTag,
  addClassStu,
  getClassStu,
  handOutTask,
  getAllClassTaskRecord
} from "@/api/class";
import {
  GetStudentDataTrackAnalysis,
  getCustomTracks,
  addcustomTracks,
  uploadImgInTracks,
  replyTracks,
  receiveSmsTrack,
  getTrackList,
  getCustomBuyCouseRecord,
  addCustomBuyCourseRecord,
  customAllowDoExercise,
  deleteBuyCourse,
  getCustomInfoList,
  addCustomInfo,
  editCustomInfo,
  resetCustomPassword,
  setCustomAccountStatus,
  checkTelephone,
  setStar,
  batchChangeManager
} from "@/api/custom";
import common from "@/utils/common";
export default {
  name: "ClassStudent",
  props: {
    // 校区的表单数据
    formItemData: {
      type: Object,
      default: function() {
        return { Id: 0 };
      }
    }
  },
  watch: {
    formItemData(newval) { 
      this.getClassAllStuList();
    }
  },
  mounted() { 
    this.getClassAllStuList();
  },
  data() {
    return {
      common,
      // 搜索表单数据
      stuSearchForm: {
        searchPhone: "",
        searchName: ""
      },
      // 搜索表单验证
      stuSearchFormRules: {
        searchPhone: [
          {
            pattern: /^\d{5,11}$/,
            message: "请输入正确的手机号，且不得少于5位数",
            trigger: "blur"
          }
        ]
      },
      // 查找学员的列表-查找结果
      serachStuList: [],
      // 选中的要加入班级的学员
      checkBoxAddStu: [],
      // 是否显示添加学员模块
      ShowSearchForm: false,
      // 是否显示搜索学员的搜索结果模块
      showSrarchStuResult: false,
      // 获取班级的所有学员
      classAllStuList: [],
      // 复选框所选中的学员ID
      checkBoxStuID: []
    };
  },
  methods: {
    // 获取班级的所有学员
    async getClassAllStuList() {
      this.serachStuList = [];
      this.ShowSearchForm = false;
      this.showSrarchStuResult = false;
      let res = await getClassStu(this.formItemData.Id);
      this.classAllStuList = res.data ? res.data : [];
    },
    // 查找学员
    searchStudent() {
      // 验证表单数据
      if (!this.stuSearchForm.searchPhone && !this.stuSearchForm.searchName) {
        this.$message({
          message: "必须填写学生手机号或姓名之后才能查询",
          type: "warning"
        });
        return false;
      }
      this.$refs.stuSearchForm.validate(async valid => {
        if (valid) {
          let res = await getCustomInfoList("", {
            limit: 10000,
            tel: this.stuSearchForm.searchPhone,
            realname: this.stuSearchForm.searchName
          });
          if (res.code == 200) {
            if (res.data) {
              this.serachStuList = res.data;
              this.showSrarchStuResult = true;
            } else {
              this.serachStuList = [];

              this.$message({
                message: "没有找到该学员",
                type: "warning"
              });
            }
          }
        } else {
          return false;
        }
      });
    },
    // 向班级添加学员
    async addStudentToClass() {
      if (this.checkBoxAddStu.length < 1) {
        this.$message({
          message: "还没有选中要添加的学员",
          type: "warning"
        });
        return;
      }
      let newStu = [...this.checkBoxAddStu];
      if (this.classAllStuList.length > 0) {
        this.classAllStuList.forEach(stuItem => {
          let index = newStu.indexOf(stuItem.ID);
          if (index != -1) {
            newStu.splice(index, 1);
          }
        });
      }
      if (newStu.length == 0) {
        this.$message({
          message: "该学员已经添加过了",
          type: "warning"
        });
        this.checkBoxAddStu = [];
        return;
      }
      let res = await addClassStu(this.formItemData.Id, "", newStu);
      if (res.code == 200) {
        this.$message({
          message: "操作成功",
          type: "success"
        });
        // 清空搜索和选中的学员数据
        this.checkBoxAddStu = [];
        this.serachStuList = [];
        this.stuSearchForm.searchPhone = "";
        this.ShowSearchForm = false;
        this.showSrarchStuResult = false;
        this.classAllStuList = [];
        if (res.data && res.data.length > 0) {
          this.classAllStuList = res.data;
        }
      }
    },
    // 当复选框发生改变时获取所选中的项
    changeSelectStu(selsetItem) {
      this.checkBoxStuID = [];
      selsetItem.forEach(item => {
        this.checkBoxStuID.push(item.id);
      });
    },
    // 移除班级学员
    removeClassStu() {
      if (this.checkBoxStuID.length == 0) {
        this.$message({
          message: "还没有勾选学员",
          type: "warning"
        });
      } else {
        console.log(this.checkBoxStuID);
      }
    }
  }
};
</script> 
<style scoped>
</style> 