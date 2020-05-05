<template>
  <div v-cloak class="font16 hgt_full">
    <div class="flex_column hgt_full">
      <el-table
        ref="refElTabel"
        height="100%"
        :data="guestList"
        tooltip-effect="light"
        border
        style="width: 100%"
      >
        <el-table-column prop="Id" label="ID" width="50" />
        <el-table-column prop="Realname" label="姓名" width="210"/>  
        <el-table-column prop="Tel" label="联系电话" width="100" />  
         <el-table-column prop="Kind" label="留言类别" width="310"/>   
        <el-table-column prop="Message" label="留言内容"  :show-overflow-tooltip="true" />
        <!-- <el-table-column prop="Platform" label="校区名称" width="210">
            <template slot-scope="scope">
              <span  >{{ common.FormatSelect($store.getters.app.platformList,scope.row.Platform) }}</span>
            </template>
          </el-table-column> -->
         <el-table-column prop="Createtime" label="时间" width="110">
            <template slot-scope="scope">
              <span >{{ common.dateFormat(scope.row.Createtime) }}</span>
            </template>
          </el-table-column>
      </el-table>
      <div class="between-center m-v-15"> 
        <label/>
        <div>
          <el-pagination
            background
            @current-change="getAllGuest"
            :current-page.sync="nowPage"
            :page-size="rows"
            layout="total,prev, pager, next, jumper"
            :total="allRows"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script> 
import { listSchoolTeacher } from "@/api/guest";
import common from "@/utils/common";
export default {
  name: "guest",
  components: { 
  },
  data() {
    return {
      common,
      // 存放用户列表数据
      guestList: [],
      // 数据总条数
      allRows: 0,
      // 当前页数
      nowPage: 1,
      // 每页获取数据的总条数
      rows: 30,
      currentPlatform:0,
    };
  },
  mounted() {
    let paths = this.$router.currentRoute.path.split("/");
    this.currentPlatform = parseInt(paths[paths.length - 1]);
    if (isNaN(this.currentPlatform)) {
      this.currentPlatform = 0;
    }
    this.getAllGuest(); 
  },
  methods: { 
    // 获取所有平台的信息
    async  getAllGuest() {
      let res =  await listSchoolTeacher("",{platform:this.currentPlatform});
      this.guestList = res.data;
      this.allRows = res.title;
    }
  }
};
</script>
<style scoped>
</style>
