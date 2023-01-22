import AxiosRequest from '@comtstore/axios'
import { isDev, baseUrl } from '../config'

const axios = new AxiosRequest({
  baseUrl: isDev? baseUrl.dev : baseUrl.pro
})

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