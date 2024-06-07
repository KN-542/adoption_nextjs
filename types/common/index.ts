// レフトメニュー model
export type SidebarModel = {
  name: string
  href: string
  button?: () => void
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
  email: string
  path: string
}

// 設定 model
export type SettingModel = {
  lang?: string
  color: string
  toastSuccessColor: string
  toastErrorColor: string
  errorMsg?: string
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
  email: string
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
  // メールアドレス
  email: string
  // 所属ユーザー
  users: string[]
}

// スケジュール 登録種別
export type ScheduleType = {
  // value
  value: string
  // 名前
  name: string
  // 頻度
  freq: string
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
  selectList?: SearchSelect[]
  textForm?: SearchText[]
  autoCompForm?: SearchAutoComplete[]
}
// 検索 model
export type SearchModel = {
  selectedList: SearchSelected[]
  textForm: SearchText[]
  autoCompForm: SearchAutoComplete[]
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

// 検索 AutoComplete
export type SearchAutoComplete = {
  id: number
  name: string
  items: SelectTitlesModel[]
  selectedItems: SelectTitlesModel[]
}

// 検索ストレージ
export type SearchSelected = {
  // selectListのindex
  index: number
  // listの各要素のID
  id: number
  // listの各要素のハッシュキー
  hashKey: string
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

// カレンダー model
export type CalendarModel = {
  id?: string
  date: Date
  start?: string
  end?: string
  title: string
  users?: SelectTitlesModel[]
  type: ScheduleType
}

// スケジュール
export type Schedule = {
  hashKey: string
  userHashKeys: string[]
  interviewFlg: number
  start: Date
  end: Date
  title: string
  freqId: number
  freq: string
}

// カレンダー Titles
export type SelectTitlesModel = {
  key: string
  title: string
  subTitle: string
}

// 選択済みメニュー
export type SelectedMenuModel = {
  name: string
  icon: JSX.Element
  color: string
  condition: boolean
  onClick?
}
