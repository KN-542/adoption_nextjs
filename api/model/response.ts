import { SelectTitlesModel } from '@/types/index'

// API サイト一覧
export type SiteListResponse = {
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

// API 応募者ステータス一覧
export type ApplicantStatusListResponse = {
  // ハッシュキー
  hashKey: string
  // ステータス名
  name: string
  // 選択済み新ステータスID
  selectedStatusID: number
  // 選択済み新ステータス
  selectedStatus: string
}

// API 応募者検索
export type SearchApplicantResponse = {
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
  // 登録日時
  createdAt: Date
  // 担当面接官
  users: string[]
  // 担当面接官氏名
  userNames: string[]
  // カレンダーハッシュキー
  calendarHashKey: string
}

// API ユーザー検索
export type SearchUserResponse = {
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

// API ユーザー検索_同一企業
export type SearchUserByCompanyResponse = {
  // ハッシュキー
  hashKey: string
  // 氏名
  name: string
  // メールアドレス
  email: string
}

// API チーム検索_同一企業
export type SearchTeamByCompanyResponse = {
  // ハッシュキー
  hashKey: string
  // チーム名
  name: string
  // サブ
  sub: string
}

// API 企業検索
export type SearchCompanyResponse = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // 企業名
  name: string
}

// API チーム取得
export type GetTeamResponse = {
  // ハッシュキー
  hashKey: string
  // チーム名
  name: string
  // 所属ユーザー
  users: SearchUserByCompanyResponse[]
}

// API 自チーム取得
export type GetOwnTeamResponse = {
  // 最大面接回数
  numOfInterview: number
  // 最低面接人数
  userMin?: number
  // 面接毎イベント
  events?: InterviewEvents[]
}
export type InterviewEvents = {
  // 面接回数
  num: number
  // 選考状況ハッシュキー
  hashKey: string
  // ステータス名
  name: string
  // 選択済み新ステータスID
  selectedStatusID?: number
  // 選択済み新ステータス
  selectedStatus?: string
}
export type Possible = {
  // 面接回数
  num: number
  // 参加可能者
  ableList: SelectTitlesModel[]
}
export type InterviewerPriority = {
  // 優先順位
  priority: number
  // ハッシュキー
  hashKey: string
  // 氏名
  name: string
}

// API ロール検索_同一企業
export type SearchRoleByCompanyResponse = {
  // ハッシュキー
  hashKey: string
  // ロール名
  name: string
}

// API: ステータスイベントマスタ一覧
export type ListStatusEventResponse = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // 説明
  desc: string
  // 選択済み新ステータスID
  selectedStatusID?: number
  // 選択済み新ステータス
  selectedStatus?: string
}

// API: ステータスイベント取得
export type ListStatusEventByTeamResponse = {
  // No
  no: number
  // 説明
  desc: string
  // ステータス名
  name: string
}

// API: アサインルールマスタ取得
export type AssignRuleMasterResponse = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // 説明
  desc: string
  // 追加設定フラグ
  setFlg: number
  // 選択済み
  selected: boolean
  // 選択済みハッシュ
  selectedHash?: string
}

// API: 自動アサインルールマスタ取得
export type AutoAssignRuleMasterResponse = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // 説明
  desc: string
  // 追加設定フラグ
  setFlg: number
  // 選択済み
  selected: boolean
  // 選択済みハッシュ
  selectedHash?: string
}
