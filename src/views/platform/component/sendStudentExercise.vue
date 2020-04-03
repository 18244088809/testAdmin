<template>
  <div>
    选择试卷所属的学院和类别
    <el-form style="padding:10px 0px 0px 0px" label-width="80px" size="small" :inline="true">
     <el-form-item label="所属学院">
        <el-select v-model="currentCollegeID" placeholder="请选择学院" @change="collegeChange">
          <el-option
            v-for="(item,index) in $store.getters.app.collegeWithCourseKind"
            :key="index"
            :label="item.Label"
            :value="item.Id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程类别">
        <el-select v-model="currentCourseKindID" placeholder="请选择课程分类" @change="courseKindChange">
          <el-option
            v-for="(item,index) in courseKindsOps"
            :key="index"
            :label="item.Label"
            :value="item.Id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="around-center hgt60 bge0e3ea">
      <el-button type="warning" class="m-l-40">编辑</el-button>
      <el-button type="primary" :disabled="false" class="m-l-40" @click="saveFormItemData">确 认</el-button>
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
    studentIDS: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      common,
      // 选中的学院
      currentCollegeID: {},
      currentCourseKindID: {},
      //  科目的基本数据
      currentItemData: {},
      courseKindsOps: [],
    };
  },
 
  mounted() {
   
  },
  methods: {

     // 选中学院后回调选中课程类别
    collegeChange(collegeID) {
      this.$store.getters.app.collegeWithCourseKind.forEach(college => {
        if (college.Id == collegeID) {
          this.currentCourseKindID = 0;
          this.courseKindsOps = college.Children;
        }
      });
    }, // 课程大类改变
    courseKindChange(coursekindId) {
      this.courseKindsOps.forEach(coursekind => {
        if (coursekind.Id == coursekindId) {
          this.currentItemData.Coursekind = coursekind.Label;
          this.currentItemData.CoursekindID = coursekind.Id;
        }
      });
    },
    // 添加或编辑数据
    saveFormItemData() {
      console.log("====studentIDS:===", this.studentIDS);
    }
  },
  mounted() {}
};
</script>  