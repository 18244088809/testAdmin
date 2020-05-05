<template>
  <div v-cloak class="font16 hgt_full">
    <div class="flex_column hgt_full">
      <div class="flex_1 m-t-20 overflow_auto my_scrollbar p-r-20 p-l-20 p-v-15">
        <el-form   :model="platformWeb" style="width:100%">
          <div class="flex_dom">
            <el-form-item label="官网logo" style="width:100%">
              <img :src="platformWeb.logo" style="width: 130px; height:130px" />
              <el-upload
                :auto-upload="false"
                action
                :show-file-list="false"
                :on-change="function(file){return uploadBannerImg(file,'logo')}"
              >
                <i slot="default" class="el-icon-plus">&nbsp;点击上传</i>
              </el-upload>
            </el-form-item>
            <el-form-item label="浏览器图标" style="width:100%">
              <img :src="platformWeb.shortcut" style="width: 130px; height:130px" />
              <el-upload
                :auto-upload="false"
                action
                :show-file-list="false"
                :on-change="function(file){return uploadBannerImg(file,'shortcut')}"
              >
                <i slot="default" class="el-icon-plus">&nbsp;点击上传</i>
              </el-upload>
            </el-form-item>
            <el-form-item label="小程序二维码" style="width:100%">
              <img :src="platformWeb.xcxlogo" style="width: 130px; height:130px" />
              <el-upload
                :auto-upload="false"
                action
                :show-file-list="false"
                :on-change="function(file){return uploadBannerImg(file,'xcxlogo')}"
              >
                <i slot="default" class="el-icon-plus">&nbsp;点击上传</i>
              </el-upload>
            </el-form-item>
            <el-form-item label="宣传图片" style="width:100%">
              <img :src="platformWeb.webSiteVideoImage" style="width: 130px; height:130px" />
              <el-upload
                :auto-upload="false"
                action
                :show-file-list="false"
                :on-change="function(file){return uploadBannerImg(file,'webSiteVideoImage')}"
              >
                <i slot="default" class="el-icon-plus">&nbsp;点击上传</i>
              </el-upload>
            </el-form-item>
            <el-form-item label="宣传视频" style="width:100%">
              <el-upload
                :auto-upload="false"
                action
                style="width:150px;height:150px"
                :show-file-list="false"
                :on-change="function(file){return uploadVideoFunc(file)}"
              >
                <video
                  :src="platformWeb.webSiteVideo"
                  controls="controls"
                  preload="metadata"
                  style="width: auto; height:130px"
                >您的浏览器不支持 video 标签预览。</video>
                <i slot="default" class="el-icon-plus">{{ videoProgress}}</i>
              </el-upload>
            </el-form-item>
          </div>
          <div class="flex_dom">
            <el-form-item label="官网名称" style="width:100%">
              <el-input v-model="platformWeb.Label" placeholder="校区名称."></el-input>
            </el-form-item>
            <el-form-item label="联系人" style="width:100%">
              <el-input v-model="platformWeb.Administrator" placeholder="联系人."></el-input>
            </el-form-item>
            <el-form-item label="联系电话" style="width:100%">
              <el-input v-model="platformWeb.Telephone" placeholder="联系电话."></el-input>
            </el-form-item>
            <el-form-item label="联系邮箱" style="width:100%">
              <el-input v-model="platformWeb.Email" placeholder="联系邮箱"></el-input>
            </el-form-item>
          </div>
          <el-form-item label="官网介绍" style="width:100%">
            <el-input
              type="textarea"
              :rows="2"
              v-model="platformWeb.Description"
              placeholder="这些文字会显示在 官网里，请及时修改"
            ></el-input>
          </el-form-item>
          <el-form-item label="办公地址" style="width:100%">
            <el-input v-model="platformWeb.Address" placeholder="办公地址"></el-input>
          </el-form-item>
          <el-form-item label="官网网址" style="width:100%">
            <span v-if="platform.Domain">{{platform.Domain}}</span>
            <span v-else>如果需要独立域名请联系总部管理员</span>
          </el-form-item>
          <el-form-item label="官网备案号" style="width:100%">
            <el-input v-model="platformWeb.Beian" placeholder="请填写正确的备案号，否则网站要被官方查封"></el-input>
          </el-form-item>
          <el-form-item label="在线报名背景图" style="width:100%">
            <img :src="platformWeb.zxbm" style="width: 130px; height:130px" />
            <el-upload
              :auto-upload="false"
              action
              :show-file-list="false"
              :on-change="function(file){return uploadBannerImg(file,'zxbm')}"
            >
              <i slot="default" class="el-icon-plus">&nbsp;点击上传</i>
            </el-upload>
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
import platformRowDetail from "@/views/system/component/platformRowDetail";
import { setWebSiteInfo, getWebSiteInfo } from "@/api/platform";
import { getCosTempKey } from "@/api/cos";
import common from "@/utils/common";
import $ImgHttp from "@/api/ImgAPI";
import cosSDK from "cos-js-sdk-v5";
export default {
  name: "webBanner",
  components: {
    platformRowDetail
  },
  data() {
    return {
      // banner列表
      platform: {},
      platformWeb: {},
      currentPlatform: 0,
      videoProgress: "点击上传"
    };
  },

  methods: {
    async GetWebSetting() {
      let res = await getWebSiteInfo(this.currentPlatform, "");
      if (res.code == 200) {
        this.platformWeb = res.data;
        this.$store.getters.app.platformList.forEach(item => {
          if (item.Id == res.title) {
            this.platform = item;
          }
        });
      }
    },
    // 图片上传
    async uploadBannerImg(file, item) {
      let res = await $ImgHttp.UploadImg("webSetting", file.raw);
      if (res.code != 200) {
        this.$message({
          message: res.data,
          type: "warning"
        });
        return;
      }
      this.platformWeb[item] = res.data;
      this.$message({
        message: "上传成功",
        type: "success"
      });
      this.$forceUpdate();
    },
    // 保存banner列表
    async saveBannerList() {
      let that = this;
      let res = await setWebSiteInfo(
        this.currentPlatform,
        "",
        that.platformWeb
      );
      if (res.code == 200) {
        that.$message({
          message: "保存成功",
          type: "success"
        });
      }
    },

    uploadVideoFunc(file) {
      let NameValue = this.currentPlatform + "-video.mp4";
      let that = this;
      let res = common.uploadCosFile(
        file,
        "platform",
        NameValue,
        function(progressData) {
          that.videoProgress = "上传进度:" + progressData.percent * 100 + "%";
        },
        function(err, data) {
          if (!err) {
            that.$message({
              message: "上传成功",
              type: "success"
            });
            that.platformWeb.webSiteVideo = "https://" + data.Location;
          } else {
            console.log("cos上传错误:", err);
          }
        }
      );
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
    this.GetWebSetting();
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
