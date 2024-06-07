import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import _ from 'lodash'

const APICommonHeader = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // これによりCookieを含める
}

// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.log(error)
//     return error
//     // if (_.isEqual(error.response?.status, StatusCodes.UNAUTHORIZED)) {
//     //   return { error: error, bad_request: true }
//     // }
//     // return { error: error, bad_request: false }
//   },
// )

export { APICommonHeader }
