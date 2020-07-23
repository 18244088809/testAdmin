<template>
  <div class="font16 hgt_full" v-cloak>
    <platformRowDetail :formItemData="customFormData" />
  </div>
</template> 
<script>
import platformRowDetail from "@/views/system/component/platformRowDetail";
import common from "@/utils/common";
export default {
  name: "platformSetting",
  components: {
    platformRowDetail
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
      documentHeight: 500
    };
  },
  methods: {},
  mounted() {
    let paths = this.$router.currentRoute.path.split("/");
    this.currentPlatform = parseInt(paths[paths.length - 1]);
    if (isNaN(this.currentPlatform)) {
      this.currentPlatform = 0;
      this.$message({
        message: "没有这个校区",
        type: "warning"
      });
      return;
    }

  //  let res = await updatePlatform(
  //             this.currentItemData.Id,
  //             "",
  //             this.currentItemData
  //           );



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