<template>
  <div class="pad20" v-cloak>
    <el-form
      :model="currentItemData"
      label-width="80px"
      ref="refQuestionForm"
      :rules="questionFormRules"
    >
      <div class="between-center">
        <el-form-item label="隶属于" class="flex_1">
          <span>第{{currentItemData.ZhangId}} 章 - 第{{currentItemData.JieId}} 节 - 第{{currentItemData.TopicId}} 知识点</span>
        </el-form-item>

        <el-form-item label="题型" class="flex_1" style="width:300px">
          <el-select
            @change="getQuestionRow"
            v-model="currentItemData.QuestionType"
            :disabled="currentItemData.Id>0"
            placeholder="请选择题型"
          >
            <el-option
              :label="item.Label"
              :key="index"
              :value="item.ID"
              v-for="(item,index) in $store.getters.app.questionTypes"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分值" prop="QuestionScore" class="flex_1">
          <el-input-number
            :min="1"
            v-model="currentItemData.QuestionScore"
            controls-position="right"
            :step="0.5"
          ></el-input-number>
        </el-form-item>
        <el-form-item class="flex_1 center">
          <el-radio v-model="State" :label="1">上架</el-radio>
          <el-radio v-model="State" :label="0">下架</el-radio>
        </el-form-item>
      </div>
      <el-form-item label="题干" prop="QuestionContent">
        <el-input
          type="textarea"
          :rows="3"
          @input="$forceUpdate()"
          placeholder="请输入内容"
          v-model="currentItemData.QuestionContent"
        ></el-input>
      </el-form-item>
      <el-form-item label="答案解析" prop="QuestionAnalyse">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="请输入解析内容，学员需要的时候用来给学员分析原因。"
          v-model="currentItemData.QuestionAnalyse"
        ></el-input>
      </el-form-item>
      <el-form-item label="作答提示" class="flex_1" prop="VideoAnalyse">
        <el-input
          v-model="currentItemData.VideoAnalyse"
          placeholder="请填写视频地址，如 http://www.te.com.cn/d.mp4 或 /test/video.mp4"
        ></el-input>
      </el-form-item>
      <!-- 添加选项 -->
      <!-- <el-form-item label="选项操作" class="bg-eee">
        
      </el-form-item>-->
      <!-- 单选题,判断题 -->
      <el-form-item label="选项">
        <div v-if="currentItemData.QuestionType==1||currentItemData.QuestionType==3">
          <div class="center flex_wrap" style="width:100%">
            <div
              :key="index"
              v-for="(option,index) in quesAnswerOptions"
              class="center m-l-20 m-v-5 optionAnswer"
            >
              <el-radio
                v-model="currentItemData.QuestionAnswer"
                :label="option.tag"
                :value="option.tag"
              ></el-radio>
              <el-input type="textarea" :rows="2" placeholder="请输入选项内容" v-model="option.content"></el-input>
            </div>
          </div>
        </div>
        <!-- 多选题-编辑-->
        <div v-else-if="currentItemData.QuestionType==2">
          <div class="center flex_wrap" style="width:100%">
            <div
              :key="index"
              v-for="(option,index) in quesAnswerOptions"
              class="center m-l-20 m-v-5 optionAnswer"
            >
              <el-checkbox v-model="quesCheckboxAnswer" :label="option.tag">{{option.tag}}</el-checkbox>
              <el-input type="textarea" :rows="2" placeholder="请输入选项内容" v-model="option.content"></el-input>
            </div>
          </div>
        </div>
        <div v-else-if="currentItemData.QuestionType==4">
          <div class="center flex_wrap" style="width:100%">不需要选项， 学员自己在答题框里写文字作答</div>
        </div>
      </el-form-item>

      <el-form-item label="工具栏" class="bg-eee">
        <!-- 添加选项 -->
        <div class="between-center">
          <div>
            <el-button @click="addQuestionOption">添加选项</el-button>
            <el-button @click="deleteQuestionOption">删除最后项</el-button>
          </div>
          <el-upload
            :auto-upload="false"
            action
            class="m-l-10"
            v-loading="isbusy"
            :show-file-list="false"
            :on-change="function(file, fileList){return ImgUploadQuestion(file, fileList)}"
          >
            <el-button>上传图片</el-button>
          </el-upload>
          <el-tooltip
            class="item cursor"
            effect="dark"
            content="点击复制后贴到任何你想要放图片的题干或者选项里"
            placement="top"
          >
            <span class="tag-read" :data-clipboard-text="ImgAddr" @click="copyText">{{ImgAddr}}</span>
          </el-tooltip>
          <el-button type="primary" @click="saveQuestion">确 认</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import $ImgHttp from "@/api/ImgAPI";
