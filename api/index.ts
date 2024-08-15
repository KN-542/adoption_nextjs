import { RouterPath } from '@/enum/router'
import axios, { HttpStatusCode } from 'axios'
import _ from 'lodash'

export const APICommonHeader = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}

export const axios1 = axios.create()
axios1.interceptors.response.use(
  (response) => response,
  (error) => {
    // 500台
    if (error.response?.status >= 500) {
      return Promise.reject({
        isServerError: true,
        routerPath: RouterPath.Error,
        toastMsg: '',
        storeMsg: '',
      })
    }

    // エラーコード
    if (error.response?.data.code > 0) {
      return Promise.reject({
        isServerError: false,
        routerPath: '',
        toastMsg: '',
        storeMsg: '',
        code: error.response?.data.code,
      })
    }

    // 400
    if (_.isEqual(error.response?.status, HttpStatusCode.BadRequest)) {
      return Promise.reject({
        isServerError: false,
        routerPath: '',
        toastMsg: 'common.api.header.400',
        storeMsg: '',
      })
    }

    // 401
    if (_.isEqual(error.response?.status, HttpStatusCode.Unauthorized)) {
      return Promise.reject({
        isServerError: false,
        routerPath: RouterPath.Login,
        toastMsg: '',
        storeMsg: 'common.api.header.401',
      })
    }

    // 403
    if (_.isEqual(error.response?.status, HttpStatusCode.Forbidden)) {
      return Promise.reject({
        isServerError: false,
        routerPath: '',
        toastMsg: '',
        storeMsg: 'common.api.header.403',
      })
    }
  },
)
