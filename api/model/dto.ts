// API サイト一覧
export type ApplicantStatusListDTO = {
  // id
  id: number
  // ハッシュキー
  hashKey: string
  // 氏名
  name: string
  // ファイル名キーワード
  fileName: string
  // 媒体側ID_index
  outerIndex: number
  // 氏名_index
  nameIndex: number
  // メールアドレス_index
  emailIndex: number
  // TEL_index
  telIndex: number
  // 年齢_index
  ageIndex: number
  // 氏名_チェックタイプ
  nameCheckType: number
  // カラム数
  columns: number
}

// API 応募者検索
export type ApplicantSearchDTO = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // 氏名
  name: string
  // メールアドレス
  email: string
  // 媒体
  site: number
  // 媒体(媒体名)
  siteName: string
  // 年齢
  age: number
  // 選考状況
  status: number
  // 面接予定日
  interviewerDate: Date
  // Google Meet URL
  google: string
  // 履歴書
  resume: string
  // 職務経歴書
  curriculumVitae: string
  // 担当面接官
  users: string[]
  // 担当面接官氏名
  userNames: string[]
  // カレンダーハッシュキー
  calendarHashKey: string
}

// API ユーザー検索
export type UserSearchDTO = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // 氏名
  name: string
  // メールアドレス
  email: string
  // 追加分、、
}
