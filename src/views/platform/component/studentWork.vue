<template>
  <div class="flex_column pd0 marg0">
    <div style="display: flex;  flex-direction:row">
      <div style="width:300px;">
        <el-table :data="classAllStuList" tooltip-effect="light">
          <el-table-column prop="id" label="学号" width="60"></el-table-column>
          <el-table-column prop="Realname" label="姓名">
            <template slot-scope="scope">
              <el-tooltip
                class="item"
                effect="dark"
                :content="'Tel:'+scope.row.Telephone"
                placement="top"
              >
                <span
                  class="color-1f85aa font-w6 cursor"
                  @click="onClickStudent(scope.row)"
                >{{ scope.row.Realname }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="Sex" label="性别" width="50"></el-table-column>
        </el-table>
      </div>
      <div style="width:35px;height:100%;  background:#e0e3ea; "></div>
      <div style="width:90%;">
        <!-- <el-table :data="classAllStuList">
          <el-table-column prop="id" label="作业号" width="60"></el-table-column>
          <el-table-column prop="Realname" label="作业名称">
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
        </el-table>-->
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
  getAllClassTaskRecord
} from "@/api/class";
import common from "@/utils/common";
import { isDate } from "xe-utils/methods";
export default {
  props: {
    // 校区的表单数据
    formItemData: {
      type: Object,
      default: function() {
        return { Id: 0 };
      }
    },
    editEnable: {
      typ: Boolean,
      default: false
    },
    platform: {
      typ: Number,
      default: 0
    }
  },
  data() {
    return {
      common,
      searchGrade: new Date(),
      currenteditEnable: this.editEnable,
      // 控制班级弹出框
      isShowClassDialog: false,
      // 创建班级的时间
      createClassTime: null,
      // 获取班级的所有学员
      classAllStuList: [],
      // 创建人
      createPerson: null,
      currentItemData: this.formItemData,
      // 表单验证
      ClassFormRules: {
        Label: [
          { required: true, message: "班级名称不能为空", trigger: "blur" }
        ]
      }
    };
  },
  watch: {
    formItemData(newvar) {
      this.setData();
    }
  },
  mounted() {
    this.setData();
  },
  methods: {
    setData() {
      this.currentItemData = this.formItemData;
      this.getClassAllStuList();
    },
    onClickStudent(clickStudent) {
      console.log("--------", clickStudent);
    },
    // 获取班级的所有学员
    async getClassAllStuList() {
      this.serachStuList = [];
      this.ShowSearchForm = false;
      this.showSrarchStuResult = false;
      let res = await getClassStu(this.formItemData.Id);
      this.classAllStuList = res.data ? res.data : [];
    },
    // 添加或编辑数据
    saveFormItemData() {
      this.currentItemData.PlatformID = parseInt(this.platform);
      if (isDate(this.searchGrade)) {
        this.currentItemData.Grade = this.searchGrade.getFullYear();
      }

      // 验证表单数据
      this.$refs.classForm.validate(async valid => {
        if (valid) {
          let rowdata = { ...this.currentItemData };
          if (isNaN(this.currentItemData.OpenTime)) {
            rowdata.OpenTime = Math.floor(
              this.currentItemData.OpenTime.getTime() / 1000
            );
          } else {
            rowdata.OpenTime = Math.floor(this.currentItemData.OpenTime / 1000);
          }
          if (isNaN(this.currentItemData.Endtime)) {
            rowdata.Endtime = Math.floor(
              this.currentItemData.Endtime.getTime() / 1000
            );
          } else {
            rowdata.Endtime = Math.floor(this.currentItemData.Endtime / 1000);
          }
          if (isNaN(this.currentItemData.Createtime)) {
            rowdata.Createtime = Math.floor(
              this.currentItemData.Createtime.getTime() / 1000
            );
          } else {
            rowdata.Createtime = Math.floor(
              this.currentItemData.Createtime / 1000
            );
          }
          if (rowdata.Id > 0) {
            // 编辑
            let res = await editClassInfo(rowdata.Id, "", rowdata);
            this.isShowPlatformDialog = false;
            this.currentItemData = res.data;
            this.$emit("subClickEvent", 1, res.data);
            this.$message({
              message: "修改成功",
              type: "success"
            });
          } else {
            // 创建
            let res = await addClassInfo("", "", rowdata);

            this.$message({
              message: "创建成功",
              type: "success"
            });
            this.$emit("subClickEvent", 0, res.data);
          }
          this.currentItemData.OpenTime = this.currentItemData.OpenTime * 1000;
          this.currentItemData.Endtime = this.currentItemData.Endtime * 1000;
          this.currentItemData.Createtime =
            this.currentItemData.Createtime * 1000;
        } else {
          return false;
        }
      });
    }
  }
};
</script>  