<template>
  <div v-cloak class="font16 hgt_full">
    <div class="flex_column hgt_full">
      <div class="flex_1 m-t-10 overflow_auto my_scrollbar p-r-20 p-l-5">
        <div class="m-b-10" v-for="(item,index) in dataList" :key="index">
          <div class="flex_dom cardBorder"> 
              <el-form label-width="70px" :model="item" style="width:200px" class="bg-f5 p-t-5">
                <el-form-item label="模块名称">
                  <el-input v-model="item.label" style="width:100%" placeholder="填写模块名"></el-input>
                </el-form-item>
                <el-form-item label="是否显示">
                  <el-checkbox v-model="item.display" style="width:100%"></el-checkbox>
                </el-form-item>
                <el-form-item label>
                  <el-button type="primary" @click="openContentEditer(index)">编辑内容</el-button>
                </el-form-item>
              </el-form>
              <div style="width:100%" v-html="item.content" />
          
            <div class="dele_banner" @click="deleBusinessItem(index)">
              <i class="el-icon-error font24 color-999"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="m-v-15">
        <el-button type="primary" @click="addBusinessItem">新 增</el-button>
        <el-button type="success" @click="saveBannerList">保 存</el-button>
      </div>
    </div>
    <my-dialog
      :visible.sync="contentDilag"
      :close-show="true"
      :showLeft="false"
      :title="'【'+currentItem.label+'】模块的内容'"
    >
      <!-- 展示校区的基本信息 -->
      <div slot="right_content" class="p_both20 p-b-20">
        <businessFormData :formItemData="currentItem" @updateRowData="updateList" />
      </div>
    </my-dialog>
  </div>
</template>

<script>
import businessFormData from "@/views/platform/web/component/businessFormData";
import { GetIndexItem, SetIndexItem } from "@/api/website";
import $ImgHttp from "@/api/ImgAPI";
import myDialog from "@/components/myDialog/myDialog";
export default {
  components: {
    businessFormData,
    myDialog
  },
  name: "webBusiness",
  data() {
    return {
      // banner列表
      currentIndex: 0,
      currentItem: { label: "没有模块名" },
      contentDilag: false,
      dataList: [],
      currentPlatform: 0
    };
  },

  methods: {
    async GetWebBusiness() {
      let res = await GetIndexItem(this.currentPlatform + "/business", "");
      if (res.code == 200) {
        this.dataList = res.data ? res.data : [];
      }
    },

    // 编辑或者添加之后更新表格数据-资料列表
    updateList(rowData) {
      this.$set(this.dataList, this.currentIndex, rowData);

      this.contentDilag = false;
    },
    // 保存banner列表
    async saveBannerList() {
      let res = await SetIndexItem(
        this.currentPlatform + "/business",
        "",
        this.dataList
      );
      if (res.code == 200) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      }
    },
    openContentEditer(index) {
      this.currentIndex = index;
      this.contentDilag = true;
      this.currentItem = this.dataList[index];
      this.currentItem.Id = index;
    },
    // 添加banner
    addBusinessItem() {
      this.dataList.unshift({});
    },
    // 删除banner
    async deleBusinessItem(index) {
      this.$confirm("这里删除后还需要点击保存按钮，确定删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        this.dataList.splice(index, 1);
        this.$message({
          message: "删除成功,请最后点击保存按钮",
          type: "success"
        });
      });
    }
  },
  mounted() {
    let paths = this.$router.currentRoute.path.split("/");
    this.currentPlatform = parseInt(paths[paths.length - 1]);
    if (isNaN(this.currentPlatform)) {
      this.currentPlatform = 0;
    }
    this.GetWebBusiness();
  }
};
</script>
<style scoped>
.dele_banner {
  position: absolute;
  right: 5px;
  top: 5px;
}
.cardBorder {
  -webkit-box-shadow: 0 1px 5px 0 #dedede;
  box-shadow: 0 1px 5px 0 #dedede;
  padding: 20px 30px 0px 20px;
  position: relative;
  box-sizing: border-box;
  border-radius: 5px;
  border: 2px dashed rgba(46, 84, 56, 0.2);
}
.el-upload {
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
</style>
