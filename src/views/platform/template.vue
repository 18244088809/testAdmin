<template>
  <div class="font16 hgt_full" v-cloak>
    <div class="flex_column hgt_full p-t-20">
      <el-table
        tooltip-effect="light"
        :data="templateList"
        border
        style="width: 100%"
        ref="refElTabel"
      >
        <el-table-column prop="url" label="页面地址" width="200"></el-table-column>
        <el-table-column prop="label" label="页面名称"></el-table-column>

        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="warning"
              style="margin:0px;"
              @click="editeTemplate(scope.$index, scope.row)"
            >编辑模板</el-button>
            <el-button
              type="success"
              style="margin:0px;"
              @click="enableTemplate(scope.$index, scope.row)"
            >已上线</el-button>
            <el-button
              type="danger"
              style="margin:0px;"
              @click="deleteTemplate(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="between-center m-v-10">
        <el-button type="primary" @click="createTemplate()">创建页面模板</el-button> 
      </div>
    </div>
    <!-- 弹出框 -->
    <div>
      <!-- 班级相关操作的模态框 -->
      <my-dialog
        :visible.sync="editDialog"
        :title="'【'+classFormData.label+'】页面模板编辑'"
        :showLeft="false"
      >
        <div slot="right_content" class="flex_dom hgt_100">
          <platformTemplateDetail :formItemData="classFormData" :platform="currentPlatform" />
        </div>
      </my-dialog>
    </div>
  </div>
</template> 
<script>
import platformTemplateDetail from "@/views/platform/component/platformTemplateDetail";
import myDialog from "@/components/myDialog/myDialog";
import common from "@/utils/common";
import { getWebTemplate,deleteWebTemplate } from "@/api/platform";
import { isDate } from "xe-utils/methods";
export default {
  name: "templateList",
  components: {
    myDialog,
    platformTemplateDetail
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
      // 班级的列表数据
      templateList: [],
      // 模态框获得的单条班级数据
      classFormData: {},
      // 当前操作的班级数据的索引
      currentIndex: 0,
      // 模态框当前激活的标签页
      activeClassTabs: "bbxy",
      // 控制班级更多操作的弹出框
      moreOperationDialog: false,
      classStudentsDialog: false, 
      searchClassLabel: "",
      searchGrade: new Date(),
      // 当前的校区id
      currentPlatform: 0,
      // 更多操作弹窗
      editDialog: false,
      // 预览图片的图片地址
      imageViewerSrc: "",
      // 显示图片查看器
      showViewer: false
    };
  },
  methods: {
    onChangeTabs(item) {
      item.$children[0].fire();
    },
    // 获取所有班级的列表
    async getAllClass() {
      let that = this;
      let year = 0;
      if (isDate(that.searchGrade)) {
        year = that.searchGrade.getFullYear();
      } else {
        year = that.searchGrade;
      }
      // 取数据的位置
      let offsetRow = (that.nowPage - 1) * that.rows;
      let res = await getWebTemplate(that.currentPlatform + "/all");
      if (res.data) {
        for (var key in res.data) {
          let item = null;
          item = res.data[key];

          // if (key=="business"){

          // } else if (key=="setting"){
          //  item = res.data[key];
          // } else if (key=="index"){
          //  item = res.data[key];
          // } else if (key=="index"){
          //  item = res.data[key];
          // } else if (key=="index"){
          //  item = res.data[key];
          // } else if (key=="index"){
          //  item = res.data[key];
          // } else if (key=="index"){
          //  item = res.data[key];
          // }

          if (item) {
            let jsonItem = JSON.parse(item);
            jsonItem.url = key;
            that.templateList.push(jsonItem);
          }
        }
      }
    },
    // 启用
    enableTemplate(index, row) {
      this.classFormData = { ...row };
      this.classStudentsDialog = true;
      this.currentIndex = index;
    },
    // 编辑
    editeTemplate(index, row) {
      this.classFormData = { ...row };
      this.makeExamDialog = true;
      this.currentIndex = index;
    },

    async deleteTemplate(index, row) {
      let res = await deleteWebTemplate(this.currentPlatform + "/" + row.url);
      this.$message({
        message: "删除成功",
        type: "success"
      });
    },
    // 打开更多操作模态框
    openMoreOptationDialog(index, row) {
      this.classFormData = { ...row };
      this.classFormData.OpenTime = row.OpenTime * 1000;
      this.classFormData.Endtime = row.Endtime * 1000;
      this.classFormData.Createtime = row.Createtime * 1000;
      this.moreOperationDialog = true;
      this.currentIndex = index;
    },
    //打开班级信息模态框
    createTemplate(type) {
      this.classFormData = {};
      this.classFormData.OpenTime = new Date();
      this.classFormData.Endtime = new Date();
      this.classFormData.Createtime = new Date();
      this.editDialog = true;
    },
    // 添加班级成功之后更新表格数据-班级列表
    updateListItem(type, rowData) {
      if (rowData.OpenTime > 1507800391000) {
        rowData.OpenTime = parseInt(rowData.OpenTime / 1000);
      }
      if (rowData.Endtime > 1507800391000) {
        rowData.Endtime = parseInt(rowData.Endtime / 1000);
      }
      if (rowData.Createtime > 1507800391000) {
        rowData.Createtime = parseInt(rowData.Createtime / 1000);
      }
      if (type == 0) {
        this.templateList.unshift(rowData);
      } else if (type == 1) {
        this.$set(this.templateList, this.currentIndex, rowData);
      }
      this.editDialog = false;
    },

    // 格式化日期
    TimeFormatter(row, column, cellValue) {
      return this.common.dateFormat(cellValue);
    },
    // 分页获取数据
    currentPageChange(val) {
      this.nowPage = val;
      this.getAllClass();
    },
    // 条件搜索
    searchSubmit() {
      this.nowPage = 1;
      this.getAllClass();
    }
  },
  mounted() {
    let paths = this.$router.currentRoute.path.split("/");
    this.currentPlatform = parseInt(paths[paths.length - 1]);
    if (isNaN(this.currentPlatform)) {
      this.currentPlatform = 0;
    }
    this.nowPage = 1;
    this.getAllClass();
  }
};
</script>
<style scope>
.el-dialog.exerciseSitaution {
  width: 70% !important;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 30% !important;
  height: 100%;
  min-width: 600px;
  position: relative;
  overflow: auto;
}
.closeDialog:hover {
  color: #2e77f8;
}
</style>