import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from '../utils/token-utils'
import type { UserInfoState } from './interface'
import { ElMessage } from 'element-plus'
import { staticRoutes } from '@/router/routes'
import { getUserInfoApi, loginApi, logoutApi } from '@/api/acl/ user'

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfoStore = defineStore('userInfo', {
  state: (): UserInfoState => ({
    token: getToken() as string,
    name: '',
    avatar: '',
    menuRoutes: []
  }),

  actions: {
    async login(username: string, password: string) {
      const { token } = await loginApi(username, password)
      this.token = token
      setToken(token)
    },

    async reset() {
      await logoutApi()
      removeToken()
      this.token = ''
      this.name = ''
      this.avatar = ''
    },

    async getInfo() {
      const result = await getUserInfoApi()
      this.name = result.name
      this.avatar = result.avatar
      this.menuRoutes = staticRoutes
    }
  }
})
