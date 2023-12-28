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
  // メールアドレス
  mail: string
  // 媒体
  site: number
  // 媒体(媒体名)
  siteName: string
  // 年齢
  age: number
  // 選考状況
  status: number
  // 選考状況(ステータス名)
  statusName: string
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
  // ハッシュキー
  hashKey: string
  // 氏名
  name: string
  // メールアドレス
  mail: string
  // ロールID
  role: number
  // ロール名
  roleName: string
}

// ユーザーグループ一覧 table body
export type UserGroupTableBody = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // グループ名
  name: string
  // 所属ユーザー
  users: string[]
}

// table head sort
export type TableSort = {
  key: string
  target: boolean
  isAsc: boolean
}

// table head
export type TableHeader = {
  id: number
  name: string
  sort?: TableSort
}

// 検索 項目
export type SearchForm = {
  selectList: SearchSelect[]
  textForm: SearchText[]
}
// 検索 model
export type SearchModel = {
  selectedList: SearchSelected[]
  textForm: SearchText[]
  sort: SearchSortModel
}

// 応募者 model
export type ApplicantModel = {
  search: SearchModel
}

// 検索 選択
export type SearchSelect = {
  name: string
  isRadio: boolean
  list: SearchSelectTerm[]
}

// 検索 テキスト
export type SearchText = {
  id: number
  name: string
  value: string
}

// 検索ストレージ
export type SearchSelected = {
  // selectListのindex
  index: number
  // listの各要素のID
  id: number
}

// 検索 選択項目
export type SearchSelectTerm = {
  id: number
  value: string
  isSelected: boolean
}

// 検索 ソート
export type SearchSortModel = {
  key: string
  isAsc: boolean
}

// チェックボックス 選択済みリスト
export type SelectedCheckbox = {
  key: string
  checked: boolean
}

// チェックボックス props
export type CheckboxPropsField = {
  checkedList: SelectedCheckbox[]
  onClick: (i: number, b: boolean) => void
  onClickAll: (b: boolean) => void
}

// Topメニュー リスト
export type TopMenu = {
  name: string
  router: string
}

// カレンダー 入力内容 モデル
export type CalendarInputsModel = {
  date: Date
  start?: string
  end?: string
  titles?: string[]
}
