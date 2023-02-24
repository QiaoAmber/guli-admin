import request from '@/utils/request'
import type {
  TrademarkModel,
  TrademarkListModel,
  TrademarkPageListModel
} from '@/api/product/model/trademarkModel'
enum Api {
  GetTrademarkList = '/admin/product/baseTrademark',
  GetAllTrademarkList = '/admin/product/baseTrademark/getTrademarkList',
  AddTrademark = '/admin/product/baseTrademark/save',
  DeleteTrademark = '/admin/product/baseTrademark/remove',
  UpdateTrademark = '/admin/product/baseTrademark/update'
}

export const getAllTrademarkListApi = () => {
  return request.get<any, TrademarkListModel>(Api.GetAllTrademarkList)
}
export const getTrademarkListApi = (page: number, limit: number) => {
  return request.get<any, TrademarkPageListModel>(
    Api.GetTrademarkList + `/${page}/${limit}`
  )
}
export const addTrademarkApi = (tm: TrademarkModel) => {
  return request.post<any, null>(Api.AddTrademark, tm)
}
export const deleteTrademarkApi = (id:number) =>{
    return request.delete<any,null>(Api.DeleteTrademark+`/${id}`)
}
export const updateTrademarkApi = 
