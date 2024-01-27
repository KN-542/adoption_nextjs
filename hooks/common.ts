// Date型をyyyy-mm-ddTHH:mm:ssのstringに変更
export const formatDate = (date: Date): string => {
  const pad = (num) => (num < 10 ? '0' + num : num)

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
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
