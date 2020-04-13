<template>
  <div v-cloak class="font16 hgt_full">
    <div class="flex_column hgt_full">
      <div class="flex_1 m-t-20 overflow_auto my_scrollbar p-r-20 p-l-20 p-v-15">
        <el-form label-width="90px" :model="siteItem" style="width:100%">
          <div class="flex_dom">
            <el-form-item label="本校logo" >
              <el-upload
                :auto-upload="false"
                action  style="width:100px"
                :show-file-list="false"
                :on-change="function(file, fileList){return uploadBannerImg(file,fileList)}"
              >
                <img v-if="siteItem.image" :src="siteItem.image" style="width: auto; height:80px" />
                <i
                  v-else
                  slot="default"
                  class="el-icon-plus"
                  style="width:80px; height:80px"
                >&nbsp;点击上传</i>
              </el-upload>
            </el-form-item>
            <el-form-item label="视频介绍" style="width:100%">
            <el-input v-model="siteItem.content" placeholder="说明"></el-input>
          </el-form-item>
          </div>
          <el-form-item label="视频介绍" style="width:100%">
            <el-input v-model="siteItem.content" placeholder="说明"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="m-v-15">
        <el-button type="success" @click="saveBannerList">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>

import { GetIndexItem, SetIndexItem } from "@/api/website";
import $ImgHttp from "@/api/ImgAPI";
import cosSDK from 'cos-js-sdk-v5'
export default {
  name: "webBanner",
  data() {
    return {
      // banner列表
      siteItem: {},
      dataList:[],
      currentPlatform: 0
    };
  },

  methods: {
    async GetIndexBanner() {
      let res = await GetIndexItem(this.currentPlatform + "/webSetting", "");
      if (res.code == 200) {
        this.dataList = res.data ? res.data : [];
      }
    },
    // 图片上传
    async uploadBannerImg(file, fileList) {
      let res = await $ImgHttp.UploadImg("webSetting", file.raw);
      if (res.code == 200) {
        this.siteItem.image = res.data;
        this.$message({
          message: "上传成功",
          type: "success"
        });
        this.$forceUpdate();
      }
    },
    // 保存banner列表
    async saveBannerList() {
      let res = await SetIndexItem(
        this.currentPlatform + "/webSetting",
        "",
        this.siteItem
      );
      if (res.code == 200) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      }
    },
    // 添加banner
    addBannerItem() {
      this.dataList.unshift({});
    },
    // 删除banner
    async deleBannerItem(index) {
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
  border: 1px dashed rgba(46, 84, 56, 0.2);
}
.cardBorder >>> .el-upload {
  width: 100%;
}
.el-icon-plus {
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  position: relative;

  overflow: hidden;
}
</style>
