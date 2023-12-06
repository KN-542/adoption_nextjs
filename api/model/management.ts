// ログイン
export type LoginRequest = {
  email: string
  password: string
}
// hashKey only
export type HashKeyRequest = {
  hash_key: string
}
// MFA
export type MFARequest = {
  hash_key: string
  code: string
}
// パスワード変更
export type PasswordChangeRequest = {
  hash_key: string
  password: string
  init_password: string
}

// 応募者ダウンロード request
export type ApplicantsDownloadRequest = {
  values: string[][]
  site: number
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
