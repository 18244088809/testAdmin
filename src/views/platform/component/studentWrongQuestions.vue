<template>
  <div>
    <el-table
      :data="studentAchievementList"
      tooltip-effect="light"
      border
      id="idWrongStu"
      style="width: 100%"
      height="100%"
    > 
      <el-table-column prop="Label" label="练习的内容" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="TotalNum" sortable width="100" label="题目总数"></el-table-column>
      <el-table-column prop="AnswerNum" sortable width="100" label="答题总数"></el-table-column>
      <el-table-column prop="RightNum" sortable width="90" label="正确数"></el-table-column>
      <el-table-column prop="Score" sortable label="得分" width="80"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  getMyWrongQuestions
} from "@/api/exercise";
import common from "@/utils/common";
import { isDate } from "xe-utils/methods";
export default {
  props: {
    // 班级资料
    studentDoExercise: {
      type: Object,
      default: function() {
        return { Id: 0 };
      }
    },
    editEnable: {
      typ: Boolean,
      default: false
    },
     
  },
  data() {
    return {
      common,
        // 学生成绩列表
      studentAchievementList: [],
    };
  },
  watch: {
    formItemData(newvar) {
      this.currentItemData = this.formItemData;
    }
  },
  mounted() {
    
  },
  methods: {
      // 获取做题错的较多的学生的数据
    async getMyWrongQuestions() {
      let from = 0;
      let end = parseInt(new Date().getTime() / 1000);
      if (this.startingTime != null) {
        if (this.startingTime[0]) {
          from = parseInt(this.startingTime[0] / 1000);
        }
        if (this.startingTime[1]) {
          end = parseInt(this.startingTime[1] / 1000);
        }
      }
      let urlParams = this.studentDoExercise.Chapter
      let res = await getMyWrongQuestions(urlParams, {
        from: from,
        end: end,
        badest: this.badGrade
      });
      if (res.code == 200) {
        this.chapterName = res.data.Label;
        this.studentAchievementList = res.data.Children;
      }
    },
  },
  mounted() {}
};
</script>  