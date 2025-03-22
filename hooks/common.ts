import {
  amber,
  blue,
  brown,
  common,
  cyan,
  deepOrange,
  green,
  grey,
  lime,
  pink,
  teal,
  indigo,
  red,
  deepPurple,
} from '@mui/material/colors'
import { Color } from '../types'

// Date型をyyyy-mm-ddのstringに変更
export const formatDate = (date: Date): string => {
  const pad = (num) => (num < 10 ? '0' + num : num)

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate())
  )
}
// Date型をyyyy-mm-dd HH:mm:ssのstringに変更
export const formatDate2 = (date: Date): string => {
  const pad = (num) => (num < 10 ? '0' + num : num)

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  )
}

// Date型をyyyy-mm-dd HH:mmのstringに変更
export const formatDate3 = (date: Date): string => {
  const pad = (num) => (num < 10 ? '0' + num : num)

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes())
  )
}

// 時刻作成(15分単位)
export const Time15 = (): string[] => {
  const res: string[] = []
  for (let i = 0; i <= 23; i++) {
    for (let j = 0; j <= 59; j = j + 15) {
      res.push(`${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`)
    }
  }
  res.push('24:00')

  return res
}

// 年を数値化
export const getDayOfYear = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diffInMilliSeconds = date.getTime() - startOfYear.getTime()
  const dayOfYear = Math.floor(diffInMilliSeconds / (1000 * 60 * 60 * 24))

  return dayOfYear + 1
}

// HH:mmに
export const formatDateToHHMM = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export const WEEKENDS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']

// 二重クリック防止_再クリック可能時間
export const DURING = 3000
export const LITTLE_DURING = 300

// テーマカラー
export const COLOR_SET: Color[] = [
  {
    color: indigo[300],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: indigo[500],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: indigo[800],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: blue[300],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: blue[500],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: blue[800],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: deepPurple[300],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: deepPurple[500],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: deepPurple[800],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: common.black,
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
  },
  {
    color: red[300],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: red[500],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: red[800],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: deepOrange[300],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: deepOrange[500],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: deepOrange[800],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: deepOrange[900],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: pink[300],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: pink[500],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: pink[800],
    toastSuccessColor: green[500],
    toastErrorColor: common.black,
  },
  {
    color: green[300],
    toastSuccessColor: blue[500],
    toastErrorColor: red[500],
  },
  {
    color: green[500],
    toastSuccessColor: blue[500],
    toastErrorColor: red[500],
  },
  {
    color: green[800],
    toastSuccessColor: blue[500],
    toastErrorColor: red[500],
  },
  {
    color: cyan[300],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: cyan[500],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: cyan[800],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: teal[300],
    toastSuccessColor: blue[500],
    toastErrorColor: red[500],
  },
  {
    color: teal[500],
    toastSuccessColor: blue[500],
    toastErrorColor: red[500],
  },
  {
    color: teal[800],
    toastSuccessColor: blue[500],
    toastErrorColor: red[500],
  },
  {
    color: teal[900],
    toastSuccessColor: blue[500],
    toastErrorColor: red[500],
  },
  {
    color: lime[300],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: lime[500],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: lime[800],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: amber[300],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: amber[500],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: amber[800],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: brown[300],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: brown[500],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: brown[800],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: brown[900],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: grey[300],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: grey[500],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: grey[800],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
  {
    color: grey[900],
    toastSuccessColor: green[800],
    toastErrorColor: red[500],
  },
]
