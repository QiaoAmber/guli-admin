<template>
  <div>
    <el-card style="margin-bottom: 10px">
      <CategorySelector />
    </el-card>
    <!-- SPU下有三个页面，但是同一时间只显示其中一个 -->
    <SpuList
      v-if="showStatus === ShowStatus.SPU_LIST"
      @setShowStatus="setShowStatus"
      @setCurrentSpu="setCurrentSpu"
    />
    <SpuForm
      v-if="showStatus === ShowStatus.ADD_SPU"
      :currentSpu="currentSpu"
      @setShowStatus="setShowStatus"
    />
    <SkuForm
      v-if="showStatus === ShowStatus.ADD_SKU"
      :currentSpu="{id: currentSpu.id as number,spuName: currentSpu.spuName as string}"
      @setShowStatus="setShowStatus"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "Spu",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import SpuList from "./components/SpuList.vue";
import SpuForm from "./components/SpuForm.vue";
import SkuForm from "./components/SkuForm.vue";
import { ShowStatus } from "./types";
import type {
  SpuModel,
  SpuSaleAttrListModel,
  SpuImageListModel,
} from "@/api/product/model/spuModel";

const showStatus = ref<ShowStatus>(ShowStatus.SPU_LIST);

const setShowStatus = (status: ShowStatus) => {
  showStatus.value = status;
};

// Spu初始值的设置
const initSpuValue = () => ({
  spuName: "",
  description: "",
  tmId: undefined,
  category3Id: undefined,
  spuSaleAttrList: [] as SpuSaleAttrListModel,
  spuImageList: [] as SpuImageListModel,
});

const currentSpu = ref<SpuModel>(initSpuValue()); // 设置一个当前的spu对象

const setCurrentSpu = (val: SpuModel = initSpuValue()) => {
  // 只有修改的时候是有val值的，添加的时候是没有val值的，所以添加的时候我希望它有初始值
  currentSpu.value = val;
};
</script>

<style lang="scss" scoped></style>
