<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <el-button type="primary" :icon="Plus">添加</el-button>
      </div>
    </template>
    <el-table :data="tableData" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="150" align="center" />
      <el-table-column prop="name" label="品牌名称" />
      <el-table-column
        prop="state"
        label="品牌Logo"
        width="150"
        align="center"
      />
      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template #default>
          <el-button type="primary" size="small" @click="handleClick"
            >修改</el-button
          >
          <el-button type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="demo-pagination-block">
      <el-pagination
        v-model:current-page="currentPage4"
        v-model:page-size="pageSize4"
        :page-sizes="[3, 6, 9]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="prev, pager, next,->,sizes,total"
        :total="400"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script lang="ts">
export default {
  name: 'Trademark'
}
</script>

<script setup lang="ts">
import { ref,onMounted } from 'vue'
import {
  getAllTrademarkListApi,
  getTrademarkListApi,
  addTrademarkApi,
  deleteTrademarkApi,
  updateTrademarkApi
} from '@/api/product/trademark'
const handleClick = () => {
  console.log('click')
}

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  }
]


const currentPage1 = ref(5)
const currentPage2 = ref(5)
const currentPage3 = ref(5)
const currentPage4 = ref(4)
const pageSize2 = ref(100)
const pageSize3 = ref(100)
const pageSize4 = ref(100)
const small = ref(false)
const background = ref(false)
const disabled = ref(false)

const handleSizeChange = (val: number) => {
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val: number) => {
  console.log(`current page: ${val}`)
}

onMounted(() => {
  getAllTrademarkListApi()
})
</script>
<style lang="scss" scoped>
.demo-pagination-block{
  margin-top: 20px;
}
</style>
