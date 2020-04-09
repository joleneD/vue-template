import Vue from 'vue'
import axios from 'axios'
import vueAxios from 'vue-axios'
import qs from 'qs'
import router from '@/router'
import store from '@/store'
import { Loading, Message } from 'element-ui'

Vue.use(vueAxios, axios)

let loadinginstace = '';
let token = localStorage.getItem('token'); //从localstorage取值

/**
 * [http request 拦截器]
 * @return
 */
axios.interceptors.request.use(
  config => {
    // element ui Loading方法
    // loadinginstace = Loading.service({
    //   lock: true,
    //   text: 'Loading',
    //   spinner: 'el-icon-loading',
    //   background: 'rgba(0, 0, 0, 0.3)',
    //   customClass: "osloading",
    //   fullscreen: true
    // })
    // 判断localStorage中是否存在api_token
    if (token) {
      //  存在将access_token写入 request header
      config.headers = {
        'access-token': `${token}`
      }
    }
    return config
  },
  error => {
    // loadinginstace.close();
    return Promise.reject(error)
  }
)

/**
 * [返回状态判断(添加响应拦截器)]
 * @return
 */
axios.interceptors.response.use(
  response => {
    // 对响应数据做些事，把loading动画关掉
    // loadinginstace.close()
    return response
  },
  error => {
    // loadinginstace.close()
    return Promise.resolve(error.response)
  }
)

function errorState (response) {
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    return response.data
  } else {
    return {
      status: -404,
      msg: '网络异常'
    }
  }
}

function successState (res) {
  // 统一判断后端返回的错误码
  if (res.status === 200) {
    return true
  }
  // 需要重定向到错误页面
  if (res.status === 401) {
    Message({
      type: 'error',
      message: res.data.msg || '登录信息已经过期'
    })
    router.replace({ name: '/login' })
    store.dispatch('logout', '登录信息已经过期')
    return '登录信息已经过期'
  }
  // if (errorInfo.status === 500) {
  //   router.push({
  //     path: "/error/500"
  //   });
  // }
  // if (errorInfo.status === 502) {
  //   router.push({
  //     path: "/error/502"
  //   });
  // }
  // if (res.status === 404) {
  //   router.push({
  //     path: "/error/404"
  //   });
  // }
  // return '服务器发生未知错误'
}

/**
 * [toast 弹窗]
 * @param  {String} text     内容
 * @param  {Number} duration 延迟
 * @return
 */
// function toast (text, duration) {
//   if (toast.busy) return
//   toast.busy = true
//   duration = duration || 2500
//   setTimeout(function () {
//     toast.busy = false
//   }, duration)

//   let div = document.createElement('div')

//   Object.assign(div.style, {
//     padding: '5px 10px',
//     color: '#fff',
//     fontSize: '12px',
//     lineHeight: 2,
//     position: 'fixed',
//     top: '50%',
//     margin: '-100px auto 0',
//     left: 0,
//     right: 0,
//     width: '150px',
//     textAlign: 'center',
//     borderRadius: '5px',
//     zIndex: 99999999,
//     background: 'rgba(0,0,0,0.7)'
//   })
//   div.classList.add('toast')
//   div.textContent = text
//   document.body.appendChild(div)

//   setTimeout(function () {
//     div.parentNode && div.parentNode.removeChild(div)
//   }, duration)
// }

/**
 * [配置axios]
 * @param  {Obj} opts 配置
 *               opts.method 请求方式 [*必填]
 *               opts.baseURL axios默认url
 *               opts.url 请求url [*必填]
 *               opts.headers 请求headers
 * @param  {Obj} data 请求数据
 * @return {Obj} res
 */
const httpServer = (opts, data) => {
  // 设置默认headers
  let headers = {}

  switch (opts.method) {
    case 'post':
      headers = { 'X-Requested-With': 'XMLHttpRequest' }
      break
    case 'get':
      break
    case 'put':
      headers = { 'X-Requested-With': 'XMLHttpRequest' }
      break
    case 'delete':
      break
  }

  // http默认配置
  let httpDefaultOpts = {
    method: opts.method, // 必填
    baseURL: opts.baseURL || process.env.VUE_APP_API,//设置默认接口地址
    url: opts.url, // 必填
    timeout: 10 * 1000,//设置请求时间
    params: data,
    data: qs.stringify(data),
    headers: Object.assign(headers, opts.headers)
  }

  if (opts.method === 'get') {
    delete httpDefaultOpts.data
  } else {
    delete httpDefaultOpts.params
  }

  let promise = new Promise((resolve, reject) => {
    axios(httpDefaultOpts)
      .then(res => {
        successState(res)
        resolve(res.data)
      })
      .catch(response => {
        errorState(response)
        reject(response)
      })
  })

  return promise
}

export default httpServer
