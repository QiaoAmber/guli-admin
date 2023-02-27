export interface CategoryModel {
  id: number
  name: string
  hasChildren?: boolean
  level?: number
}

export type CategoryListModel = CategoryModel[]

export type Numberable = number | undefined

export interface CategoryIdsModel {
  category1Id: Numberable
  category2Id: Numberable
  category3Id: Numberable
}
export interface CategoryStateModel extends CategoryIdsModel {
  category1List: CategoryListModel
  category2List: CategoryListModel
  category3List: CategoryListModel
}
