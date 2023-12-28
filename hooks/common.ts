// Date型をyyyy-mm-ddのstringに変更
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
