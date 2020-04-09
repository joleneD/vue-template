import axiosApi from '@/scripts/http/request.js'
import Vue from 'vue'

/**
 * 用户登录
 * @param {String} url 接口url
 * @param {String} method 请求方式
 * @param {Obj} params 参数
 *              params.username 用户名
 *              params.password 密码
 * @param {Fn} cb 回调函数
 * @return
 */
export const login = params => {
  return axiosApi(
    {
      baseURL: 'http://map.xianjiaojing.com/traffic_xian/',
      url: '/login/user',
      method: 'get'
    },
    params
  )
}

export const CityOrCountyInfos = params => {
  return axiosApi(
    {
      url: '/Admin/HuNan/CityOrCountyInfos.json',
      method: 'post'
    },
    params
  )
}