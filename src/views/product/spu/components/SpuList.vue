<template>
  <el-card>
    <el-button
      type="primary"
      :icon="Plus"
      @click="showSpuAdd"
      :disabled="!categoryStore.category3Id"
      >添加SPU</el-button
    >
    <el-table :data="spuList" row-key="id" border style="margin: 20px 0">
      <el-table-column label="序号" width="80" align="center">
        <template #default="{ $index }">
          <!-- 分页序号的计算 -->
          {{ pageSize * (current - 1) + $index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="名称" prop="spuName"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>

      <el-table-column label="操作" width="240" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            :icon="Plus"
            size="small"
            @click="showSkuForm(row)"
          ></el-button>
          <el-button
            type="primary"
            :icon="Edit"
            size="small"
            @click="showSpuUpdate(row)"
          ></el-button>
          <el-button
            type="info"
            :icon="InfoFilled"
            size="small"
            @click="showSkuList(row)"
          ></el-button>

          <el-popconfirm
            :title="`你确认删除${row.spuName}吗？`"
            @confirm="remove(row.id)"
          >
            <template #reference>
              <el-button type="danger" :icon="Delete" size="small"></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="current"
      v-model:page-size="pageSize"
      :page-sizes="[3, 6, 9]"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @size-change="(val:number)=> getSpuList(1,val)"
      @current-change="(val:number)=> getSpuList(val, pageSize)"
    />
  </el-card>

  <el-dialog
    v-loading="dialogLoading"
    v-model="dialogTableVisible"
    title="SKU列表"
  >
    <el-table :data="skuList">
      <el-table-column prop="skuName" label="名称" width="150" />
      <el-table-column prop="price" label="价格" width="100" align="right" />
      <el-table-column prop="weight" label="重量" align="right" />
      <el-table-column label="默认图片" align="center" width="120">
        <template #default="{ row }">
          <el-image
            :src="row.skuDefaultImg"
            style="width: 100px; height: 100px"
            lazy
          ></el-image>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script lang="ts">
export default {
  name: 'SpuList'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { Plus, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'

// 先引入品牌的所有类型
import type {
  SpuPageListParamsModel,
  SpuModel,
  SpuListModel,
  SpuPageListModel
} from '@/api/product/model/spuModel'
import { deleteSpuApi, getSpuListApi } from '@/api/product/spu'
import useCategoryStore from '@/stores/category' // 引入store
import { ShowStatus } from '../types'
import { ElMessage } from 'element-plus'
import type { SkuListModel } from '@/api/product/model/skuModel'
import { findSkuListBySpuIdApi } from '@/api/product/sku'

const dialogTableVisible = ref(false)

const categoryStore = useCategoryStore() // 实例化
/*
  Spu列表的获取
  */
const spuList = ref<SpuListModel>([]) // spu列表，只是数组类型不是对象的
// 是否加载中
const loading = ref<boolean>(false) // 加载状态
// 当前页码
const current = ref<number>(1) // 当前页码
// 每页显示条数
const pageSize = ref<number>(3) // 每页显示条数
// 总条数
const total = ref<number>(0) // 总条数

const getSpuList = async (
  page: number = current.value, // 数据类型的约束以及初始值的设置
  limit: number = pageSize.value
) => {
  loading.value = true // 开启加载状态
  // 现在的参数是page和limit，但是我们响应式声明数据的时候是current和pageSize，所以需要去做一个对应的关系
  const result = await getSpuListApi({
    page,
    limit,
    category3Id: categoryStore.category3Id as number
  })
  loading.value = false // 关闭加载状态

  // 分页信息的赋值
  current.value = page // 对当前的页面进行重新的赋值，如果不进行重新赋值，current它就没有变化，page只是函数的参数而已，不是响应式数据
  pageSize.value = limit // 每页显示条数，重新响应式数据的赋值操作
  total.value = result.total // 总记录数的赋值

  // 表格的数据是数组格式，也就是我们之前定义的trademarkList
  spuList.value = result.records // 品牌列表的数组
}

watch(
  () => categoryStore.category3Id,
  (newVal, oldVal) => {
    if (!newVal) {
      // 因为属性中是没有分页的，但是在spu里是有分页的，所以当分类3的id产生变化以后，分页相关的内容需要重置
      spuList.value = []
      current.value = 1
      pageSize.value = 3
      total.value = 0
      return
    }
    getSpuList()
  },
  {
    immediate: true // 立即监控
  }
)

const emit = defineEmits(['setShowStatus', 'setCurrentSpu'])
// ? 可以进行一次事件发送，那么是否能够进行多次事件发送？
// 点击按钮显示添加Spu界面
const showSpuAdd = () => {
  // 是需要控制父组件SPU里的showStatus状态值，而当前是子组件
  emit('setShowStatus', ShowStatus.ADD_SPU)
  emit('setCurrentSpu') // 事件是可以不进行参数传递的
}

// 点击按钮显示修改Spu界面
const showSpuUpdate = (row: SpuModel) => {
  emit('setShowStatus', ShowStatus.ADD_SPU) // 有没有将spu对象进行传递？没有
  const spu = { ...row, spuSaleAttrList: [], spuImageList: [] }
  emit('setCurrentSpu', spu) // 事件是可以不进行参数传递的
}

// 删除SPU
const remove = async (id: number) => {
  await deleteSpuApi(id)
  ElMessage.success('删除成功')
  getSpuList() // 分页码判断各位同学可以自行尝试
}

// 显示SkuForm组件
const showSkuForm = (row: SpuModel) => {
  emit('setShowStatus', ShowStatus.ADD_SKU)
  // 想要显示SkuForm，需要将Spu的id和spuName进行传递，传递到SkuForm组件中
  const spu = { ...row, spuSaleAttrList: [], spuImageList: [] }
  emit('setCurrentSpu', spu) // 事件是可以不进行参数传递的
}

const dialogLoading = ref<boolean>(false) // 加载状态
const skuList = ref<SkuListModel>([]) // sku列表

// 显示Spu商品下的sku列表清单
const showSkuList = async (row: SpuModel) => {
  dialogTableVisible.value = true
  dialogLoading.value = true
  skuList.value = await findSkuListBySpuIdApi(row.id as number)
  dialogLoading.value = false
}
</script>

<style scoped></style>
