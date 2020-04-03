<template>
  <div class="p_both10 p-t-5">
    <div class="flex_1">
      <vxe-table
        ref="ClassTeacherTable"
        border
        :edit-rules="ClassOpenTableRules"
        :fit="true"
        @edit-disabled="editDisabledRow"
        :data="teacherList"
        :edit-config="{trigger: 'dblclick', mode: 'row',showIcon:false, activeMethod: activeTeacherRow}"
      >
        <vxe-table-column
          field="teacher_label"
          title="老师名称"
          :edit-render="{type: 'default'}"
          min-width="110"
        >
          <template v-slot:edit="{row,rowIndex}">
            <el-select v-model="row.teacher_id" @change="changeTeacher(  row,rowIndex)">
              <el-option
                v-for="(item) in teacherOptionList"
                :key="item.Id"
                :label="item.Realname"
                :value="item.Id"
              ></el-option>
            </el-select>
          </template>
        </vxe-table-column>

        <vxe-table-column
          field="book_label"
          title="所教教材"
          :edit-render="{type: 'default'}"
          min-width="300"
          show-overflow
        >
          <template v-slot:edit="{row,rowIndex}">
            <el-select v-model="row.book_id" @change="changeTeachingBook( row,rowIndex)">
              <el-option
                v-for="(item) in  teacheingBookOptions"
                :key="item.Id"
                :label="item.Label"
                :value="item.Id"
              ></el-option>
            </el-select>
          </template>
        </vxe-table-column>
        <vxe-table-column
          field="total_time"
          title="总课时"
          :edit-render="{type: 'default'}"
          min-width="100"
        >
          <template v-slot:edit="{ row }">
            <el-input-number v-model="row.total_time" :min="0"></el-input-number>
          </template>
        </vxe-table-column>
        <vxe-table-column min-width="80" title="操作" show-overflow>
          <template v-slot="{ row,rowIndex }">
            <el-button v-if="row.id<0" type="warning" @click="deleTeacherRow(row,rowIndex)">删除</el-button>
            <el-tooltip v-else effect="dark" content="已经添加的授课老师不允许删除，可以忽略" placement="top-start">
              <el-button>删除</el-button>
            </el-tooltip>
          </template>
        </vxe-table-column>
      </vxe-table>

      <div class="between-center m-v-15">
        <el-button @click="insertTeacherRow()">添加老师</el-button>
        <el-button type="primary" @click="saveClassOpenFormData">保 存</el-button>
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
import { getPlatformTeacher, getTeachBook } from "@/api/manager";

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
      this.getClassTeachers();
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
      //  某一天课程表数据
      todayTimeTableList: [],
      // 老师所教的科目
      teacheingBookOptions: [],
      // 查找学员的列表-查找结果
      serachStuList: [],
      // 选中的要加入班级的学员
      checkBoxAddStu: [],
      // 是否显示添加学员模块
      ShowSearchForm: false,
      // 是否显示搜索学员的搜索结果模块
      showSrarchStuResult: false,

      teacherList: [],
      ClassOpenTableRules: {
        teacher_id: [{ required: true, message: "授课课时不能为空" }],
        book_id: [{ required: true, message: "授课科目不能为空" }],
        total_time: [{ required: true, message: "总课时不能为空" }]
      }, // 获取所有的老师
      teacherOptionList: [],
      // 是否可以编辑图片和开班申请
      isEditImgIcon: true,
      // 查看的图片的路径
      showImgUrl: ""
    };
  },
  mounted() {},
  methods: {
    fire() {
      this.getPlatformTeacher();
      this.getClassTeachers();
    },
    // 获取所有的老师
    async getPlatformTeacher() {
      let res = await getPlatformTeacher("", {
        platform: this.formItemData.PlatformID
      });
      if (res.code == 200) {
        this.teacherOptionList = res.data ? res.data : [];
      }
    },
    // 改变科目的时候自动获取老师和老师id
    changeSubject(val, row, rowIndex) {
      this.classAllSubject.forEach(item => {
        if (item.book_id == val) {
          row.TeacherID = item.teacher_id;
          row.BookID = item.book_id;
          row.TeacherLabel = item.teacher_label;
        }
      });
      this.todayTimeTableList.splice(rowIndex, 1, row);
    },

    // 插入行添加课表
    insertTeacherRow() {
      let newItem = {
        id: -this.teacherList.length - 1
      };
      this.teacherList.push(newItem);
    },
    // 保存开班申请的所有数据
    saveClassOpenFormData() {
      this.$refs.ClassTeacherTable.validate(async valid => {
        if (valid) {
          let rowdata;
          let res = await setClassTeacher(
            this.formItemData.Id,
            "",
            this.teacherList
          );

          if (res.data) {
            this.isEditImgIcon = false;
          }
          this.$message({
            message: "保存成功！",
            type: "success"
          });
        } else {
          return false;
        }
      });
    },

    // 禁止编辑以前添加的老师
    editDisabledRow({ row, column }) {
      this.$message({
        message:
          "已经安排好的计划不允许修改，否则考勤混乱。如果确实计划有误，忽略即可不用修改",
        type: "warning"
      });
    },
    // 可以编辑的行数
    activeTeacherRow({ row, rowIndex }) {
      if (row.id <= 0) {
        return true;
      }
    },
    // 改变老师的时候保存老师的id，并获取科目
    changeTeacher(row, rowIndex) {
      this.teacherOptionList.forEach(item => {
        if (item.Id == row.teacher_id) {
          row.teacher_label = item.Realname;
        }
      });
      this.getTeacherTeachingBook(row.teacher_id);
      this.teacherList.splice(rowIndex, 1, row);
    },

    // 改变老师是获取老师所教的科目
    async getTeacherTeachingBook(teacherId) {
      this.teacheingBookOptions = [];
      let res = await getTeachBook(teacherId);

      if (!res.data) {
        this.$message({
          message: "老师还没有关联的科目",
          type: "warning"
        });
      }
      this.teacheingBookOptions = res.data ? res.data : [];
    },
    // id小于0的行可以删除
    deleTeacherRow(row, rowIndex) {
      this.teacherList.splice(rowIndex, 1);
    },
    // 改变科目的时候保存科目Id
    changeTeachingBook(row, rowIndex) {
      this.teacheingBookOptions.forEach(item => {
        if (item.Id == row.book_id) {
          row.book_label = item.Label;
        }
      });
      this.teacherList.forEach(item => {
        if (
          row.id != item.id &&
          item.book_id == row.book_id &&
          item.teacher_id == row.teacher_id
        ) {
          this.$message({
            message: "已经设置过这个老师所教的这个科目",
            type: "warning"
          });
          this.teacherList.splice(rowIndex, 1);
        }
      });
    },
    // 获取班级的所有老师
    async getClassTeachers() {
      this.serachStuList = [];
      this.ShowSearchForm = false;
      this.showSrarchStuResult = false;
      let res = await getClassTeachers(this.formItemData.Id);
      this.teacherList = res.data ? res.data : [];
    }
  }
};
</script> 
<style scoped>
</style> 