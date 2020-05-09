import axios from 'axios'
import { Message } from 'element-ui'
import Cfg from '@/cfg'
import Cache from '@service/cache'
import * as jsonbigint from "json-bigint";

const JSONBigInt = jsonbigint({ 'storeAsString': true });
const serviceObj = {};

addNetService();

export function addNetService(url) {
  let CHAIN_RPC_ADDR;
  let RPC_ADDR;
  if (url) {
    CHAIN_RPC_ADDR = RPC_ADDR = url;
  } else {
    const networkCache = Cache.getNetwork();
    const network = Cfg[networkCache.value] || networkCache.value;
    RPC_ADDR = network.rpc || network;
    CHAIN_RPC_ADDR = RPC_ADDR;
  }

  if (!serviceObj[RPC_ADDR]) {
    const service = axios.create({
      baseURL: RPC_ADDR,
      timeout: 30000,
      transformResponse: data => JSONBigInt.parse(data)
    })

    service.interceptors.request.use(config => {
      config.params = Object.assign({
        m: config && config.data && config.data.method
      }, config.params)
      if (config.host == 'chain') {
        config.baseURL = CHAIN_RPC_ADDR
      } else {
        config.baseURL = RPC_ADDR
      }
      config.headers['Content-Type'] = 'application/json'
      return config
    }, error => {
      console.log(error)
      Promise.reject(error)
    })

    service.interceptors.response.use(response => {
      let data = response.data
      if (data.error) {
        console.log('err' + data.error)
        if (data.error.code == -32000) {
          return Promise.reject(data.error)
        }
        Message({
          message: data.error.code + ':' + data.error.message,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(data.error)
      } else {
        return data.result !== undefined ? data.result : response;
      }
    }, error => {
      if (error.code == -5) {
        return Promise.reject(error)
      }
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    })
    serviceObj[RPC_ADDR] = service;
  }
}

export function rpc(url, params, host) {
  const networkCache = Cache.getNetwork();
  const network = (Cfg[networkCache.value] && Cfg[networkCache.value].rpc) || networkCache.value;
  const service = serviceObj[network];

  return service.request({
    url: '/',
    host: host,
    method: 'post',
    data: {
      jsonrp: '1.0',
      method: url,
      params: params,
      id: new Date().getTime()
    }
  })
}