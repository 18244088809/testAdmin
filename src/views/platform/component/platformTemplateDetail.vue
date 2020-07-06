<template>
  <!-- --------------------数据编辑或者添加表单组件----------------------- -->
  <div class="m-l-20 m-r-20 wid_100">
    <el-form class="m-t-10" size="small" label-width="80px">
      <div class="flex_dom">
        <el-form-item label="页面地址" prop="url" style="width:40%">
          <el-input placeholder="只允许输入英文字母和数字" v-model="currentItemData.url" class="m-r-50"></el-input>
        </el-form-item>
        <el-form-item label="页面名称" prop="label" style="width:40%">
          <el-input placeholder="请输入此页面标题" v-model="currentItemData.label" class="m-r-50"></el-input>
        </el-form-item>
        <el-form-item label prop="label" style="width:20%">
          <el-button type="primary" @click="saveNewsFormData">保存</el-button>
        </el-form-item>
      </div>
    </el-form>
    <el-tabs type="border-card" @tab-click="selectViewModel">
      <el-tab-pane>
        <span slot="label">
          <i class="el-icon-sugar">源码编辑器</i>
        </span>
        <el-input
          type="textarea"
          :rows="(documentHeight/15)"
          v-model="currentItemData.content"
          :id="currentItemData.Id"
        ></el-input>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label">
          <i class="el-icon-cold-drink">预览</i>
        </span>
        <div v-html="currentItemData.content"  ></div>
      </el-tab-pane>
    </el-tabs>

    <div class="flex_dom wid_100 m-b-20"></div>
  </div>
</template>

<script> 
import { getWebTemplate, setWebTemplate } from "@/api/platform";
import common from "@/utils/common";
import $ImgAPI from "@/api/ImgAPI";
export default {
  name: "newsForm",
  props: {
    // 表单数据
    formItemData: {
      type: Object,
      default: function() {
        return { Id: 0, icon: "/upload/icon/Icon-DOCX.png" };
      }
    },
    platform: {
      typ: Number,
      default: 0
    },
    college: {
      typ: Number,
      default: 0
    }
  },
  components: {
    
  },
  data() {
    return {
      common,

      documentHeight: 500,

      // 表单验证
      newsFormRules: {
        Title: [{ required: true, message: "标题不能为空", trigger: "blur" }]
      },
      currentItemData: this.formItemData
    };
  },
  watch: {
    formItemData(newvar) {
      this.setData();
    },
    platform(newvar) {
      this.setData();
    },
    college(newvar) {
      this.setData();
    }
  },
  mounted() {
    this.setData();
  },
  methods: {
    setData() {
      this.currentItemData = this.formItemData;
      this.documentHeight = document.body.clientHeight - 400;
    },
    selectViewModel(item) {
      if (item.$children[0].id == this.platform) {
        item.$children[0].setContent(this.currentItemData.content);
      }
    },
    formatTooltipFunc(value) {
      if (this.common.docRightmarks[value]) {
        return "允许下载" + this.common.docRightmarks[value].label + "的资料";
      }
      return "";
    },
    // 上传的图片
    async newsImgUpload(file) {
      let that = this;
      let res = await $ImgAPI.UploadImg("news", file.raw);
      if (res.code == 200) {
        that.currentItemData.icon = res.data;
      } else {
        that.$message({
          message: res.title,
          type: "warning"
        });
      }
    },
    // 上传附件
    async uploadEnclosure(file) {
      // 上传附件之前的验证
      let that = this;
      let RightType = this.common.beforeUploadEnclosure(file.name);
      if (RightType) {
        let res = await $ImgAPI.UploadImg("news", file.raw);
        if (res.code == 200) {
          that.currentItemData.Downfile = res.data;
        } else {
          that.$message({
            message: res.title,
            type: "warning"
          });
        }
      } else {
        this.$message({
          message: RightType,
          type: "warning"
        });
      }
    },
    // 添加或编辑数据
    async saveNewsFormData() {
      // 添加数据  getWebTemplate,setWebTemplate
      let res = await setWebTemplate(
        this.platform + "/" + this.currentItemData.url,
        "",
        this.currentItemData
      );

      this.isShowPlatformDialog = false;
      // this.currentItemData = res.data;
      this.$message({
        message: "添加成功",
        type: "success"
      });
      // this.$emit("updateRowData", res.data, 0);
    },
    // 取消编辑或者添加
    cancleUpdate() {
      this.$emit("updateRowData");
    }
  }
};
</script> 
<style scoped>
</style>