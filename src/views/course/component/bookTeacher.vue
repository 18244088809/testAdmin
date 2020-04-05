<template>
  <div class="p_both10 p-t-5">
    <div class="flex_wrap flex_mid p-b-5 border-b-e0">
      <div v-for="item in classAllStuList" :key="item.id" class="quan_xian_item m-b-10">
        <el-checkbox
          @change="checked=>changeSelectStu(checked,item)"
          v-model="item.Selected"
        >{{item.Realname}}</el-checkbox>
      </div>
      <p v-if="!classAllStuList||classAllStuList.length==0">本教材没有编辑老师.请搜索添加教师</p>
      <el-button
        v-else
        @click="removeClassTeacher"
        type="danger"
        :disabled="selectExistTeachers.length==0"
      >移除选中的老师</el-button>
    </div>
    <el-form
      :inline="true"
      :model="stuSearchForm"
      :rules="stuSearchFormRules"
      label-width="100px"
      class="m-t-20"
    >
      <el-form-item label="是否离职">
        <el-switch
          v-model="queryFromLabel"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :inactive-text="queryFromLabel?'在职':'离职'"
          @change="searchTeacher"
        />
      </el-form-item>
      <el-form-item prop="searchPhone">
        <el-input
          v-model="searchContentVal"
          placeholder="请输入搜索内容"
          class="input-with-select"
          @keyup.enter.native="searchTeacher"
        >
          <el-select
            slot="prepend"
            v-model="seaechConditionVal"
            placeholder="请选择查询条件"
            class="wid90"
          >
            <el-option
              v-for="(item,index) in searchCustomOptions"
              :key="index"
              :label="item.Label"
              :value="item.value"
            />
          </el-select>
        </el-input>
      </el-form-item>

      <el-form-item label-width="30px">
        <el-button type="primary" @click="searchTeacher" class="border0">查 询</el-button>
      </el-form-item>
    </el-form>
    <div class="m-t-20" v-show="showSearchStuResult">
      <p>备选老师：</p>
      <hr />
      <div class="m-t-20 center flex_wrap m-l-15">
        <el-checkbox-group v-model="checkBoxAddStu">
          <el-checkbox
            :label="item.id"
            class="m-b-5"
            :key="item.id"
            v-for="item in serachStuList"
          >{{item.Realname}}（{{item.Telephone}}）</el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="m-t-30 center-end">
        <el-button type="primary" @click="addTeacherToClass" class="border0">确定</el-button>
      </div>
    </div>
  </div>
</template>
<script>
 
