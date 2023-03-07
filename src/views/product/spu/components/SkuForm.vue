<template>
  <!-- // @ 建议：在进行template模板显示的时候，在异步请求数据没有完成时，template显示是会存在问题的。
    // @ 可以考虑在template元素最顶层进行条件的判断  -->
  <el-card>
    <el-form ref="formRef" :rules="rules" :model="skuInfo" label-width="120px">
      <el-form-item label="SPU名称">
        {{ props.currentSpu.spuName }}
      </el-form-item>

      <el-form-item label="SKU名称" prop="skuName">
        <el-input placeholder="SKU名称" v-model="skuInfo.skuName" />
      </el-form-item>

      <el-form-item label="价格(元)" prop="price">
        <el-input placeholder="SKU价格" v-model="skuInfo.price" />
      </el-form-item>

      <el-form-item label="重量(千克)" prop="weight">
        <el-input placeholder="SKU重量" v-model="skuInfo.weight" />
      </el-form-item>

      <el-form-item label="SKU名描述" prop="skuDesc">
        <el-input
          placeholder="SKU名描述"
          v-model="skuInfo.skuDesc"
          type="textarea"
          :rows="4"
        />
      </el-form-item>

      <!-- // $ skuInfo.skuAttrValueList中间如果有留空不选，会出现null -->
      <el-form-item label="平台属性" prop="skuAttrValueList">
        <!-- 表单可以实现嵌套 -->
        <el-form inline label-width="100px">
          <el-form-item
            style="margin-bottom: 10px"
            v-for="(attr, index) in attrList"
            :key="attr.id"
            :label="attr.attrName"
          >
            <!-- select是有N个，我们需要将每一个select都设置一个v-model -->
            <!-- 每一个select都有它自己的v-model，那么应该如何设置它的v-model？如何进行唯一性识别？ -->

            <el-select v-model="skuInfo.skuAttrValueList[index]" value-key="id">
              <el-option
                v-for="attrValue in attr.attrValueList"
                :key="attrValue.id"
                :label="attrValue.valueName"
                :value="attrValue"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性" prop="skuSaleAttrValueList">
        <!-- 表单可以实现嵌套 -->
        <el-form inline label-width="100px">
          <el-form-item
            style="margin-bottom: 10px"
            v-for="(attr, index) in spuSaleAttrList"
            :key="attr.id"
            :label="attr.saleAttrName"
          >
            <!-- select是有N个，我们需要将每一个select都设置一个v-model -->
            <!-- 每一个select都有它自己的v-model，那么应该如何设置它的v-model？如何进行唯一性识别？ -->

            <el-select
              v-model="skuInfo.skuSaleAttrValueList[index]"
              value-key="id"
            >
              <el-option
                v-for="attrValue in attr.spuSaleAttrValueList"
                :key="attrValue.id"
                :label="attrValue.saleAttrValueName"
                :value="attrValue"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <!-- spu的图片列表，注意，这些图片列表是从spu里上传过来的，可以在sku里进行选择操作 -->
      <!-- // @ 注意spuImageList和skuImageList之间的关系 -->
      <el-form-item label="图片列表" prop="skuImageList">
        <el-table
          :data="spuImageList"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          ></el-table-column>
          <el-table-column label="图片" width="120" align="center">
            <template #default="{ row }">
              <el-image
                :src="row.imgUrl"
                style="width: 100px; height: 100px"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName"></el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <!-- row需要给它加一个属性叫isDefault -->
              <el-tag v-if="row.isDefault === '1'" type="success">默认</el-tag>
              <el-button
                type="primary"
                v-else
                size="small"
                @click="setDefault(row)"
                >设置默认</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="emit('setShowStatus', ShowStatus.SPU_LIST)"
          >取消</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts">
