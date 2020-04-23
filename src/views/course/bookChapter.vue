
<template>
  <div v-cloak class="font16 hgt_full">
    <div class="flex_column hgt_full">
      <vxe-toolbar>
        <template v-slot:buttons>
          <el-button v-if="isTableClose" type="primary" @click="expandTables">展开所有</el-button>
          <el-button v-else type="success" @click="closeTables">合闭所有</el-button>
          <span class="m-b-10">当前科目名称：{{ bookLabel }}</span>
          <span v-if="editEnable==false" class="m-b-10 color-red">你无权修改本教材内容。因为你不是本教材的编委成员</span>
        </template>
      </vxe-toolbar>
      <vxe-table
        ref="chapterTreeTable"
        border
        row-id="Id"
        show-overflow
        :tree-config="treeConfig"
        :data.sync="chaperListOfBook"
        height="100%"
        :edit-config="{trigger: 'dblclick', mode: 'row',showIcon:true}"
      >
        <vxe-table-column type="seq" width="120" title="序号" tree-node />
        <vxe-table-column field="SN" title="章节编号" width="100"></vxe-table-column>
        <vxe-table-column field="Label" title="名称" :edit-render="{name: 'input'}" />
        <vxe-table-column title="视频地址">
          <template v-slot="{ row}">
            <div class="flex_dom" style="width:100%" v-if="row.Zhang>0&&row.Jie>0&&row.TopicNo>0">
              <el-upload
                :auto-upload="false"
                action
                :show-file-list="false"
                :on-change="function(file){return uploadVideo(file,row)}"
              >
                <el-button size="mini" type="info">上传视频</el-button>
              </el-upload>
              <el-input class="m-l-10" v-model="row.Video" />
            </div>
          </template>
        </vxe-table-column>

        <vxe-table-column field="Taste" title="允许试读" width="80">
          <template v-slot="{ row}">
            <div v-if="row.Zhang>0&&row.Jie>0&&row.TopicNo>0">
              <select v-model="row.Taste" class="quanke">
                <option :value="0">否</option>
                <option :value="1">是</option>
              </select>
            </div>
          </template>
        </vxe-table-column>
        <vxe-table-column title="操作" width="270">
          <template v-slot="{ row }">
            <div class="between-center">
              <el-button
                v-if="row.Zhang>0&&row.Jie==0&&row.TopicNo==0"
                type="primary"
                size="mini"
                @click="addChildNode(row,true)"
              >添加节</el-button>
              <el-button
                v-else-if="row.Jie>0&&row.TopicNo==0 "
                type="warning"
                size="mini"
                @click="addChildNode(row,false)"
              >添加视频</el-button>
              <div v-else>
                <el-button size="mini" type="info" @click="addQuestion(row,false)">添加试题</el-button>
                <el-button size="mini" type="success" @click="openLinkQuestion(row,false)">关联试题</el-button>
              </div>
              <el-button
                type="danger"
                v-if="!row.Children||row.Children.length==0"
                size="mini"
                @click="deleteChildNode(row)"
              >删除</el-button>
            </div>
          </template>
        </vxe-table-column>
      </vxe-table>
      <div class="between-center m-t-10 m-b-20">
        <el-button type="primary" @click="addChapter">新增章</el-button>
        <el-button v-show="editEnable" type="success" @click="createSubjectChapter">保存</el-button>
      </div>
    </div>

    <my-dialog :visible.sync="addQuestionDialog" :showLeft="false" title="添加考题">
      <div slot="right_content">
        <question-row-dialog
          ref="addQusetionDialog"
          :formItemData="newQuestionItem"
          @subClickEvent="chapterAddQuestionOK"
        ></question-row-dialog>
      </div>
    </my-dialog>
    <my-dialog :visible.sync="linkQuestionDialog" :showLeft="false" title="关联考题">
      <div slot="right_content">
        <linkQuestion
          ref="linkQusetionDialog"
          @linkedQuestion="linkedQuestion"
          :BookChapter="newQuestionItem"
        ></linkQuestion>
      </div>
    </my-dialog>
  </div>