import {
  getSamePlatformTeachers
} from "@/api/manager";
import common from "@/utils/common";
export default {
  name: "ClassTeacher",
  props: {
    // 校区的表单数据
    currentPlatform: {
      type: Number,
      default: 0
    },
    // 班级
    formItemData: {
      type: Object,
      default: { Id: 0 }
    }
  },

  data() {
    return {
      common,
      // 搜索表单数据
      stuSearchForm: {
        searchPhone: "",
        searchName: ""
      },
       queryFromLabel: false, // 是否根据这个客户的录入员进行查询
      // 日期选择-日期筛选
      queryEndDate: null,
      // 查询客户所选条件值
      seaechConditionVal: "",
      // 查询客户内容的值
      searchContentVal: "",
      // 搜索学生的类型-条件查询
      searchTypeVal: "realname",
      // 查询客户的条件选项
      searchCustomOptions: [
        {
          value: "realname",
          Label: "姓名"
        },

        {
          value: "tel",
          Label: "电话"
        },
        {
          value: "comments",
          Label: "备注"
        }
      ],
      // 搜索表单验证
      stuSearchFormRules: {
        searchPhone: [
          {
            pattern: /^\d{5,11}$/,
            message: "请输入正确的手机号，且不得少于5位数",
            trigger: "blur"
          }
        ]
      },
      // 数据总条数-分页
      allRows: 0,
      // 当前页数-分页
      nowPage: 1,
      // 每页数据的总条-分页
      rows: 40,
      // 查找老师的列表-查找结果
      serachStuList: [],
      // 选中的要加入班级的老师
      checkBoxAddStu: [],
      // 是否显示添加老师模块
      ShowSearchForm: false,
      // 是否显示搜索老师的搜索结果模块
      showSearchStuResult: false,
      // 获取班级的所有老师
      classAllStuList: [],
      // 复选框所选中的老师ID
      selectExistTeachers: []
    };
  },
  mounted() {
    this.fire();
  },
  methods: {
    // 获取班级的所有老师
    async fire() { 
      this.searchTeacher()
    },
    // 查找老师
    async searchTeacher() {
   
      // 取数据的位置
      const offsetRow = (this.nowPage - 1) * this.rows;
      let res = await getSamePlatformTeachers("", {
        limit: this.rows,
        offset: offsetRow,
        kind: this.searchTypeVal,
        platform: this.currentPlatform, 
        [this.seaechConditionVal]: this.searchContentVal
      });
      this.checkBoxAddStu = [];
      if (res.data) {
        this.serachStuList = res.data;
        //将搜索出来的结果中，选中那些已经是本班老师的打钩
        this.$nextTick(() => {
          this.serachStuList.forEach(searchItem => {
            this.classAllStuList.forEach(selectItem => {
              if (searchItem.id == selectItem.id) {
                this.checkBoxAddStu.push(searchItem.id);
              }
            });
          });
        });

        this.showSearchStuResult = true;
      } else {
        this.serachStuList = [];
        this.$message({
          message: "没有找到老师",
          type: "warning"
        });
      }
    },
    // 向班级添加老师
    async addTeacherToClass() {
      if (this.checkBoxAddStu.length < 1) {
        this.$message({
          message: "还没有选中要添加的老师",
          type: "warning"
        });
        return;
      }
      let newStu = [...this.checkBoxAddStu];
      if (this.classAllStuList.length > 0) {
        this.classAllStuList.forEach(stuItem => {
          let index = newStu.indexOf(stuItem.ID);
          if (index != -1) {
            newStu.splice(index, 1);
          }
        });
      }
      if (newStu.length == 0) {
        this.$message({
          message: "该老师已经添加过了",
          type: "warning"
        });
        this.checkBoxAddStu = [];
        return;
      }
      let res = await addClassTeacher(this.formItemData.Id, "", newStu);

      this.$message({
        message: "操作成功",
        type: "success"
      });
      // 清空搜索和选中的老师数据
      this.checkBoxAddStu = [];
      this.serachStuList = [];
      this.stuSearchForm.searchPhone = "";
      this.ShowSearchForm = false;
      this.showSearchStuResult = false;
      this.classAllStuList = [];
      if (res.data && res.data.length > 0) {
        this.classAllStuList = res.data;
      }
      this.selectExistTeachers = [];
    },
    // 当复选框发生改变时获取所选中的项
    changeSelectStu(checked, item) {
      if (checked) {
        this.selectExistTeachers.push(item.id);
      } else {
        let newCheckList = [];
        this.selectExistTeachers.forEach(olditem => {
          if (olditem == item.id) {
          } else {
            newCheckList.push(olditem);
          }
        });
        this.selectExistTeachers = newCheckList;
      }
    },
    // 移除班级老师
    async removeClassTeacher() {
      if (this.selectExistTeachers.length == 0) {
        this.$message({
          message: "还没有勾选老师",
          type: "warning"
        });
      } else {
        this.$confirm("你确定删除吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(async () => {
          let res = await removeClassTeacher(
            this.formItemData.Id,
            "",
            this.selectExistTeachers
          );
          this.classAllStuList = res.data;
          this.$message({
            message: "操作成功",
            type: "success"
          });
          this.selectExistTeachers = [];
        });
      }
    }
  }
};
</script> 
<style scoped>
.quan_xian_item {
  width: calc(100% / 5);
}
</style> 