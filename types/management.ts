// レフトメニュー model
export type SideBarModel = {
  id: number
  name: string
  href: string
  icon: JSX.Element
  role: boolean
  button?: () => void
}

// レフトメニュー store用model
export type SideBarStoreModel = {
  targetId: number
  targetName: string
}

// コンテンツ
export type Contents = {
  key: string
  element: JSX.Element
}

// カラー
export type Color = {
  color: string
  toastSuccessColor: string
  toastErrorColor: string
}

// ログインユーザー model
export type UserModel = {
  hashKey: string
  name: string
  mail: string
  role: number
}

// 設定 model
export type SettingModel = {
  color: string
  toastSuccessColor: string
  toastErrorColor: string
  errorMsg?: string
}

// 応募者一覧 table body
export type ApplicantsTableBody = {
  // No
  no: number
  // hash_key
  hashKey: string
  // 氏名
  name: string
  // 媒体
  site: number
  // メールアドレス
  mail: string
  // 年齢
  age: number
  // 選考状況
  status: number | string
  // 面接予定日
  interviewerDate: string
  // 履歴書
  resume: JSX.Element
  // 職務経歴書
  curriculumVitae: JSX.Element
}

// ユーザー一覧 table body
export type UsersTableBody = {
  // No
  no: number
  // ID
  id: number
  // 氏名
  name: string
  // メールアドレス
  mail: string
  // ロールID
  role: number
}

// table head sort
export type TableSort = {
  target: boolean
  isAsc: boolean
}

// table head
export type TableHeader = {
  id: number
  name: string
  sort?: TableSort
}

// 検索 選択項目
export type SearchSelectTerm = {
  id: number
  value: string
  isSelected: boolean
}

// 検索 選択
export type SearchSelect = {
  name: string
  list: SearchSelectTerm[]
}

// 検索
export type SearchForm = {
  selectList: SearchSelect[]
}

// 検索ストレージ
export type SearchSelected = {
  // selectListのindex
  index: number
  // listの各要素のID
  id: number
}

// 応募者 model
export type ApplicantModel = {
  searchTermList: SearchSelected[]
}
