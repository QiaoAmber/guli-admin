import request from '@/utils/request'
import type { AttrListModel, AttrModel } from '@/api/product/model/attrModel'
import type { CategoryIdsModel } from '@/api/product/model/categoryModel'

enum Api {
  GetAttrList = '/admin/product/attrInfoList',
  AddOrUpdateAttr = '/admin/product/saveAttrInfo',
  DeleteAttr = '/admin/product/deleteAttr'
}
export const getAttrListApi = ({
  category1Id,
  category2Id,
  category3Id
}: CategoryIdsModel) => {
  return request.get<any, AttrListModel>(
    Api.GetAttrList + `/${category1Id}/${category2Id}/${category3Id}`
  )
}

export const addOrUpdateAttrApi = (attr: AttrModel) => {
  return request.post<any, null>(Api.AddOrUpdateAttr, attr)
}

export const deleteAttrApi = (attrId: number) => {
  return request.delete<any, null>(Api.DeleteAttr + `/${attrId}`)
}