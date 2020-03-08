<template>
  <div>
    <el-form
      ref="formUI"
      :disabled="currenteditEnable==false"
      :model="currentItemData"
      :rules="platFormInfoRules"
      style="padding:20px 10px 10px 10px"
      label-width="80px"
      size="small"
    >
      <el-form-item label="名称" prop="Label">
        <el-input v-model="currentItemData.Label" />
      </el-form-item>
      <el-form-item label="联系电话" prop="Telephone">
        <el-input v-model="currentItemData.Telephone" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="currentItemData.Address" />
      </el-form-item>
      <!-- 校区负责人 -->
      <el-form-item label="负责人">{{currentItemData.MasterLabel}}</el-form-item>
      <el-form-item label="备注">
        <el-input v-model="currentItemData.Description" />
      </el-form-item>
    </el-form>
    <div class="around-center marg20">
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
        @click="savecurrentFormData"
      >确 认</el-button>
      <el-button v-show="currenteditEnable" @click="currenteditEnable=false">取 消</el-button>
    </div>
  </div>
</template>

<script>
import { addPlatform, updatePlatform } from "@/api/platform";
export default {
  props: {
    // 校区的表单数据
    formItemData: {
      type: Object,
      default: function() {
        return { Id: 0 };
      }
    },
    editEnable: {
      typ: Boolean,
      default: false
    }
  },
  name: "PlatformForm",
  data() {
    return {
      currentItemData: this.formItemData,
      currenteditEnable: this.editEnable,
      // 校区对应的工作人员
      PlatformWorkers: [],
      // 表单验证
      platFormInfoRules: {
        Label: [
          { required: true, message: "校区名称不能为空", trigger: "blur" }
        ],
        Telephone: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          {
            pattern: /^\d{11}$/,
            message: "请输入正确的手机号",
            trigger: "blur"
          }
        ]
      }
    };
  },
  watch: {
    formItemData(newvar) {
      this.currentItemData = this.formItemData;
    }
  },
  methods: {
    // 保存客户信息
    async savecurrentFormData() {
      this.$refs.formUI.validate(async valid => {
        if (valid) {
          this.currentItemData.MasterID = this.masterID;
          if (this.currentItemData.Id == null || this.currentItemData.Id == 0) {
            // 新增
            let res = await addPlatform("", "", this.currentItemData);
            // this.$emit("subClickEvent", 0, res.data);
            // 添加成功之后要触发父组件信息列表修改
            this.$store
              .dispatch("app/pushPlatform", res.data)
              .then(response => {
                this.currentItemData = res.data;
                this.$message({
                  message: "添加成功",
                  type: "success"
                });
              });
          } else {
            // 修改
            let res = await updatePlatform(
              this.currentItemData.Id,
              "",
              this.currentItemData
            );
            // this.$emit("subClickEvent", 1, res.data);
            this.$store
              .dispatch("app/pushPlatform", res.data)
              .then(response => {
                this.$message({
                  message: "修改成功",
                  type: "success"
                });
              });
          }
          this.currenteditEnable = false;
        } else {
          this.$message({
            message: "请完善表单",
            type: "warning"
          });
        }
      });
    }
  }
};
</script>
