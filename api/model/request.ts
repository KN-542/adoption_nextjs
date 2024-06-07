export abstract class AbstractRequest {
  abstract hash_key: string
}
export abstract class AbstractRequest2 {
  abstract user_hash_key: string
}

// ログイン
export class LoginRequest extends AbstractRequest {
  hash_key: string
  email: string
  password: string
}

// MFAコード生成
export class MFACreateRequest extends AbstractRequest {
  hash_key: string
}

// ログアウト
export class LogoutRequest extends AbstractRequest {
  hash_key: string
}

// MFA
export class MFARequest extends AbstractRequest {
  hash_key: string
  code: string
}

// パスワード変更
export class PasswordChangeRequest extends AbstractRequest {
  hash_key: string
  password: string
  init_password: string
}

// JWT検証
export class JWTDecodeRequest extends AbstractRequest {
  hash_key: string
}

// サイドバー
export class SidebarRequest extends AbstractRequest {
  hash_key: string
}

// 使用可能ロール一覧
export class RolesRequest extends AbstractRequest {
  hash_key: string
}

// 応募者ステータス一覧取得
export class ApplicantStatusListRequest extends AbstractRequest2 {
  user_hash_key: string
}

// 応募者検索
export class ApplicantSearchRequest extends AbstractRequest2 {
  // ユーザーハッシュキー
  user_hash_key: string
  // サイト一覧
  sites: string[]
  // 応募者ステータス
  applicant_status_list: string[]
  // 履歴書
  resume_flg: number
  // 職務経歴書
  curriculum_vitae_flg: number
  // 氏名
  name: string
  // メールアドレス
  email: string
  // 面接官
  users: string[]
  // ソート(key)
  sort_key: string
  // ソート(向き)
  sort_asc: boolean
}

// 応募者ステータス一覧取得
export class UserSearchRequest extends AbstractRequest {
  hash_key: string
}

// 応募者ダウンロード
export class ApplicantsDownloadRequest extends AbstractRequest2 {
  // ユーザーハッシュキー
  user_hash_key: string
  // サイトハッシュキー
  site_hash_key: string
  // 応募者
  applicants: ApplicantDownloadSubRequest[]
}

// 応募者
export type ApplicantDownloadSubRequest = {
  // 媒体側ID
  outer_id: string
  // 氏名
  name: string
  // メールアドレス
  email: string
  // TEL
  tel: string
  // 年齢
  age: number
}

// hashKey only
export type HashKeyRequest = {
  hash_key: string
}

// 書類ダウンロード request
export type ApplicantDocumentDownloadRequest = {
  hash_key: string
  name_pre: string
}

// ユーザー登録 request
export type UserCreateRequest = {
  name: string
  email: string
  role_id: number
}

// スケジュール関連 request
export type SchedulesRequest = {
  hash_key: string
  applicant_hash_key: string
  user_hash_keys: string
  freq_id: number
  interview_flg: number
  start: string
  end: string
  title: string
}

// Google認証URL作成 request
export type GoogleMeetURLRequest = {
  applicant: HashKeyRequest
  user_hash_key: string
  code: string
}
