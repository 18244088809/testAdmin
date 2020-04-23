<template>
  <div>
    选择要发给学员的试卷 
    <el-table
      tooltip-effect="light"
      :data="exerciseList"
      border
      style="width: 100%"
      height="100%"
      ref="refElTabel"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" width="30" />
      <el-table-column prop="Id" label="ID" width="50"></el-table-column>
      <el-table-column prop="Label" label="试卷名称" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="Used" label="是否已经学过" width="100"></el-table-column>
      <el-table-column prop="Examtime" label="考试时间(分钟" width="110"></el-table-column>
    </el-table>
    <div class="between-center m-v-10">
      <el-button type="primary" @click="sendToStudents()">确定发送</el-button>
      <div>
        <el-pagination
          background
          @current-change=" currentPageChange"
          :current-page.sync="nowPage"
          :page-size="rows"
          layout="total,prev, pager, next, jumper"
          :total="allRows"
        ></el-pagination>
      </div>
    </div> 
  </div>
</template>

<script>
import { getClassExercise } from "@/api/exercise";
import { sendStudentsExercise } from "@/api/class";
import common from "@/utils/common"; 
import { isDate } from "xe-utils/methods";
export default {
  name: "questionsList",
  
  props: {
    classItem: {
      type: Object,
      default: {
        Id: 0
      }
    },
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
      // 数据总条数
      allRows: 0,
      // 当前页数
      nowPage: 1,
      // 每页数据的总条
      rows: 50,
      // 获取选中的学生ID
      selectedIDList: [],
      currentItemData: {},
      exerciseList: [],
      makeExamDialog: false
    };
  },
  watch: {
    classItem(newval) {
      this.fire();
    }
  },
  methods: {
    fire() {
      this.getThisClassExercise();
    },
    addNewExercise() {
      this.makeExamDialog = true;
    },
    // 分页获取数据
    currentPageChange(val) {
      this.nowPage = val;
      this.getThisClassExercise();
    },
    // 选中学院后回调选中课程类别
    async getThisClassExercise() {
      let that = this;
      // 取数据的位置
      let offsetRow = (this.nowPage - 1) * this.rows;
      let res = await getClassExercise(this.classItem.Id, {
        limit: that.rows,
        offset: offsetRow
      });
      if (res.code == 200) {
        that.exerciseList = res.data ? res.data : [];
        let exerciseids = that.classItem.Exerciseids.split(",");
        that.exerciseList.forEach(execise => {
          execise.Used = "没有学";
          exerciseids.forEach(exericseid => {
            if (exericseid == execise.Id) {
              execise.Used = "已经学过";
            }
          });
        });
        that.allRows = res.title;
      }
    }, // 课程大类改变
    // 获取选中的学生
    selectionChange(val) {
      this.selectedIDList = [];
      val.forEach(item => {
        this.selectedIDList.push(item.Id);
      });
    },

    // 添加或编辑数据
    async sendToStudents() {
      let usedExeriseIDS = this.classItem.Exerciseids.split(",");
      let enabledExerciseIDS = [];
      this.selectedIDList.forEach(execise => {
        let hasIn = false;
        usedExeriseIDS.forEach(usedExerciseID => {
          if (usedExerciseID == execise) {
            hasIn = true;
          }
        });
        if (hasIn == false) {
          enabledExerciseIDS.push(execise);
        }
      });

      let res = await sendStudentsExercise(
        this.classItem.Id,
        { exerciseids: enabledExerciseIDS.join(",") },
        this.classAllStuList
      );
      this.classAllStuList = res.data ? res.data : [];
    }
  },
  mounted() {}
};
</script>  