<template>
  <el-form :inline="true" class="demo-form-inline" :disabled="props.disabled">
    <el-form-item label="一级分类">
      <el-select
        v-model="category1Id"
        class="m-2"
        placeholder="请选择"
        size="large"
      >
        <el-option
          v-for="item in categoryStore.category1List"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select
        v-model="category2Id"
        class="m-2"
        placeholder="请选择"
        size="large"
      >
        <el-option
          v-for="item in categoryStore.category2List"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select
        v-model="categoryStore.category3Id"
        class="m-2"
        placeholder="请选择"
        size="large"
      >
        <el-option
          v-for="item in categoryStore.category3List"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
export default {
  name: 'CategorySelector'
}
</script>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import useCategoryStore from '@/stores/category'
const props = defineProps({
  disabled: {
    default: false,
    type: Boolean
  }
})
const categoryStore = useCategoryStore()
const category1Id = computed<number>({
  get() {
    return categoryStore.category1Id as number
  },
  set(val) {
    categoryStore.setCategory2List(val)
  }
})
const category2Id = computed<number>({
  get() {
    return categoryStore.category2Id as number
  },
  set(val) {
    categoryStore.setCategory3List(val)
  }
})

onMounted(async () => {
  await categoryStore.setCategory1List()
})
</script>

<style scoped></style>
