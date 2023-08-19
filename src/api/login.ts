import AxiosRequest from '@comtstore/axios'
import StorageCenter from '@comtstore/storage'
import { isDev, baseUrl } from '../config'

export const stroageKey = `login-client/login-server-base-url`

export const getDefualtAxiosBaseUrl = () => {
  return isDev? baseUrl.dev : baseUrl.pro
}

const getInitialAxiosBaseUrl = (): string => {
  let _baseUrl = getDefualtAxiosBaseUrl()
  const baseUrlInStorage = StorageCenter.getInstance().getLocalSItem(stroageKey)
  if(baseUrlInStorage){
      _baseUrl = baseUrlInStorage
  }
  return _baseUrl
}

export const axios = new AxiosRequest({
  baseUrl: getInitialAxiosBaseUrl()
})

export const setAxiosBaseUrl = (baseUrl: string) => {
  axios.baseUrl = baseUrl
  StorageCenter.getInstance().setLocalSItem(stroageKey, baseUrl)
}

export const getAxiosBaseUrl = (): string => {
  return axios.baseUrl
}

class LoginRequest {
  /**
 * 获取验证码
 * @param {*} sid 唯一标识
 */
  static getCaptcha (data) {
    return axios.get('/login/get-captcha', {
      params: data
    })
  }

  /**
   * 获取登录配置信息
   */
  static getLoginConfig (data){
    return axios.get('/login/get-login-config', {
      params: data
    })
  }

  /**
 * 登陆接口
 * @param {Object} loginInfo 用户登陆信息
 */
  static login (loginInfo) {
    return axios.post('/login/login', {
      ...loginInfo
    })
  }

  /**
   * 注册接口
   */
  static register(registerInfo) {
    return axios.post('/login/register', {
      ...registerInfo
    })
  }
}

export default LoginRequest