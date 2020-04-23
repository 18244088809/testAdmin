<template>
  <div class="p_both10 p-t-5">
    <div class="flex_wrap flex_mid p-b-5 border-b-e0">
      <div v-for="item in classAllCourseList" :key="item.id" class="quan_xian_item m-b-10">
        <el-checkbox
          @change="checked=>changeSelectStu(checked,item)"
          v-model="item.Selected"
        >{{item.Label}}</el-checkbox>
      </div>
      <span v-if="!classAllCourseList||classAllCourseList.length==0">本班目前没有安排课程.请搜索添加</span>
      <el-button
        v-else
        @click="removeClassStudent"
        type="danger"
        :disabled="selectExistCourse.length==0"
      >移除选中的课程</el-button>
    </div>
    <el-form :inline="true" label-width="100px" class="m-t-20">
      <el-form-item>
        <el-input
          v-model="searchContent"
          placeholder="请输入课程名称"
          class="input-with-select"
          @keyup.enter.native="searchCourse"
        ></el-input>
      </el-form-item>

      <el-form-item label-width="30px">
        <el-button type="primary" @click="searchCourse" class="border0">查 询</el-button>
      </el-form-item>
    </el-form>
    <div class="m-t-20" v-show="showSearchStuResult">
      <p>备选学员：</p>
      <hr />
      <div class="m-t-20 center flex_wrap m-l-15">
        <el-checkbox-group v-model="checkBoxAddItem">
          <el-checkbox
            :label="item.Id"
            class="m-b-5"
            :key="item.Id"
            v-for="item in searchCourseList"
          >{{item.Label}}（{{item.Id}}）</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="m-t-30 center-end">
        <el-button type="primary" @click="addCourseToClass" class="border0">确定</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { getClassCourse, addClassCourse, removeClassCourse } from "@/api/class";
import { getCourseList } from "@/api/course";
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
      // 数据总条数-分页
      allRows: 0,
      // 当前页数-分页
      nowPage: 1,
      // 每页数据的总条-分页
      rows: 40,
      searchCourseList: [],
      searchContent: "",
      // 获取班级的所有学员
      classAllCourseList: [],
      // 是否显示搜索学员的搜索结果模块
      showSearchStuResult: false,
      // 选中的要加入班级的课程
      checkBoxAddItem: [],
      // 复选框所选中的学员ID
      selectExistCourse: []
    };
  },
  watch: {
    formItemData(newval) {
      this.fire();
    }
  },
  methods: {
    // 获取班级的所有学员
     async fire() {
      this.searchCourseList = []; 
      this.showSearchStuResult = false;
      let res = await getClassCourse(this.formItemData.Id);
      this.classAllCourseList = res.data ? res.data : [];
    },
    // 查找课程
    async searchCourse() {
      this.searchCourseList = [];
      this.ShowSearchForm = false;
      this.showSearchStuResult = false;
      let res = await getCourseList("", {
        label: this.searchContent,
        platform: this.currentPlatform
      });
      this.searchCourseList = res.data ? res.data : [];

      let existCourse = this.formItemData.CourseList.split(",");

      this.checkBoxAddItem = [];

      if (existCourse.length > 0) {
        //将搜索出来的结果中，选中那些已经是本班学员的打钩
        this.$nextTick(() => {
          this.searchCourseList.forEach(searchItem => {
            existCourse.forEach(existItem => {
              if (searchItem.Id == existItem) {
                this.checkBoxAddItem.push(searchItem.Id);
              }
            });
          });
        });
        this.showSearchStuResult = true;
      } else {
        this.$message({
          message: "没有找到课程",
          type: "warning"
        });
      }
    },
    // 向班级添加学员
    async addCourseToClass() {
      if (this.checkBoxAddItem.length < 1) {
        this.$message({
          message: "还没有选中要添加的学员",
          type: "warning"
        });
        return;
      }
      let newStu = [...this.checkBoxAddItem];
      if (this.classAllCourseList.length > 0) {
        this.classAllCourseList.forEach(stuItem => {
          let index = newStu.indexOf(stuItem.Id);
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
        this.checkBoxAddItem = [];
        return;
      }
      let res = await addClassCourse(this.formItemData.Id, "", newStu);

      // 清空搜索和选中的学员数据
      this.checkBoxAddItem = [];
      this.ShowSearchForm = false;
      this.showSearchStuResult = false;
      this.classAllCourseList = [];
      if (res.data && res.data.length > 0) {
        this.classAllCourseList = res.data;
      }
      this.selectExistCourse = [];
      this.$message({
        message: "操作成功",
        type: "success"
      });
    },
    // 当复选框发生改变时获取所选中的项
    changeSelectStu(checked, item) {
      if (checked) {
        this.selectExistCourse.push(item.Id);
      } else {
        let newCheckList = [];
        this.selectExistCourse.forEach(olditem => {
          if (olditem == item.Id) {
          } else {
            newCheckList.push(olditem);
          }
        });
        this.selectExistCourse = newCheckList;
      }
    },
    // 移除班级学员
    async removeClassStudent() {
      if (this.selectExistCourse.length == 0) {
        this.$message({
          message: "还没有勾选学员",
          type: "warning"
        });
      } else {
        this.$confirm("你确定删除吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(async () => {
          let res = await removeClassCourse(
            this.formItemData.Id,
            "",
            this.selectExistCourse
          );
          this.classAllCourseList = res.data;
          this.$message({
            message: "操作成功",
            type: "success"
          });
          this.selectExistCourse = [];
        });
      }
    }
  }
};
</script> 
<style scoped>
.quan_xian_item {
  width: calc(100% / 2);
}
</style> 