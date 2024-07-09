export abstract class AbstractRequest {
  abstract hash_key: string
}
export abstract class AbstractRequest2 {
  abstract user_hash_key: string
}
export abstract class AbstractRequest3 {
  abstract user_hash_key: string
  abstract hash_key: string
}

/* 
  共通
*/
// ログイン
export class LoginRequest {
  email: string
  password: string
}
// MFAコード生成
export class CreateMFARequest extends AbstractRequest {
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
export class ChangePasswordRequest extends AbstractRequest {
  hash_key: string
  password: string
  init_password: string
}
// JWT検証
export class DecodeJWTRequest extends AbstractRequest {
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
// チーム変更
export class ChangeTeamRequest extends AbstractRequest3 {
  user_hash_key: string
  hash_key: string
}

/* 
  企業
*/
// 企業検索
export class SearchCompanyRequest extends AbstractRequest2 {
  user_hash_key: string
  name: string
}
// 企業登録
export class CreateCompanyRequest extends AbstractRequest2 {
  user_hash_key: string
  name: string
  email: string
}

/* 
  応募者
*/
// 応募者ステータス一覧取得
export class ApplicantStatusListRequest extends AbstractRequest2 {
  user_hash_key: string
}
// 応募者検索
export class SearchApplicantRequest extends AbstractRequest2 {
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
// 応募者ダウンロード
export class DownloadApplicantRequest extends AbstractRequest2 {
  // ユーザーハッシュキー
  user_hash_key: string
  // サイトハッシュキー
  site_hash_key: string
  // 応募者
  applicants: DownloadApplicantSubRequest[]
}
// 応募者
export type DownloadApplicantSubRequest = {
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

/* 
  ユーザー
*/
// ユーザー検索
export class SearchUserRequest extends AbstractRequest {
  hash_key: string
}
// ユーザー検索_同一企業
export class SearchUserByCompanyRequest extends AbstractRequest {
  hash_key: string
}
// ユーザー登録
export class CreateUserRequest extends AbstractRequest {
  hash_key: string
  name: string
  email: string
  teams: string[]
  role_hash_key: string
}
// ユーザー削除
export class DeleteUserRequest extends AbstractRequest3 {
  user_hash_key: string
  hash_key: string
}

/* 
  チーム
*/
// チーム検索
export class SearchTeamRequest extends AbstractRequest2 {
  user_hash_key: string
}
// チーム登録
export class CreateTeamRequest extends AbstractRequest2 {
  user_hash_key: string
  name: string
  users: string[]
}
// チーム更新
export class UpdateTeamRequest extends AbstractRequest3 {
  user_hash_key: string
  hash_key: string
  name: string
  users: string[]
}
// チーム削除
export class DeleteTeamRequest extends AbstractRequest3 {
  user_hash_key: string
  hash_key: string
}
// チーム取得
export class GetTeamRequest extends AbstractRequest3 {
  user_hash_key: string
  hash_key: string
}
// チーム検索_同一企業
export class SearchTeamByCompanyRequest extends AbstractRequest {
  hash_key: string
}

/* 
  ロール
*/
// ロール検索_同一企業
export class SearchRoleByCompanyRequest extends AbstractRequest2 {
  user_hash_key: string
}

/* 
  精査中
*/

// hashKey only
export type HashKeyRequest = {
  hash_key: string
}

// 書類ダウンロード request
export type ApplicantDocumentDownloadRequest = {
  hash_key: string
  name_pre: string
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
