<template>
  <!-- 考勤记录表单 -->
  <div>
    <el-card shadow="hover" class=" m-t-50">
       <div slot="header" class="clearfix">
    <span>{{pageTemplateItem.url}}</span>
    <el-button style="float: right; padding: 3px 0" type="text">编辑页面</el-button>
      <el-button style="float: right; padding: 3px 0" type="text">✕</el-button>
  </div> 
   <el-form
        :model="pageTemplateItem"
        :rules="pageRules"
        ref="ClassCheckElForm"
        label-width="50px"
        style="padding:10px 10px 10px 10px"
        size="small"
        class="dialog-body-pad"
        :disabled="isRightTeacher==false"
      >
      
        <el-form-item label="备注">
          <el-input v-model="pageTemplateItem.label" disabled></el-input>
        </el-form-item>
       
      </el-form> 
      
    </el-card>
  </div>
</template>

<script>
import {
  getAllClass,
  editClassInfo,
  addClassInfo,
  getOneClass,
  getClassTeachers,
  getTimeTableByMonth,
  addClassDaily,
  addClassCheck,
  getClassDaily,
  addClassStu,
  getClassStu,
  handOutTask,
  getAllClassTaskRecord
} from "@/api/class";
import common from "@/utils/common";
import $ImgAPI from "@/api/ImgAPI";
import myImageViewer from "@/components/myImageViewer/myImageViewer";
export default {
  name: "platformPageCard",
  components: {
    myImageViewer
  },
  props: {
    classDaily: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      common,
      // 预览图片的图片地址
      imageViewerSrc: "",
      // 显示图片查看器
      showViewer: false,
      // 考勤记录的表单数据
      pageTemplateItem: {},
      // 课堂考勤的表单验证
      pageRules: {
        ShiJi: [
          { required: true, message: "实际课时不能为空", trigger: "blur" }
        ],
        Dianmingbiao: [
          {
            required: true,
            message: "必须上传考勤表或者现场照片",
            trigger: "blur"
          }
        ],
        Jindu: [{ required: true, message: "教学进度必填", trigger: "blur" }],
        JiaoxueNeirong: [
          { required: true, message: "教学内容必填", trigger: "blur" }
        ]
      },

      // // 搜索结果-学生
      // searchResultStuList: [],
      // 是否显示搜索学生的模块
      isShowSearchStuDIv: false,
      // 考勤记录是否可以编辑
      editEnable: true,
      // 判断是不是当前老师在操作考勤，非本老师只可以查看
      isRightTeacher: true
    };
  },
  methods: {
    // 图片预览
    onPreview(src) {
      this.showViewer = true;
      this.imageViewerSrc = src;
    },
    // 关闭图片查看器
    closeViewer() {
      this.showViewer = false;
    },

    // 考勤表的图片上传
    async uploadClassCheckImg(file) {
      let that = this;
      let res = await $ImgAPI.UploadImg("courseTime", file.raw);
      if (res.code == 200) {
        that.$message({
          message: "操作成功",
          type: "success"
        });
        let ImgItem = { ImgSrc: res.data, Label: file.raw.name };
        that.classCheck.Dianmingbiao.push(ImgItem);
      } else {
        that.$message({
          message: res.title,
          type: "warning"
        });
      }
    },
    // 更换考勤表的图片
    async updateClassCheckImg(file, fileList, index) {
      let that = this;
      let res = await $ImgAPI.UploadImg("courseTime", file.raw);
      if (res.code == 200) {
        that.$message({
          message: "操作成功",
          type: "success"
        });
        let ImgItem = { ImgSrc: res.data, Label: file.raw.name };
        that.classCheck.Dianmingbiao.splice(index, 1, ImgItem);
      } else {
        that.$message({
          message: res.title,
          type: "warning"
        });
      }
    },
    // 删除考勤表的图片
    deleClassCheckImg(index) {
      this.classCheck.Dianmingbiao.splice(index, 1);
    },
    // 保存考勤记录
    saveClassCheck() {
      this.$refs.ClassCheckElForm.validate(async valid => {
        if (valid) {
          let checkObj = { ...this.classCheck };
          checkObj.Dianmingbiao = JSON.stringify(checkObj.Dianmingbiao);
          let temp = [];
          this.missClaaStuList.forEach(item => {
            temp.push(item.id);
            if (checkObj.Check) {
              checkObj.Check = checkObj.Check + "," + item.Realname;
            } else {
              checkObj.Check = item.Realname;
            }
          });
          checkObj.QueqingStudent = temp.join(",");
          checkObj.planStudentNum = this.classAllStuList.length;
          checkObj.ShidaoNumber = this.planStudentNum - temp.length;

          let res = await addClassCheck(this.classDaily.Id, "", checkObj);
          if (res.code == 200) {
            this.$message({
              message: "操作成功",
              type: "success"
            });
            this.$emit("subAddClassCheckEvent", res.data);
          }
          this.editEnable = false;
        } else {
          return false;
        }
      });
    },
    // 获取考勤记录
    async getClassDaily() {
      this.classAllStuList = this.classDaily.stuList;
      this.planStudentNum = 0;
      if (this.classAllStuList) {
        this.planStudentNum = this.classAllStuList.length;
      }
      this.classCheck = JSON.parse(this.classDaily.Check);
      this.classCheck.Dianmingbiao = JSON.parse(this.classCheck.Dianmingbiao);
    },
    async getClassStudent() {
      let res = await getClassStu(this.classDaily.ClassID);
      this.classAllStuList = res.data ? res.data : [];
    },

    // 关闭考勤记录模态框
    cancleOperation() {
      this.$emit("subAddClassCheckEvent");
    }
  },

  mounted() {
    if (this.classDaily.TeacherID == this.$store.getters.manager.Id) {
      this.isRightTeacher = true;
    } else {
      this.isRightTeacher = false;
    }
    this.classTime = this.classDaily.StartTime + "-" + this.classDaily.EndTime;
    this.editEnable = !this.classDaily.Check;

    if (!this.editEnable) {
      this.getClassDaily();
    } else {
      this.getClassStudent();
    }
  }
};
</script>  
<style scoped>
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  box-sizing: border-box;
  margin-top: 15px;
  line-height: 80px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.deleImgIcon {
  position: absolute;
  top: -10px;
  right: -3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  z-index: 10;
}
</style>