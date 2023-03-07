<template>
  <div>
    <el-form ref="formRef" :model="spuInfo" :rules="rules" label-width="120px">
      <el-form-item label="SPU名称" prop="spuName">
        <el-input v-model="spuInfo.spuName" placeholder="SPU名称" />
      </el-form-item>

      <el-form-item label="品牌" prop="tmId">
        <el-select v-model="spuInfo.tmId" placeholder="请选择品牌">
          <el-option
            v-for="item in trademarkList"
            :key="item.id"
            :label="item.tmName"
            :value="item.id || 0"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述" prop="description">
        <el-input
          v-model="spuInfo.description"
          placeholder="SPU描述"
          :rows="4"
          type="textarea"
        />
      </el-form-item>

      <el-form-item label="SPU图片" prop="spuImageList">
        <el-upload
          v-model:file-list="spuInfo.spuImageList"
          :action="`${BASE_URL}/admin/product/fileUpload`"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>

        <el-dialog v-model="dialogVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性" prop="spuSaleAttrList">
        <!-- 下拉框中的值我希望最好拿到的是一个对象 -->
        <!-- 下拉框 -->
        <el-select
          v-model="saleAttrIdName"
          class="m-2"
          :placeholder="saleListText"
          value-key="id"
        >
          <!-- 循环内容应该是computed计算后的结果 -->
          <!-- 但是现在为了简单理解，我先不进行动态计算 -->
          <el-option
            v-for="item in unUseSaleAttrList"
            :key="item.id"
            :label="item.name"
            :value="item"
          />
        </el-select>
        <el-button type="primary" :icon="Plus" @click="addSpuSaleAttr"
          >添加销售属性</el-button
        >

        <el-table
          :data="spuInfo?.spuSaleAttrList"
          border
          style="margin: 20px 0"
        >
          <el-table-column
            type="index"
            label="序号"
            width="80"
          ></el-table-column>
          <el-table-column
            label="属性名"
            prop="saleAttrName"
            width="150"
          ></el-table-column>
          <el-table-column label="销售属性值列表">
            <template #default="{ row, $index }">
              <el-tag
                v-for="(item, index) in row.spuSaleAttrValueList"
                :key="item.id"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
                style="margin-right: 10px"
                >{{ item.saleAttrValueName }}</el-tag
              >
              <!-- 原来el-input的ref是ref="InputRef"，这么设置是不行的，因为我们当前是数组是循环，input会有很多个 -->
              <el-input
                v-if="row.isShowEdit"
                :ref="(el:any) => (inputsRef[$index] = el)"
                v-model="saleAttrValueName"
                style="width: 100px"
                size="small"
                @keyup.enter="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              />
              <!-- toEdit的时候为什么要传递row和$index？因为row是对象，而$index可以确认是哪个input框需要显示 -->
              <el-button
                v-else
                class="button-new-tag ml-1"
                size="small"
                @click="toEdit(row, $index)"
              >
                +
              </el-button>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="80">
            <template #default="{ row, $index }">
              <el-popconfirm
                :title="`你确认删除${row.saleAttrName}?`"
                @confirm="deleteSpuSaleAttrList($index)"
              >
                <template #reference>
                  <el-button
                    :icon="Delete"
                    type="danger"
                    size="small"
                  ></el-button>
                </template>
              </el-popconfirm>
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
  </div>
</template>

<script lang="ts">
export default {
  name: 'SpuForm'
}
</script>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import {
  getBaseSaleAttrListApi,
  getSpuImageListApi,
  getSpuSaleAttrListApi,
  addOrUpdateSpuApi
} from '@/api/product/spu'
import { getAllTrademarkListApi } from '@/api/product/trademark'
import type {
  BaseSaleAttrListModel,
  SpuModel,
  BaseSaleAttrModel,
  SpuSaleAttrModel
} from '@/api/product/model/spuModel'
import type { TrademarkListModel } from '@/api/product/model/trademarkModel'
import { ShowStatus } from '../types'
import { Plus, Delete } from '@element-plus/icons-vue'
import type {
  UploadFile,
  UploadFiles,
  UploadProps,
  ElInput,
  FormInstance,
  FormRules
} from 'element-plus'
import { ElMessage } from 'element-plus'

import useCategoryStore from '@/stores/category'
const BASE_URL = import.meta.env.VITE_API_URL // 为了上传图片时设置基础路径
const emit = defineEmits(['setShowStatus'])

// 利用ts与props进行结合实现属性的校验
const props = defineProps<{ currentSpu: SpuModel }>()
const spuInfo = reactive<SpuModel>(props.currentSpu)
const trademarkList = ref<TrademarkListModel>([])
const baseSaleAttrList = ref<BaseSaleAttrListModel>([])

const categoryStore = useCategoryStore()

// 修改的时候4个请求操作
onMounted(async () => {
  baseSaleAttrList.value = await getBaseSaleAttrListApi()
})

