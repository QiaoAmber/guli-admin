<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <el-button type="primary" :icon="Plus">添加</el-button>
      </div>
    </template>
    <el-table :data="trademarkList" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="150" align="center" />
      <el-table-column prop="tmName" label="品牌名称" />
      <el-table-column label="品牌Logo" width="150" align="center">
        <template #default="{ row }">
          <el-image
            style="width: 100px; height: 100px"
            :src="row.logoUrl"
            fit="contain"
            lazy
          />
        </template>
      </el-table-column>
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
    <el-dialog v-model="dialogFormVisible" title="Shipping address">
      <el-form :model="form">
        <el-form-item label="Promotion name" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Zones" :label-width="formLabelWidth">
          <el-select v-model="form.region" placeholder="Please select a zone">
            <el-option label="Zone No.1" value="shanghai" />
            <el-option label="Zone No.2" value="beijing" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script lang="ts">
export default {
  name: 'Trademark'
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getAllTrademarkListApi,
  getTrademarkListApi,
  addTrademarkApi,
  deleteTrademarkApi,
  updateTrademarkApi
} from '@/api/product/trademark'
import type { TrademarkListModel } from '@/api/product/model/trademarkModel'
const handleClick = () => {
  console.log('click')
}

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
const trademarkList = ref<TrademarkListModel>([])
const loading = ref<boolean>(false)
const current = ref<number>(1)
const pageSize = ref<number>(5)
const total = ref<number>(0)

const getTrademarkList = async (
  page: number = current.value,
  limit: number = pageSize.value
) => {
  loading.value = true
  const result = await getTrademarkListApi(page, limit)
  loading.value = false
  trademarkList.value = result.records
  total.value = result.total
  current.value = page
  pageSize.value = limit
}
onMounted(() => {
  getTrademarkList()
})
</script>
<style lang="scss" scoped>
.demo-pagination-block {
  margin-top: 20px;
}
</style>
