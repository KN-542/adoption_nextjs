/* 
  共通
*/

import { DateOrTimeView } from '@mui/x-date-pickers'
import _ from 'lodash'

// Body
export class Body {
  public body: any
  display: boolean = true

  constructor(body: any, display?: boolean) {
    this.body = body
    if (!_.isUndefined(display)) {
      this.display = display
    }
  }
}

// レフトメニュー model
export type SidebarModel = {
  name: string
  href: string
  button?: () => void
}

// コンテンツ
export type Contents = {
  key: string
  element: string
  mask?: {
    disp: boolean
    show: boolean
  }
}

// ボタンコンテンツ
export type ButtonContents = {
  id?: number
  key?: string
  name: JSX.Element
  role: boolean
  contents?: ButtonContentsSub[]
}

// ボタンコンテンツサブ
export type ButtonContentsSub = {
  id?: number
  key?: string
  name: string
  onClick: () => void
}

// カラー
export type Color = {
  color: string
  toastSuccessColor: string
  toastErrorColor: string
}

// ユーザー model
export type UserModel = {
  search: SearchModel
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
  successMsg?: string[]
  errorMsg?: string[]
}

// table head sort
export type TableSort = {
  key: string
  target: boolean
  isAsc: boolean
}

// table display option
export type TableDisplayOption = {
  isChange: boolean
  display: boolean
}

// table head
export type TableHeader = {
  name: string
  option?: TableDisplayOption
  sort?: TableSort
  minW?: number
}

// 検索 項目
export type SearchForm = {
  selectList?: SearchSelect[]
  textForm?: SearchText[]
  autoCompForm?: SearchAutoComplete[]
  ranges?: SearchRanges[]
  dates?: SearchDates[]
}
// 検索 model
export type SearchModel = {
  pageSize: number
  selectedList?: SearchSelected[]
  textForm?: SearchText[]
  autoCompForm?: SearchAutoComplete[]
  ranges?: SearchRanges[]
  dates?: SearchDates[]
  sort?: SearchSortModel
  option?: Record<string, TableDisplayOption>
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

// 検索 range
export type SearchRanges = {
  id: number
  name: string
  min: number
  max: number
}

// 検索 Date
export type SearchDates = {
  id: number
  name: string
  views: DateOrTimeView[]
  format: string
  from: Date
  to: Date
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
  key?: string
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

// アイコン
export type Icons = {
  color: string
  element: JSX.Element
  role: boolean
  onClick: (i: number) => void
}

// Topメニュー リスト
export type TopMenu = {
  name: string
  router: string
}

// 選択済みメニュー
export type SelectedMenuModel = {
  name: string
  icon: JSX.Element
  color: string
  condition: boolean
  onClick?
}

/* 
  応募者
*/

// 応募者 model
export type ApplicantModel = {
  search: SearchModel
}

/* 
  ユーザー
*/

export type TeamModel = {
  search: SearchModel
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

// チーム一覧 table body
export type TeamTableBody = {
  // No
  no: number
  // ハッシュキー
  hashKey: string
  // チーム名
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
  freqName: string
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
  users: SelectTitlesModel[]
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

/* 
  原稿
*/

export type ManuscriptModel = {
  search: SearchModel
}
