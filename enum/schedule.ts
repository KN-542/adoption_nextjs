// タイムゾーン
export enum TimeZone {
  JST = 9 * 60 * 60 * 1000,
}

// カレンダーヘッダーツール名
export enum CalendarHeaderTool {
  Today = 'today',
  Day = 'timeGridDay',
  Week = 'timeGridWeek',
  Month = 'dayGridMonth',
  Year = 'dayGridYear',
  Prev = 'prev',
  Next = 'next',
}

// 面接フラグ
export enum InterviewFlg {
  None = 0,
  Interview,
}
