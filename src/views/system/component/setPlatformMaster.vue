<template>
  <div>
    <div v-if="managerList.length>0">
      <el-radio-group v-model="currentPlatform.MasterID" :disabled="!currenteditEnable">
        <el-radio :label="item.Id" :key="item.Id" v-for="item in managerList">{{item.Realname}}</el-radio>
      </el-radio-group>
      <div class="around-center hgt60 bge0e3ea">
        <el-button
          type="warning"
          :disabled="false"
          v-show="!currenteditEnable"
          class="m-l-40"
          @click="currenteditEnable=true"
        >编辑</el-button>
        <el-button
          type="primary"
          :disabled="false"
          v-show="currenteditEnable"
          class="m-l-40"
          @click="saveFormItemData"
        >确 认</el-button>
        <el-button v-show="currenteditEnable" @click="currenteditEnable=false">取 消</el-button>
      </div>
    </div>
    <span v-else>目前没有老师加入本校，请先给本校添加员工和老师。然后再来从中选择一个当负责人</span>
  </div>
</template>

<script>
import common from "@/utils/common";
import { getAllManagerOfPlatform, setPlatformMaster } from "@/api/platform";
export default {
  props: {
    // 校区的表单数据
    formItemData: {
      type: Object,
      default: function() {
        return { Id: 0 };
      }
    },
    platformMaster: {
      type: Number,
      default: function() {
        return 0;
      }
    }
  },
  data() {
    return {
      currentPlatform: {},
      currenteditEnable: false,
      managerList: []
    };
  },
  watch: {
    formItemData(newvar) {
      this.fire();
    }
  },
  mounted() {},
  methods: {
    fire() {
      if (!this.formItemData || !this.formItemData.Id) {
        return;
      }
      this.currentPlatform = this.formItemData;

      this.getAllManagerOfThisPlatform();
    },
    async getAllManagerOfThisPlatform() {
      let res = await getAllManagerOfPlatform(this.currentPlatform.Id, "");
      this.managerList = res.data ? res.data : [];
    },
    // 添加或编辑数据
    async saveFormItemData() {
      let res = await setPlatformMaster(
        this.formItemData.Id,
        { masterid: this.currentPlatform.MasterID, add: 1 },
        ""
      );
      this.currentPlatform = res.data;
      this.$message({
        message: "修改成功",
        type: "success"
      });
    }
  }
};
</script>  