onMounted(async () => {
  trademarkList.value = await getAllTrademarkListApi()
})

onMounted(async () => {
  const id = spuInfo.id
  if (!id) return
  const spuImageList = await getSpuImageListApi(id)
  spuInfo.spuImageList = spuImageList.map((item) => ({
    ...item,
    name: item.imgName,
    url: item.imgUrl
  }))

  spuInfo.spuSaleAttrList = await getSpuSaleAttrListApi(id)
})

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 删除
const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  // console.log(uploadFile, uploadFiles);
  spuInfo.spuImageList = uploadFiles as any
}

// 预览
const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

// 上传成功
const handleSuccess: UploadProps['onSuccess'] = (
  response: any,
  uploadFile: UploadFile,
  uploadFiles: UploadFiles
) => {
  // TODO:两个数据的操作暂时不动，别管它们
  spuInfo.spuImageList = uploadFiles as any
}

// 销售属性下拉框动态计算结果值，unUseSaleAttrList，未使用的销售属性列表
const unUseSaleAttrList = computed(() => {
  // 第一层是过滤操作
  return baseSaleAttrList.value.filter((attr) => {
    return !spuInfo.spuSaleAttrList.some(
      (item) => item.baseSaleAttrId === attr.id
    )
  })
})

// 销售属性下拉框提示信息的计算
const saleListText = computed(() => {
  const { length } = unUseSaleAttrList.value
  return length > 0 ? `还有${length}未选择` : '没有了'
})

// 确认销售属性下拉框选中的对象内容，因为我们需要传递id和name两个内容
const saleAttrIdName = ref<BaseSaleAttrModel>({ id: 0, name: '' })

// 添加Spu的销售属性
const addSpuSaleAttr = () => {
  const { id, name } = saleAttrIdName.value
  if (id) {
    spuInfo.spuSaleAttrList.push({
      baseSaleAttrId: +id,
      saleAttrName: name,
      spuSaleAttrValueList: []
    })
  }

  saleAttrIdName.value = { id: 0, name: '' }
}

// 销售属性table中的tag操作部分

const saleAttrValueName = ref('')
// const InputRef = ref<InstanceType<typeof ElInput>>();
// input的ref们，是复数，就意味着可以设置很多
const inputsRef = ref<HTMLInputElement[]>([])

const toEdit = async (row: SpuSaleAttrModel, index: number) => {
  row.isShowEdit = true // 响应式数据修改
  // 为了让input获取焦点，需要等待下一次渲染
  await nextTick()
  inputsRef.value[index].focus()
}

const handleInputConfirm = (row: SpuSaleAttrModel) => {
  // 需要进行条件判断
  if (saleAttrValueName.value) {
    // 添加，添加到row的spuSaleAttrValueList的数组当中
    row.spuSaleAttrValueList.push({
      baseSaleAttrId: row.baseSaleAttrId,
      saleAttrValueName: saleAttrValueName.value
    })
    saleAttrValueName.value = ''
  }

  row.isShowEdit = false
}

const deleteSpuSaleAttrList = (index: number) => {
  spuInfo.spuSaleAttrList.splice(index, 1)
}

// 表单验证
const formRef = ref<FormInstance>()

const rules = reactive<FormRules>({
  spuName: [{ required: true, message: '请输入SPU名称', trigger: 'blur' }],
  tmId: [{ required: true, message: '请选择品牌' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  spuImageList: [{ required: true, message: '请上传图片', type: 'array' }],
  spuSaleAttrList: [
    { required: true, message: '请设置销售属性', type: 'array' }
  ]
})

// 保存表单数据
const save = async () => {
  // 整体表单验证
  await formRef.value?.validate()

  spuInfo.category3Id = categoryStore.category3Id

  // 因为接口返回的数据与上传图片组件的数据结构是不一致的，所以我们需要对图片列表内容进行数据的整理操作
  spuInfo.spuImageList = spuInfo.spuImageList.map((item) => {
    return {
      // name: item.name as string,
      // url: item.response ? item.response.data : (item.imgUrl as string),
      imgName: item.name as string,
      imgUrl: item.response ? item.response.data : (item.imgUrl as string)
    }
  })

  // 我希望将spuSaleAttrList当中的isShowEdit属性进行处理，在进行数据传递的时候，最好不要把后台不需要的内容进行传递
  // 因为如果你进行传递的话，一是后台可能出错误，二是传递的报文数据会增大，请求速度会变慢
  spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter((item) => {
    if (item.spuSaleAttrValueList.length > 0) {
      delete item.isShowEdit // 直接删除属性
      return true
    }
    return false
  })

  await addOrUpdateSpuApi(spuInfo)

  ElMessage.success('保存成功')

  emit('setShowStatus', ShowStatus.SPU_LIST)
}
</script>

<style scoped></style>
