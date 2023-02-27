import request from '@/utils/request'
import type { CategoryListModel } from '@/api/product/model/categoryModel'
enum Api {
  GetCategory1List = '/admin/product/getCategory1',
  GetCategory2List = '/admin/product/getCategory2',
  GetCategory3List = '/admin/product/getCategory3'
}

export const getCategory1List = () => {
  return request.get<any, CategoryListModel>(Api.GetCategory1List)
}
export const getCategory2List = (c1: number) => {
  return request.get<any, CategoryListModel>(Api.GetCategory2List + `/${c1}`)
}
export const getCategory3List = (c2: number) => {
  return request.get<any, CategoryListModel>(Api.GetCategory3List + `/${c2}`)
}
