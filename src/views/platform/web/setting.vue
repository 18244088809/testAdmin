<template>
  <div v-cloak class="font16 hgt_full">
    <div class="flex_column hgt_full">
      <div class="flex_1 m-t-20 overflow_auto my_scrollbar p-r-20 p-l-20 p-v-15">
        <el-form label-width="90px" :model="siteItem" style="width:100%">
          <div class="flex_dom">
            <el-form-item label="本校logo">
              <img ref="platformLogo" style="width: 130px; height:130px" />
              <el-upload
                :auto-upload="false"
                action
                :show-file-list="false"
                :on-change="function(file, fileList){return uploadBannerImg(file,fileList)}"
              >
                <i slot="default" class="el-icon-plus"  >&nbsp;点击上传</i>
              </el-upload>
            </el-form-item>
            <el-form-item label="宣传视频" style="width:100%">
              <el-upload
                :auto-upload="false"
                action
                style="width:150px;height:150px"
                :show-file-list="false"
                :on-change="function(file, fileList){return uploadVideoFunc(file,fileList)}"
              >
                <video
                  v-if="siteItem.webSiteVideo"
                  :src="siteItem.webSiteVideo"
                  controls="controls"
                  style="width: auto; height:130px"
                >您的浏览器不支持 video 标签预览。</video>

                <i
                  v-else
                  slot="default"
                  class="el-icon-plus"
                  style="width:130px; height:130px "
                >{{ videoProgress}}</i>
              </el-upload>
            </el-form-item>
          </div>
          <div class="flex_dom">
            <el-form-item label="年招生上限" style="width:100%">
              <label>{{platform.MaxPerYear}}</label>
            </el-form-item>
            <el-form-item label="总招生上限" style="width:100%">
              <label>{{platform.MaxAllYear}}</label>
            </el-form-item>
          </div>
          <el-form-item label="校区介绍" style="width:100%">
            <el-input v-model="platform.Description" placeholder="说明"></el-input>
          </el-form-item>
          <el-form-item label="办公地址" style="width:100%">
            <el-input v-model="platform.Address" placeholder="说明"></el-input>
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
import { GetIndexItem, SetIndexItem } from "@/api/website";
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
      siteItem: {},
      platform: {},
      dataList: [],
      currentPlatform: 0,
      videoProgress: "点击上传"
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
        this.siteItem.logo = res.data;
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
    // getTempKey
    async getTempKey() {
      let that = this;
      let NameValue = "platform-" + that.currentPlatform + "-logo.png";
      let res = await getCosTempKey("", {
        kind: "platform",
        name: NameValue
      });
      var cos = new cosSDK({
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: res.data.Credentials.TmpSecretId,
            TmpSecretKey: res.data.Credentials.TmpSecretKey,
            XCosSecurityToken: res.data.Credentials.Token,
            ExpiredTime: res.data.ExpiredTime // SDK 在 ExpiredTime 时间前，不会再次调用 getAuthorization
          });
        }
      });
      // that.$refs["platformLogo"].src =  "https://platform-1301573799.cos.ap-chengdu.myqcloud.com/platform-167-logo.png";
      // that.siteItem.image =
       
      cos.getObject(
        {
          Bucket: res.data.Bucket /* 必须 */,
          Region: res.data.Region /* 存储桶所在地域，必须字段 */,
          Key: NameValue /* 必须 */
        },
        function(err, data) {
          if (!err) {
 that.$refs["platformLogo"].src = data.Body;
            that.$forceUpdate();
          }
        }
      );
    },
    uploadVideoFunc(file, fileList) {
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
    this.getTempKey();
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
