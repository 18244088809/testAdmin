<template>
  <!-- --------------------数据编辑或者添加表单组件----------------------- -->
  <div class="m-l-20 wid_100">
    <el-form class="m-t-10" size="small" label-width="80px">
      <div class="flex_dom">
        <el-form-item label="页面地址" prop="url" style="width:250px">
          <el-input placeholder="只允许输入英文字母和数字" v-model="currentItemData.url"></el-input>
        </el-form-item>
        <el-form-item label="备注.说明" prop="label" style="width:250px">
          <el-input placeholder="请输入备注" v-model="currentItemData.label"></el-input>
        </el-form-item>
        <el-form-item style="width:100%">
          <div style="display: flex">
            <el-upload
              :auto-upload="false"
              action
              :show-file-list="false"
              :on-change="function(file){return uploadEnclosure(file )}"
            >
              <el-button type="info">上传资源</el-button>
            </el-upload>
            <el-tooltip
              class="item cursor"
              style="width:100%"
              effect="dark"
              content="点击复制后贴到任何你想要放的地方"
              placement="top"
            >
              <span
                class="tag-read"
                style="width:100%"
                :data-clipboard-text="fileURL"
                @click="copyText"
              >   {{fileURL}}</span>
            </el-tooltip>

            <el-button type="success" @click="previewPage" class="m-r-10">预览</el-button>
            <el-button type="primary" @click="saveNewsFormData">保存</el-button>
          </div>
        </el-form-item>
      </div>
    </el-form>
     <el-input
          type="textarea"
          :rows="(documentHeight/13)"
          v-model="currentItemData.content"
          :id="currentItemData.Id"
        ></el-input>
    <!-- <el-tabs>
      <el-tab-pane label="a">
        <el-input
          type="textarea"
          :rows="(documentHeight/13)"
          v-model="currentItemData.content"
          :id="currentItemData.Id"
        ></el-input>
      </el-tab-pane>
      <el-tab-pane label="b">
        <div style="width:100%;height:100px" v-html="currentPreviewHtml"></div>
      </el-tab-pane>
    </el-tabs> -->

    <div >
      <el-dialog
        :visible.sync="previewPageEnable"
        width="100%" :modal="false"
        append-to-body  
        :title="currentItemData.label "
        @close="previewPageEnable=false"
      > 
      <div style="width:100%;top:50px " v-html="currentPreviewHtml"></div> 
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getWebTemplate, setWebTemplate, previewWebPage,reviewWebPage } from "@/api/platform";
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
  components: {},
  data() {
    return {
      common,

      documentHeight: 500,
      fileURL: "   可上传 js  css png jpg gif等网页资源",
      // 表单验证
      newsFormRules: {
        Title: [{ required: true, message: "标题不能为空", trigger: "blur" }]
      },
      currentItemData: this.formItemData,
      currentPreviewHtml: "",
      previewPageEnable: false,
      previewSRC:""

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
      this.documentHeight = document.body.clientHeight - 410;
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
    async previewPage() {
      let res = await previewWebPage(
        this.platform + "/" + this.currentItemData.url,
        { label: this.currentItemData.label },
        this.currentItemData.content
      );
    this.currentPreviewHtml = res;
      this.previewPageEnable = true;
    },

    // 上传附件
    async uploadEnclosure(file) {
      // 上传附件之前的验证
      let that = this;

      let res = await $ImgAPI.UploadImg("platform?originname=true", file.raw);
      if (res.code == 200) {
        that.fileURL = res.data;
      } else {
        that.$message({
          message: res.title,
          type: "warning"
        });
      }
    },
    // 添加或编辑数据
    async saveNewsFormData() {
      // 添加数据  getWebTemplate,setWebTemplate
      let res = await setWebTemplate(
        this.platform + "/" + this.currentItemData.url,
        { label: this.currentItemData.label },
        this.currentItemData.content
      );

      this.isShowPlatformDialog = false;
      this.$message({
        message: "添加成功",
        type: "success"
      });
      let item = this.currentItemData;
      item.content = res.data;
      this.$emit("updateRowData", item);
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