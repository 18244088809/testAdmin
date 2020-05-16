<template>
  <div v-cloak class="font16 hgt_full">
    <div class="flex_column hgt_full">
      <div class="flex_1 m-t-20 overflow_auto my_scrollbar p-r-10 p-l-20 p-v-15">
        <div class="m-b-20" v-for="(item,index) in dataList" :key="index">
          <div class="flex_mid cardBorder bg-ddd">
            <el-upload
              :auto-upload="false"
              action
              class
              :show-file-list="false"
              :on-change="function(file, fileList){return uploadBannerImg(file,fileList,index)}"
            >

            <div :class="makeEffect(item)">
                <a href="#">
                  <div class="spinner"></div>
                  <div class="img">
                    <img :src="item.image" />
                  </div>
                  <div class="info">
                    <div class="info-back">
                      <h3 >{{item.label}}</h3>
                      <p style="padding-top:-20px" >{{item.content}}</p>
                    </div>
                  </div>
                </a>
              </div> 
            </el-upload>

            <el-form label-width="60px" :model="item" style="width:100%">
              <div class="flex_dom">
                <el-form-item label="姓名:" style="width:250px">
                  <el-input v-model="item.label" style="width:100%" placeholder="老师姓名"></el-input>
                </el-form-item>
                <el-form-item label="" class="m-l-5" >
                  <el-radio-group v-model="item.xingzhuang" @change="$forceUpdate()">
                    <el-radio  label="circle">圆形</el-radio>
                    <el-radio  label="square">方形</el-radio>
                  </el-radio-group>
                </el-form-item>
                <!-- <el-form-item label="" class="m-l-5" >
                  <el-radio-group v-model="item.colored" @change="$forceUpdate()">
                    <el-radio  :label="'noclored'">透明</el-radio>
                    <el-radio  :label="'colored'">带色</el-radio>
                  </el-radio-group>
                </el-form-item> -->
                <el-form-item label="动效:" class="m-l-5" >
                  <el-radio-group v-model="item.effect" @change="$forceUpdate()">
                    <el-radio  label="1">1</el-radio>
                    <el-radio  label="2">2</el-radio>
                    <el-radio label="3">3</el-radio>
                    <el-radio  label="4">4</el-radio>
                    <el-radio  label="5">5</el-radio>
                    <el-radio  label="6">6</el-radio>
                    <el-radio  label="7">7</el-radio>
                    <el-radio  label="8">8</el-radio>
                    <el-radio  label="9">9</el-radio>
                    <el-radio  label="10">10</el-radio>
                    <el-radio  label="11">11</el-radio>
                    <el-radio  label="12">12</el-radio>
                    <el-radio  label="13">13</el-radio>
                    <el-radio  label="14">14</el-radio>
                    <el-radio  label="15">15</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item v-if="item.xingzhuang=='square'" label="方向" class="m-l-5">
                  <el-radio-group v-model="item.fangxiang" @change="$forceUpdate()">
                    <el-radio label="left_and_right">左右</el-radio>
                    <el-radio  label="top_to_bottom">上下1</el-radio>
                    <el-radio  label="bottom_to_top">下上</el-radio>
                    <el-radio label="from_top_and_bottom">上下2</el-radio>
                    <el-radio label="from_left_and_right">上下2</el-radio>
                    <el-radio label="scale_up">放大</el-radio>
                    <el-radio label="scale_down">缩小</el-radio>
                    <el-radio label="left_to_right">左到右</el-radio>
                    <el-radio label="right_to_left">右到左</el-radio> 
                  </el-radio-group>
                </el-form-item>
              </div>
              <el-form-item label="简介">
                <el-input type="textarea" rows="5" v-model="item.content" placeholder="老师的介绍"></el-input>
              </el-form-item>
            </el-form>

            <div class="dele_banner" @click="deleBannerItem(index)">
              <i class="el-icon-error font24 color-999"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="m-v-15">
        <el-button type="primary" @click="addBannerItem">新 增</el-button>
        <el-button type="success" @click="saveBannerList">保 存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getWebContent, setWebContent } from "@/api/platform";
import $ImgHttp from "@/api/ImgAPI";
export default {
  name: "webTeacher",
  data() {
    return {
      // banner列表
      dataList: [],
      currentPlatform: 0
    };
  },

  methods: {
    makeEffect(item) {
      let effe = "";
      if (!item.xingzhuang) {
        item.xingzhuang = "circle";
      }
      // if (!item.colored||item.colored=="noclored") {
      //   }
        item.colored = "colored";
      if (!item.effect) {
        item.effect = "effect6";
      } else {
        effe = "effect" + item.effect;
      }
      if (!item.fangxiang) {
        item.fangxiang = "scale_up";
      }
      return (
        "ih-item " +
        item.xingzhuang +
        " " +
        item.colored +
        " " +
        effe +
        " m-l-40 " +
        item.fangxiang
      );
    },
    async GetIndexBanner() {
      let res = await getWebContent(this.currentPlatform + "/teacher", "");
      if (res.code == 200) {
        this.dataList = res.data ? res.data : [];
      }
    },
    // 图片上传
    async uploadBannerImg(file, fileList, index) {
      let res = await $ImgHttp.UploadImg("teacher", file.raw);
      if (res.code != 200) {
        this.$message({
          message: res.data,
          type: "warning"
        });
        return;
      }
      this.dataList[index].image = res.data;
      this.$message({
        message: "上传成功",
        type: "success"
      });
      this.$forceUpdate();
    },
    // 保存banner列表
    async saveBannerList() {
      let res = await setWebContent(
        this.currentPlatform + "/teacher",
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
    this.GetIndexBanner();
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
  padding: 20px 30px 20px 20px;
  position: relative;
  box-sizing: border-box;
  border-radius: 5px;
  border: 1px dashed rgba(46, 84, 56, 0.2);
}
.el-upload {
  border: 1px dashed #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
</style>
