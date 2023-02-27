import { defineStore } from 'pinia'
import {
  getCategory1List,
  getCategory2List,
  getCategory3List
} from '@/api/product/category'
import type {
  CategoryStateModel,
  Numberable,
  CategoryListModel
} from '@/api/product/model/categoryModel'

const useCategoryStore = defineStore({
  id: 'category',
  state: (): CategoryStateModel => ({
    category1Id: undefined,
    category2Id: undefined,
    category3Id: undefined,
    category1List: [],
    category2List: [],
    category3List: []
  }),
  getters: {},
  actions: {
    async setCategory1List() {
      this.category1List = await getCategory1List()
      this.category1Id = undefined
      this.category2Id = undefined
      this.category3Id = undefined
      this.category2List = []
      this.category2List = []
    },
    async setCategory2List(c1: number) {
      this.category1Id = c1
      this.category2List = await getCategory2List(c1)
      this.category2Id = undefined
      this.category3Id = undefined
      this.category3List = []
    },
    async setCategory3List(c2: number) {
      this.category2Id = c2
      this.category3List = await getCategory3List(c2)
      this.category3Id = undefined
    }
  }
})

export default useCategoryStore