</template>
<script>
import {
  editBookVideo,
  addBookVideo,
  deleBookVideo,
  getBookVideo,
  createBookStructure
} from "@/api/book";
import myDialog from "@/components/myDialog/myDialog";
import questionRowDialog from "@/views/course/question/component/questionRowDialog";
import linkQuestion from "@/views/course/question/component/linkQuestion";
import { string } from "jszip/lib/support";
import common from "@/utils/common";
export default {
  name: "bookChapter",
  components: {
    myDialog,
    questionRowDialog,
    linkQuestion
  },
  data() {
    return {
      isTableClose: false,
      // 书名称
      bookLabel: "",
      // 书的Id
      bookID: 0,
      // 更多操作弹窗
      addQuestionDialog: false,
      linkQuestionDialog: false,
      editEnable: false,
      newQuestionItem: {},
      // 书的章节列表
      chaperListOfBook: [],
      //  列表的children数据
      treeConfig: {
        children: "Children"
      }
    };
  },
  mounted() {
    this.bookID = parseInt(this.$router.currentRoute.query.Id);
    this.getBookChapter();
  },
  methods: {
    // 编辑章节
    editChapter(row) {
      this.$refs.chapterTreeTable.setActiveRow(row);
    },
    //关联试题
    openLinkQuestion(row, isZhang) {
      this.newQuestionItem = { ...row };
      this.newQuestionItem.BookId = this.bookID;
      this.linkQuestionDialog = true;
    },
    linkedQuestion() {
      createBookStructure(this.bookID, "", this.chaperListOfBook);
    },
    uploadVideo(file, row) {
      if (this.editEnable == false) {
        this.$message({
          message: "你不是本教材编委，不能编辑内容",
          type: "error"
        });
        return;
      }
      let NameValue =
        this.bookID +
        "-" +
        row.Zhang +
        "-" +
        row.Jie +
        "-" +
        row.TopicNo +
        "-video.mp4";
      let that = this;
      let res = common.uploadCosFile(
        file,
        "video",
        NameValue,
        function(progressData) {
          row.Video = "上传进度:" + progressData.percent * 100 + "%";
        },
        function(err, data, fileURL) {
          if (!err) {
            that.$message({
              message: "上传成功",
              type: "success"
            });
          } else {
            console.log("cos上传错误:", err);
          }
          row.Video = "https://" + fileURL;
        }
      );
    },
    //直接添加试题
    addQuestion(row, isZhang) {
      this.addQuestionDialog = true;
      this.newQuestionItem = {
        BookId: this.bookID,
        ZhangId: row.Zhang,
        JieId: row.Jie,
        TopicId: row.TopicNo,
        QuestionType: 1,
        QuestionScore: 1,
        BookChapter: row
      };
    },
    chapterAddQuestionOK(type, exerciseQuestion, bookChapter) {
      const rowNode = XEUtils.findTree(
        this.chaperListOfBook,
        item => item.Id === bookChapter.Id,
        this.treeConfig
      );
      if (rowNode) {
        if (!rowNode.item.Questions) {
          rowNode.item.Questions = [];
        }
        rowNode.item.Questions.push(exerciseQuestion.Id);
      }
    },

    deleteChildNode(row) {
      if (this.editEnable == false) {
        this.$alert("您不是本教材的编委成员，请先加入本教材编委");
        return;
      }
      let chapterTreeTable = this.$refs.chapterTreeTable;
      let matchObj = XEUtils.findTree(
        this.chaperListOfBook,
        item => item.Id === row.Id,
        this.treeConfig
      );
      if (matchObj) {
        if (matchObj.item == matchObj.items[matchObj.items.length - 1]) {
          this.$confirm("确认删除吗?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            let { items, index } = matchObj;
            let restRow = items.splice(index, 1)[0];
          });
        } else {
          this.$alert("可以直接修改名字和视频地址即可。不用删");
        }
      }
    },

    // 新增子级节点
    addChildNode(row, isZhang) {
      const that = this;
      const chapterTreeTable = that.$refs.chapterTreeTable;
      let labelStr = "";
      if (isZhang == true) {
        labelStr = "新的节(双击改名)";
      } else {
        labelStr = "新的视频(双击改名)";
      }
      chapterTreeTable
        .createRow({
          Label: labelStr,
          Id: "",
          Children: [],
          Questions: [],
          Taste: 0,
          Video: "",
          TopicNo: 0,
          Zhang: 0,
          Jie: 0,
          SN: ""
        })
        .then(newRow => {
          const rowNode = XEUtils.findTree(
            that.chaperListOfBook,
            item => item.Id === row.Id,
            that.treeConfig
          );
          if (rowNode) {
            rowNode.items.forEach((item, index) => {
              if (item.Id == row.Id) {
                newRow.Zhang = item.Zhang;
                if (isZhang == true) {
                  // 如果是章，那么设置为节
                  newRow.Jie = rowNode.item.Children.length + 1;
                  newRow.SN = "第" + newRow.Jie + "节";
                } else {
                  newRow.Jie = item.Jie;
                  newRow.TopicNo = rowNode.item.Children.length + 1;
                  newRow.SN = "第" + newRow.TopicNo + "点";
                  newRow.Video = "";
                }
                newRow.Id =
                  this.bookID +
                  "-" +
                  newRow.Zhang +
                  "-" +
                  newRow.Jie +
                  "-" +
                  newRow.TopicNo;
                rowNode.items[index].Children.push(newRow);

                chapterTreeTable
                  .refreshData()
                  .then(() => chapterTreeTable.setActiveRow(newRow));
              }
            });
          }
        });
    },

    // // 取消编辑
    // cancelEditChapter(row, index) {
    //   this.$refs.chapterTreeTable.clearActived();
    //   this.$refs.chapterTreeTable.revert(row);
    //   if (row.Id <= 0) {
    //     this.$refs.chapterTreeTable.remove(row);
    //   }
    // },
    expandTables() {
      this.$refs.chapterTreeTable.setAllTreeExpansion(true);
      this.isTableClose = false;
    },
    closeTables() {
      this.$refs.chapterTreeTable.clearTreeExpand();
      this.isTableClose = true;
    },
    // 新增章
    addChapter() {
      const newItem = {
        Id: "",
        Label: "新的章(双击改名)",
        Children: [],
        Taste: 0,
        Video: "",
        TopicNo: 0,
        Zhang: 0,
        Jie: 0,
        SN: 0
      };
      newItem.Zhang = this.chaperListOfBook.length + 1;
      newItem.Id = this.bookID + "-" + newItem.Zhang;
      newItem.SN = "第" + newItem.Zhang + "章";

      this.chaperListOfBook.push(newItem);
    },
    // // 批量删除
    // deleteSelectItems() {
    //   const that = this;
    //   const selectChapterItems = that.$refs.chapterTreeTable.getSelectRecords();
    //   const ids = [];
    //   for (const chapterItem of selectChapterItems) {
    //     ids.push(chapterItem.Id);
    //   }
    //   that
    //     .$confirm("确认删除吗?", "提示", {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning"
    //     })
    //     .then(async () => {
    //       const res = await deleBookVideo({
    //         idlist: ids.toString()
    //       });

    //       that.getBookChapter();
    //       this.$message({
    //         message: "操作成功",
    //         type: "success"
    //       });
    //     })
    //     .catch(() => {});
    // },
    // 获取章节列表
    async getBookChapter() {
      const res = await getBookVideo(this.bookID, {
        limit: 100000,
        offset: 0
      });
      if (res.data.Content) {
        this.chaperListOfBook = JSON.parse(res.data.Content);
      }
      this.bookLabel = res.title;
      this.editEnable = false;
      let editorList = res.data.Editors.split(",");
      editorList.forEach(editorid => {
        if (editorid == this.$store.getters.manager.Id) {
          this.editEnable = true;
        }
      });
    },
    // 生成科目章节
    createSubjectChapter: function() {
      const that = this;
      that
        .$confirm("确认保存吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(async () => {
          if (that.chaperListOfBook.length > 0) {
            const res = await createBookStructure(
              that.bookID,
              "",
              that.chaperListOfBook
            );
            this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        })
        .catch(() => {});
    }
  }
};
</script>
<style scoped>
.el-icon-success {
  color: #1890ff;
  font-size: 24px;
}
.el-icon-error {
  color: #909399;
  font-size: 24px;
}
.quanke {
  width: 40px;
  padding-left: 2px;
  height: 23px;
  border: 1px solid #606266;
  border-radius: 3px;
  color: #606266;
}
</style>
