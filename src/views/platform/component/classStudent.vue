<template>
  <div class="p_both10 p-t-5">
    <div class="flex_wrap flex_mid p-b-5 border-b-e0">
      <div v-for="item in classAllStuList" :key="item.id" class="quan_xian_item m-b-10">
        <el-checkbox
          @change="checked=>changeSelectStu(checked,item)"
          v-model="item.Selected"
        >{{item.Realname}}</el-checkbox>
      </div>
      <p v-if="!classAllStuList||classAllStuList.length==0">本班目前没有学员.请搜索添加学员进入本班</p>
      <el-button
        v-else
        @click="removeClassStudent"
        type="danger"
        :disabled="selectExistStudents.length==0"
      >移除选中的学员</el-button>
    </div>
    <el-form
      :inline="true"
      :model="stuSearchForm"
      :rules="stuSearchFormRules"
      label-width="100px"
      class="m-t-20"
    >
      <el-form-item label="录入时间段">
        <el-date-picker
          v-model="queryEndDate"
          type="daterange"
          align="right"
          unlink-panels
          value-format="timestamp"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="common.datePickerOptions"
          style="width:220px;"
        />
      </el-form-item>
      <el-form-item prop="searchPhone">
        <el-input
          v-model="searchContentVal"
          placeholder="请输入搜索内容"
          class="input-with-select"
          @keyup.enter.native="searchSubmit"
        >
          <el-select
            slot="prepend"
            v-model="seaechConditionVal"
            placeholder="请选择查询条件"
            class="wid90"
          >
            <el-option
              v-for="(item,index) in searchCustomOptions"
              :key="index"
              :label="item.Label"
              :value="item.value"
            />
          </el-select>
        </el-input>
      </el-form-item>

      <el-form-item label-width="30px">
        <el-button type="primary" @click="searchStudent" class="border0">查 询</el-button>
      </el-form-item>
    </el-form>
    <div class="m-t-20" v-show="showSrarchStuResult">
      <p>备选学员：</p>
      <hr />
      <div class="m-t-20 center flex_wrap m-l-15">
        <el-checkbox-group v-model="checkBoxAddStu">
          <el-checkbox
            :label="item.id"
            class="m-b-5"
            :key="item.id"
            v-for="item in serachStuList"
          >{{item.Realname}}（{{item.Telephone}}）</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="m-t-30 center-end">
        <el-button type="primary" @click="addStudentToClass" class="border0">加入班级</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getAllClass,
  editClassInfo,
  addClassInfo,
  getOneClass,
  setClassTeacher,
  getClassTeachers,
  getTimeTableByMonth,
  addClassDaily,
  addTimeTag,
  getTimeTag,
  addClassStu,
  getClassStu,
  handOutTask,
  getAllClassTaskRecord,
  removeClassStudent
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
    currentPlatform: {
      type: Number,
      default: 0
    },
    // 班级
    formItemData: {
      type: Object,
      default: { Id: 0 }
    }
  },

  data() {
    return {
      common,
      // 搜索表单数据
      stuSearchForm: {
        searchPhone: "",
        searchName: ""
      },
      // 日期选择-日期筛选
      queryEndDate: null,
      // 查询客户所选条件值
      seaechConditionVal: "",
      // 查询客户内容的值
      searchContentVal: "",
      // 搜索学生的类型-条件查询
      searchTypeVal: "realname",
      // 查询客户的条件选项
      searchCustomOptions: [
        {
          value: "realname",
          Label: "姓名"
        },

        {
          value: "tel",
          Label: "电话"
        },
        {
          value: "comments",
          Label: "备注"
        }
      ],
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
      // 数据总条数-分页
      allRows: 0,
      // 当前页数-分页
      nowPage: 1,
      // 每页数据的总条-分页
      rows: 40,
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
      selectExistStudents: []
    };
  },
  mounted() {
    this.getClassAllStuList();
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
    async searchStudent() {
      let startDate;
      let endDate;
      if (this.queryEndDate && this.queryEndDate.length == 2) {
        startDate = parseInt(this.queryEndDate[0] / 1000);
        endDate = parseInt(this.queryEndDate[1] / 1000 + 3600 * 24 - 1);
      }
      // 取数据的位置
      const offsetRow = (this.nowPage - 1) * this.rows;
      let res = await getCustomInfoList("", {
        limit: this.rows,
        offset: offsetRow,
        kind: this.searchTypeVal,
        platform: this.currentPlatform,
        startDate: startDate,
        endDate: endDate,
        [this.seaechConditionVal]: this.searchContentVal
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
      this.selectExistStudents = [];
    },
    // 当复选框发生改变时获取所选中的项
    changeSelectStu(checked, item) {
      if (checked) {
        this.selectExistStudents.push(item.id);
      } else {
        let newCheckList = [];
        this.selectExistStudents.forEach(olditem => {
          if (olditem == item.id) {
          } else {
            newCheckList.push(olditem);
          }
        });
        this.selectExistStudents = newCheckList;
      }
    },
    // 移除班级学员
    async removeClassStudent() {
      if (this.selectExistStudents.length == 0) {
        this.$message({
          message: "还没有勾选学员",
          type: "warning"
        });
      } else {
        this.$confirm("删除后 此学生在本班级的作业也会被删除，你确定吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(async () => {
          let res = await removeClassStudent(
            this.formItemData.Id,
            "",
            this.selectExistStudents
          );
          this.classAllStuList = res.data;
          this.$message({
            message: "操作成功",
            type: "success"
          });
          this.selectExistStudents = [];
        });
      }
    }
  }
};
</script> 
<style scoped>
.quan_xian_item {
  width: calc(100% / 5);
}
</style> 