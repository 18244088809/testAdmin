<template>
  <div class="font16 hgt_full m-t-10">
    <div class="flex_column hgt_full">
      <div class="between-center">
        <!-- <span class="m-b-10">科目名称：{{subjectLabel}}</span> -->
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="第">
            <!-- <el-input-number
              v-model="currentItemData.Zhang"
              controls-position="right"
              :min="0"
              :max="1000"
              label="输入章"
            ></el-input-number>章 --> 
<el-dropdown>
  <span class="el-dropdown-link">
    下拉菜单<i class="el-icon-arrow-down el-icon--right"></i>
  </span>
  <el-dropdown-menu slot="dropdown">
    <el-dropdown-item v-for="item in zhangOfBook" :key="item.Id" >{{item.Label}}</el-dropdown-item>
    
  </el-dropdown-menu>
</el-dropdown>

 
          </el-form-item>
          <el-form-item label="第">
            <el-input-number
              v-model="currentItemData.Jie"
              controls-position="right"
              :min="0"
              :max="1000"
              label="输入节"
            ></el-input-number>节
          </el-form-item>
          <el-form-item label="第">
            <el-input-number
              v-model="currentItemData.TopicNo"
              controls-position="right"
              :min="0"
              :max="1000"
              label="输入点"
            ></el-input-number>知识点
          </el-form-item>
          <el-form-item label="题干">
            <el-input
              class="wid150"
              v-model="currentItemData.QuestionContent"
              placeholder="输入题干内容查重"
              @keyup.native.enter="getQuesListOfBookZhangJie"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getQuesListOfBookZhangJie">查询</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        :data="questionsListOfBook"
        border
        tooltip-effect="light"
        style="width: 100%"
        height="100%"
        ref="refElTabel"
      >
        <el-table-column prop="Id" label="ID" width="60"></el-table-column>
        <el-table-column prop="QuestionContent" label="题干" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <div v-html="scope.row.QuestionContent" class="QuestionContentImg"></div>
          </template>
        </el-table-column>
        <el-table-column prop="QuestionType" label="类型" width="95">
          <template slot-scope="scope">
            <span>{{common.FormatSelect($store.getters.app.questionTypes,scope.row.QuestionType)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ManagerLabel" label="发布人" width="100"></el-table-column>
        <el-table-column prop="QuestionScore" width="50" label="得分"></el-table-column>
        <el-table-column prop="State" label="状态" width="70">
          <template slot-scope="scope">
            <el-tag v-show="scope.row.State==1">上架</el-tag>
            <el-tag v-show="scope.row.State==0" type="info">下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="State" label="错误/全部" width="90">
          <template slot-scope="scope">
            <span>{{scope.row.WrongNum}}/{{scope.row.AnswerNum}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button type="primary" @click="openEditQuestionDialog(scope.$index, scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="between-center m-v-15">
        <el-button type="primary" @click="openAddQuestionDialog">新增试题</el-button>
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
    <!-- 弹出框 -->
    <my-dialog :visible.sync="moreOperationDialog" :showLeft="false" title="题目详情编辑">
      <div slot="right_content">
        <question-row-dialog
          ref="refQusetionDialog"
          :formItemData="currentItemData"
          @subClickEvent="updateQuestionList"
        ></question-row-dialog>
      </div>
    </my-dialog>
  </div>
</template>

<script>
import myDialog from "@/components/myDialog/myDialog";
import questionRowDialog from "@/views/course/question/component/questionRowDialog";
import $ImgHttp from "@/api/ImgAPI";
import { getBookVideo } from "@/api/book";
import { getQuestionOfBook } from "@/api/question";
import common from "@/utils/common";
export default {
  name: "questionsList",
  components: {
    myDialog,
    questionRowDialog
  },
  data() {
    return {
      common,
      // 上传图片加载中的状态
      isbusy: false,
      // 选项字母
      words: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
      // 数据总条数
      allRows: 0,
      // 当前页数
      nowPage: 1,
      // 每页数据的总条
      rows: 30,
      // 查询-搜索
      // searchQuestionZhang: 1, //搜索章
      // searchQuestionJie: 1, //搜索节
      // searchQuestionTopic:1,
      //搜索有没有相同的题干了.
      searchQuestionContent: "",
      // 科目名称
      subjectLabel: "",
      // 更多操作弹窗
      moreOperationDialog: false,
      // 当前索引操作的
      currentQuestionIndex: null,
      // 科目的试题列表
      questionsListOfBook: [],
      zhangOfBook: [],
      jieOfBook: [],
      topicOfBook: [],
      
      // 图片地址
      ImgAddr: "",
      currentPlatform: {},
      // 模态框获得的单条数据
      currentItemData: {
        TopicNo: 1,
        Zhang: 1,
        Jie: 1
      },
      // 表单验证
      questionFormRules: {
        ZhangId: [{ required: true, message: "请填写章编号", trigger: "blur" }],
        JieId: [{ required: true, message: "请填写节编号", trigger: "blur" }],
        TopicId: [{ required: true, message: "请填写知识点", trigger: "blur" }],
        QuestionScore: [
          { required: true, message: "请填写题的分值", trigger: "blur" }
        ],
        QuestionContent: [
          { required: true, message: "请填写题干内容", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    this.currentItemData.BookId = parseInt(this.$route.query.Id);
    this.bookChapter();
    this.getQuesListOfBookZhangJie();
  },
  methods: {
    // 复制文本
    copy() {
      let clipboard = new this.clipboard(".tag-read");
      clipboard.on("success", e => {
        clipboard.destroy();
      });
      clipboard.on("error", e => {
        // 释放内存
        clipboard.destroy();
      });
    },
    // 题库上传图片
    async ImgUploadQuestion(file, fileList) {
      this.isbusy = true;
      let res = await $ImgHttp.UploadImgExercise(
        this.currentItemData.BookId,
        file.raw
      );
      if (res.code == 200) {
        this.common.go_alert("上传成功");
        this.ImgAddr = `<img src="${res.data}" />`;
        this.isbusy = false;
      }
    },

    async bookChapter() {
      let res = await getBookVideo(this.currentItemData.BookId, "");
      this.zhangOfBook = res.data ? res.data : {};
    },
    // 获取科目相关的试题列表
    async getQuesListOfBookZhangJie() {
      let offsetRow = (this.nowPage - 1) * this.rows; 
      let res = await getQuestionOfBook("", {
        bookid: this.currentItemData.BookId,
        question_content: this.currentItemData.QuestionContent,
        zhang: this.currentItemData.Zhang,
        jie: this.currentItemData.Jie,
        topic: this.currentItemData.TopicNo,
        limit: this.rows,
        offset: offsetRow
      });
      this.questionsListOfBook = res.data ? res.data : [];
      this.allRows = res.title;
    },
    // 打开试题的模态框-新增
    openAddQuestionDialog() {
      this.currentQuestionIndex = -1;
      this.currentItemData.QuestionScore = "";
      this.currentItemData.QuestionContent = "";
      this.currentItemData.QuestionType = 1;
      this.currentItemData.A = "";
      this.currentItemData.B = "";
      this.currentItemData.C = "";
      this.currentItemData.D = "";
      this.currentItemData.F = "";
      this.currentItemData.G = "";
      this.currentItemData.H = "";
      this.currentItemData.I = "";

      this.moreOperationDialog = true;
      this.currentItemData.BookId = parseInt(this.$route.query.Id);
    },
    //  打开试题的模态框-编辑
    openEditQuestionDialog(index, row) {
      this.currentQuestionIndex = index;
      this.moreOperationDialog = true;
      this.currentItemData = row;
    },
    // 更新数据列表
    updateQuestionList(type, row) {
      if (type == 0) {
        this.questionsListOfBook.push(row);
        this.moreOperationDialog = false;
      } else if (type == 1) {
        this.questionsListOfBook.splice(this.currentQuestionIndex, 1, row);
        this.moreOperationDialog = false;
      } else if (type == -1) {
        this.moreOperationDialog = false;
      }
    },
    // // 获取试题类型
    // async questionTypes() {
    //   let res = await getQuestionTypes("");
    //   if (res.code == 200) {
    //     this.$store.getters.app.questionTypes = res.data ? res.data : [];
    //   }
    // },
    // 分页获取数据
    currentPageChange(val) {
      this.nowPage = val;
      this.getQuesListOfBookZhangJie();
    }
  }
};
</script>
<style scope >
.QuestionContentImg > img {
  height: 120px;
  width: auto;
}
</style>

