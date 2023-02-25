<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <el-button type="primary" @click="showDialog">添加</el-button>
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
        v-model:current-page="current"
        v-model:page-size="pageSize"
        :page-sizes="[3, 6, 9]"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="prev, pager, next,->,sizes,total"
        :total="total"
        @size-change="(val:number)=>getTrademarkList(1,val)"
        @current-change="(val:number)=>getTrademarkList(val,pageSize)"
      />
    </div>
    <el-dialog
      v-model="dialogFormVisible"
      :title="trademarkForm.id ? '修改品牌' : '添加品牌'"
    >
      <el-form :model="trademarkForm" :rules="rules" ref="ruleFormRef">
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="trademarkForm.tmName" />
        </el-form-item>
        <el-form-item label="品牌Logo" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            :action="`${baseUrl}/admin/product/fileUpload`"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <el-icon v-if="uploadLoading" class="avatar-uploader-icon">
              <Loading />
            </el-icon>
            <img v-if="trademarkForm.logoUrl" :src="trademarkForm.logoUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="() => resetForm(ruleFormRef)">重置</el-button>
          <el-button type="primary" @click="() => submitForm(ruleFormRef)">
            确认
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
import { ref, onMounted, reactive } from 'vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getAllTrademarkListApi,
  getTrademarkListApi,
  addTrademarkApi,
  deleteTrademarkApi,
  updateTrademarkApi
} from '@/api/product/trademark'
import type {
  TrademarkListModel,
  TrademarkModel
} from '@/api/product/model/trademarkModel'
const handleClick = () => {
  console.log('click')
}

const small = ref(false)
const background = ref(false)
const disabled = ref(false)

const trademarkList = ref<TrademarkListModel>([])
const loading = ref<boolean>(false)
const current = ref<number>(1)
const pageSize = ref<number>(3)
const total = ref<number>(0)
const getTmInitData = (): TrademarkModel => ({
  id: undefined,
  tmName: '',
  logoUrl: ''
})
const trademarkForm = reactive(getTmInitData())
const uploadLoading = ref<boolean>(false)
const baseUrl = import.meta.env.VITE_API_URL
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
const dialogFormVisible = ref(false)
const ruleFormRef = ref<FormInstance>()
const showDialog = () => {
  dialogFormVisible.value = true
  Object.assign(trademarkForm, getTmInitData())
}

//表单校验规则
const tmNameValidator = (rule: any, value: any, callback: any) => {
  if (value.length < 2 || value.length > 10) {
    callback('长度必须在2-10个字符内')
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  tmName: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { validator: tmNameValidator, trigger: 'blur' }
  ],
  logoUrl: [
    {
      required: true,
      message: '请上传图片',
      trigger: 'blur'
    }
  ]
})

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  trademarkForm.logoUrl = response.data
  uploadLoading.value = false
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const JPGOrPNG = ['image/jpeg', 'image/png','image/jpg','image/JPG'].indexOf(rawFile.type)
  const isLt200K = rawFile.size/1024 <200
  if (JPGOrPNG < 0) {
    ElMessage.error('请使用jpeg,png,jpg格式的图片!')
    return false
  } else if (!isLt200K) {
    ElMessage.error('图片大小不能超过200K')
    return false
  }
  uploadLoading.value = true
  return true
}

//表单提交与重置
const submitForm = (formEl: FormInstance | undefined) => {
  console.log(formEl)
  //表单级验证
  if (!formEl) return
  formEl.validate(async (valid, field) => {
    if (valid) {
      try {
        let result
        if (trademarkForm.id) {
          result = await updateTrademarkApi(trademarkForm)
        } else {
          result = await addTrademarkApi(trademarkForm)
        }
        ElMessage.success('提交成功')
        dialogFormVisible.value = false
        getTrademarkList(trademarkForm.id ? current.value : 1)
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log('error submit!', field)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  dialogFormVisible.value = false
}
</script>
<style lang="scss" scoped>
.demo-pagination-block {
  margin-top: 20px;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
:deep(.avatar-uploader) .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
