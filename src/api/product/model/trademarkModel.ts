//GET /admin/product/baseTrademark/getTrademarkList
export interface TrademarkModel {
  id?: number
  tmName: string
  logoUrl: string
}

export type TrademarkListModel = TrademarkModel[]

//GET /admin/product/baseTrademark/{page}/{limit}
export interface TrademarkPageListModel {
  records: TrademarkListModel
  total: number
  size: number
  current: number
  searchCount: boolean
  pages: number
}
