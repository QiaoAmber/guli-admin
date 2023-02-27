export interface AttrValueModel {
  id?: number
  valueName: string
  attrId?: number
  isShowEdit?: boolean
}

export type AttrValueListModel = AttrValueModel[]
export interface AttrModel {
  id?: number
  attrName: string
  categoryId: number
  categoryLevel: number
  attrValueList: AttrValueListModel
}
export type AttrListModel = AttrModel[]