export default {
  name: 'SkuForm'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
// skuModel
import type {
  SkuModel,
  SkuListModel,
  SkuPageListModel,
  SkuImageModel,
  SkuImageListModel,
  SkuAttrValueModel,
  SkuAttrValueListModel,
  SkuSaleAttrValueModel,
  SkuSaleAttrValueListModel
} from '@/api/product/model/skuModel'

// spuModel
import type {
  SpuSaleAttrListModel,
  SpuImageListModel
} from '@/api/product/model/spuModel'

// attrModel
import type { AttrListModel } from '@/api/product/model/attrModel'

// sku
import {
  saveSkuApi,
  findSkuListBySpuIdApi,
  getSkuListApi,
  onSaleApi,
  cancelSaleApi,
  deleteSkuApi,
  getSkuInfoApi
} from '@/api/product/sku'
// spu
import { getSpuSaleAttrListApi, getSpuImageListApi } from '@/api/product/spu'

import { ShowStatus } from '../types'
import useCategoryStore from '@/stores/category'
import { getAttrListApi } from '@/api/product/attr'

const formRef = ref<FormInstance>()

const emit = defineEmits(['setShowStatus'])
const categoryStore = useCategoryStore()
const props = defineProps<{
  currentSpu: {
    id: number
    spuName: string
  }
}>()

// spu的销售属性列表
const spuSaleAttrList = ref<SpuSaleAttrListModel>([])
// 平台属性列表
const attrList = ref<AttrListModel>([])
// 图片列表
const spuImageList = ref<SpuImageListModel>([])

// skuInfo信息
const skuInfo = reactive<SkuModel>({
  category3Id: undefined, // 三级分类id
  isSale: 0, // 是否上架
  price: 0, // 价格
  skuDefaultImg: '', // 默认图片
  skuDesc: '', // 描述
  skuName: '', // 名称
  spuId: 0, // spuId
  tmId: 0, // 品牌id
  weight: 0, // 重量
  skuAttrValueList: [], // sku属性值列表
  skuImageList: [], // sku图片列表
  skuSaleAttrValueList: [] // sku销售属性值列表
})

onMounted(async () => {
  // 获取spu的销售属性列表
  spuSaleAttrList.value = await getSpuSaleAttrListApi(props.currentSpu.id)
  // 获取平台属性列表
  attrList.value = await getAttrListApi({
    category1Id: categoryStore.category1Id as number,
    category2Id: categoryStore.category2Id as number,
    category3Id: categoryStore.category3Id as number
  })
  // 获取图片列表
  spuImageList.value = await getSpuImageListApi(props.currentSpu.id)
})

// 图片列表的选择操作
const handleSelectionChange = (val: SkuImageListModel) => {
  skuInfo.skuImageList = val
}

// 设置默认图片
const setDefault = (row: SkuImageModel) => {
  // 排它性处理
  spuImageList.value.forEach((item) => {
    item.isDefault = '0'
  })

  row.isDefault = '1'

  skuInfo.skuDefaultImg = row.imgUrl
}

// 表单验证

const rules = reactive<FormRules>({
  skuName: [{ required: true, message: '请输入Sku名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入重量', trigger: 'blur' }],
  skuDesc: [{ required: true, message: '请输入Sku描述', trigger: 'blur' }],
  skuDefaultImg: [{ required: true, message: '请设置默认图片' }],
  skuAttrValueList: [
    { required: true, message: '请选择平台属性', type: 'array' }
  ],
  skuSaleAttrValueList: [
    { required: true, message: '请选择销售属性', type: 'array' }
  ],
  skuImageList: [{ required: true, message: '请选择图片', type: 'array' }]
})

// 保存表单数据
const save = async () => {
  // 表单校验
  await formRef.value?.validate()

  const skuAttrValueList = skuInfo.skuAttrValueList
    .filter((item) => item !== null)
    .map((valueIdAttrId) => {
      console.log(valueIdAttrId)
      const { id, attrId } = valueIdAttrId
      return {
        attrId,
        valueId: id as number
      }
    })

  const skuSaleAttrValueList = skuInfo.skuSaleAttrValueList
    .filter((item) => item !== null)
    .map((saleAttrValueIdAndsaleAttrId) => {
      const { id } = saleAttrValueIdAndsaleAttrId
      return {
        saleAttrValueId: id as any
      }
    })

  const skuImageList = skuInfo.skuImageList.map((item) => {
    return {
      imgName: item.imgName,
      imgUrl: item.imgUrl,
      spuImgId: item.id as number,
      isDefault: item.isDefault as string
    }
  })

  const skuInfoObj: SkuModel = {
    ...skuInfo,
    category3Id: categoryStore.category3Id,
    spuId: props.currentSpu.id,
    skuAttrValueList,
    skuSaleAttrValueList,
    skuImageList
  }

  // 保存sku
  await saveSkuApi(skuInfoObj)

  // 提示
  ElMessage.success('保存成功')

  // 返回
  emit('setShowStatus', ShowStatus.SPU_LIST)
}
</script>

<style scoped></style>
