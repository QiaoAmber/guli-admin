<template>
  <el-card style="margin-bottom: 10px">
    <CategorySelector :disabled="!showAttrList" />
  </el-card>
  <el-card>
    <div v-if="showAttrList">
      <el-button
        :icon="Plus"
        type="primary"
        style="margin-bottom: 15px"
        :disabled="!categoryStore.category3Id"
        @click="showAttrList = false"
        >添加属性</el-button
      >
      <el-table :data="attrList" border row-key="id" v-loading="loading">
        <el-table-column label="序号" type="index" width="80" align="center">
        </el-table-column>
        <el-table-column prop="attrName" label="属性名称" width="150">
        </el-table-column>
        <el-table-column label="属性值列表">
          <template v-slot="{ row }">
            <el-tag
              style="margin-right: 5px"
              type="success"
              v-for="item in row.attrValueList"
              :key="item.id"
              >{{ item.valueName }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template v-slot="{ row }">
            <el-button
              title="修改属性"
              type="primary"
              :icon="Edit"
              size="small"
              @click = "showUpdate(row)"
            ></el-button>
            <el-popconfirm
                :title="`确定删除${row.attrName}吗?`"
                @confirm="remove(row.id)"
              >
                <template #reference>
                  <el-button
                    title="删除属性"
                    type="danger"
                    :icon="Delete"
                    size="small"
                  ></el-button>
                </template>
              </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <span>属性名</span>
      <el-input
        style="width: 200px; margin-left: 20px"
        placeholder="请输入属性名"
        v-model="attr.attrName"
      ></el-input>
      <br />
      <div style="margin: 20px 0">
        <el-button
          type="primary"
          :icon="Plus"
          :disabled="!attr.attrName"
          @click="addValue"
          >添加属性值</el-button
        >
        <el-button @click="showAttrList = false">取消</el-button>
      </div>
      <el-table
        style="margin-bottom: 20px"
        :data="attr.attrValueList"
        v-loading="loading"
      >
        <el-table-column label="序号" type="index" width="80">
        </el-table-column>
        <el-table-column label="属性值名称">
          <template v-slot="{ row, $index }">
            <el-input
              v-model="row.valueName"
              v-if="row.isShowEdit"
              size="small"
              :ref="(el:any) => (inputsRef[$index] = el)"
              @blur="showSpan(row, $index)"
            ></el-input>
            <span style="display: inline-block; width: 100%" v-else @click="showInput(row,$index)">
              {{ row.valueName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row, $index }">
            <el-popconfirm
              :title="`确定删除${row.valueName}吗?`"
              @confirm="
                () => {
                  attr.attrValueList.splice($index, 1)
                }
              "
            >
              <template #reference>
                <el-button
                  title="删除"
                  type="danger"
                  :icon="Delete"
                  size="small"
                ></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" @click="save" :disabled="isSaveDisabled"
        >保存</el-button
      >
      <el-button @click="showAttrList = true">取消</el-button>
    </div>
  </el-card>
</template>

<script lang="ts">
export default {
  name: 'Attr'
}
</script>

<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { addOrUpdateAttrApi, deleteAttrApi, getAttrListApi } from '@/api/product/attr'
import type {
  AttrListModel,
  AttrModel,
  AttrValueModel
} from '@/api/product/model/attrModel'
import useCategoryStore from '@/stores/category'
import { ElMessage } from 'element-plus'
const categoryStore = useCategoryStore()
const attrList = ref<AttrListModel>([])
const loading = ref<boolean>(false)
const showAttrList = ref<boolean>(true)
const inputsRef = ref<HTMLInputElement[]>([])
const attr = reactive<AttrModel>({
  attrName: '',
  categoryId: -1,
  categoryLevel: 3,
  attrValueList: []
})
const showAdd = () => {
  Object.assign(attr, {
    attrName: '',
    categoryId: -1,
    categoryLevel: 3,
    attrValueList: []
  })
  showAttrList.value = false
}
const getAttrList = async () => {
  loading.value = true
  attrList.value = await getAttrListApi({
    category1Id: categoryStore.category1Id as number,
    category2Id: categoryStore.category2Id as number,
    category3Id: categoryStore.category3Id as number
  })
  loading.value = false
}
const addValue = () => {
  attr.attrValueList.push({
    valueName: '',
    attrId: attr.id,
    isShowEdit: true
  })
  nextTick(() => {
    inputsRef.value[attr.attrValueList.length - 1].focus()
  })
}
const showUpdate = (row: AttrModel) => {
  Object.assign(attr, cloneDeep(row));
  showAttrList.value = false;
};
const save = async () => {
  attr.categoryId = categoryStore.category3Id as number
  attr.attrValueList = attr.attrValueList.filter((value) => {
    if (value.valueName) {
      delete value.isShowEdit
      return true
    }
    return false
  })
  attr.attrValueList = Array.from(new Set(attr.attrValueList))
  await addOrUpdateAttrApi(attr)
  ElMessage.success('保存成功')
  showAttrList.value = true
  getAttrList()
}
const remove = async(id:number) => {
  await deleteAttrApi(id);
  ElMessage.success('删除成功');
  getAttrList();
}
const isSaveDisabled = computed(() => {
  const { attrName, attrValueList } = attr
  const hasName = !!attrName
  const hasValue = attrValueList.some((attrValue) => attrValue.valueName)
  return !hasName || !hasValue
})
const showSpan = (row: AttrValueModel, index: number) => {
  if (!row.valueName) {
    attr.attrValueList.splice(index, 1)
    return
  }
  row.isShowEdit = false
}
const showInput = (row:AttrValueModel,index:number) => {
  row.isShowEdit = true
  nextTick(()=>{
    inputsRef.value[index].focus()
  })
}
watch(
  () => categoryStore.category3Id,
  (newV) => {
    if (!newV) {
      attrList.value = []
      return
    }
    getAttrList()
  }
)
</script>
<style lang="scss" scoped></style>