import { editQuestion, addQuestion } from "@/api/exercise";
import common from "@/utils/common";
export default {
  props: {
    // 表单数据
    formItemData: {
      type: Object,
      default: function() {
        return {
          Id: 0,
          Zhang: 1,
          Jie: 1,
          BookId: 0,
          QuestionType: 1,
          QuestionScore: 1
        };
      }
    }
  },
  data() {
    return {
      common,
      // 上传图片加载中的状态
      isbusy: false,
      // 图片地址
      ImgAddr: "",
      // 选项字母
      words: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
      // 题型信息
      currentItemData: {},
      State: 1,
      // 多选题答案
      quesCheckboxAnswer: [],
      // 存放题的选项
      quesAnswerOptions: [
        {
          tag: "A",
          content: ""
        }
      ],
      // 表单验证
      questionFormRules: {
        QuestionScore: [
          { required: true, message: "请填写题的分值", trigger: "blur" }
        ],
        QuestionContent: [
          { required: true, message: "请填写题干内容", trigger: "blur" }
        ],
        QuestionAnalyse: [
          { required: true, message: "解析至少要写几个字", trigger: "blur" }
        ]
      }
    };
  },
  watch: {
    formItemData(newval) {
      this.setData();
      this.getQuestionRow();
    }
  },
  mounted() {
    this.setData();
    this.getQuestionRow();
  },
  methods: {
    setData() {
      this.currentItemData = this.formItemData;
    },
    // 从父组件获取的值
    getQuestionRow() {
      // 初始化值
      this.isbusy = false;
      this.ImgAddr = "";
      this.quesCheckboxAnswer = [];
      if (this.currentItemData.Id > 0) {
        if (this.currentItemData.QuestionType == 2) {
          this.quesCheckboxAnswer = this.currentItemData.QuestionAnswer.split(
            ""
          );
        }
        // 遍历选项
        let Options = [];
        this.words.forEach(word => {
          for (let keyName in this.currentItemData) {
            if (keyName == word && this.currentItemData[keyName].length > 0) {
              Options.push({
                content: this.currentItemData[keyName],
                tag: keyName
              });
            }
          }
        });
        this.quesAnswerOptions = Options;
      } else {
        this.quesCheckboxAnswer = ["A"];
        this.quesAnswerOptions = [
          {
            tag: "A",
            content: ""
          }
        ];
      }
      if (this.currentItemData.QuestionType == 4) {
        this.currentItemData.QuestionAnswer = " ";
      }
    },
    // 复制文本
    copyText() {
      let clipboard = new this.clipboard(".tag-read");
      clipboard.on("success", e => {
        clipboard.destroy();
      });
      clipboard.on("error", e => {
        clipboard.destroy();
      });
    },
    // 题库上传图片
    async ImgUploadQuestion(file, fileList) {
      this.isbusy = true;
      let res = await $ImgHttp.UploadImg("exercise", file.raw);
      if (res.code == 200) {
        this.$message({
          message: "操作成功",
          type: "success"
        });
        this.ImgAddr = `<img src="${res.data}" />`;
        this.isbusy = false;
      }
    },
    // 修改数据
    saveQuestion() {
      this.currentItemData.State = this.State;
      this.$refs.refQuestionForm.validate(async valid => {
        if (valid) {
          if (!this.currentItemData.Options) {
            this.currentItemData.Options = [];
          }
          // 处理选项
          this.quesAnswerOptions.forEach(item => {
            if (item.content) {
              this.currentItemData.Options.push(item.content);
            }
          });
          // 处理多选题答案
          if (this.currentItemData.QuestionType == 2) {
            this.currentItemData.QuestionAnswer = this.quesCheckboxAnswer.join(
              ""
            );
          }

          if (this.currentItemData.QuestionType != 4) {
            if (
              !this.currentItemData.QuestionAnswer ||
              this.currentItemData.QuestionAnswer == ""
            ) {
              this.$message({
                message: "必须勾选一个正确答案",
                type: "warning"
              });
              return;
            }
          }
          if (!this.currentItemData.Questions) {
            this.currentItemData.Questions = [];
          }

          let res;
          // 修改数据
          if (this.currentItemData.Id > 0) {
            res = await editQuestion(
              this.currentItemData.Id,
              "",
              this.currentItemData
            );
            if (res.code == 200) {
              this.$emit(
                "subClickEvent",
                1,
                res.data,
                this.currentItemData.BookChapter
              );
            }
          } else if (!this.currentItemData.Id || this.currentItemData.Id == 0) {
            res = await addQuestion("", "", this.currentItemData);
            if (res.code == 200) {
              this.$emit(
                "subClickEvent",
                0,
                res.data,
                this.currentItemData.BookChapter
              );
            }
          }
          this.currentItemData.Questions.push(res.data.Id);
       
          this.$message({
            message: "操作成功",
            type: "success"
          });
        } else {
          return false;
        }
      });
    },
    // 添加选项
    addQuestionOption() {
      let addTag = 65 + this.quesAnswerOptions.length;
      if (addTag < 80) {
        let tagName = String.fromCharCode(addTag);
        this.quesAnswerOptions.push({ tag: tagName, content: "" });
      }
    },
    // 删除选项
    deleteQuestionOption() {
      if (this.quesAnswerOptions.length > 0) {
        let obj = this.quesAnswerOptions[this.quesAnswerOptions.length - 1];
        if (this.currentItemData.QuestionType == 2) {
          let index = this.quesCheckboxAnswer.indexOf(obj.tag);
          if (index != -1) {
            this.quesCheckboxAnswer.splice(index, 1);
          }
        } else {
          if (this.currentItemData.QuestionAnswer == obj.tag) {
            this.currentItemData.QuestionAnswer = "";
          }
        }
        this.quesAnswerOptions.pop();
      }
    }
  }
};
</script>
<style scope>
.optionAnswer >>> .el-checkbox:last-of-type {
  margin-right: 5px;
}
.optionAnswer >>> .el-radio {
  margin-right: 5px;
}
</style>

