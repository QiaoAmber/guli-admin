import type {
  loginResponseModel,
  userInfoResponseModel
} from './model/loginModel'
import request from '@/utils/request'
enum Api {
  Login = '/admin/acl/index/login',
  Logout = '/admin/acl/index/logout',
  GetInfo = '/admin/acl/index/info'
}

export const loginApi = (username: string, password: string) => {
  return request.post<any, loginResponseModel>(Api.Login, {
    username,
    password
  })
}
export const logoutApi = () => {
  return request.post<any, void>(Api.Logout)
}

export const getUserInfoApi = ()=>{
  return request.get<any, userInfoResponseModel>(Api.GetInfo)
}
