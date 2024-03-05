import axios from 'axios'
import { APICommonHeader } from '.'
import {
  ApplicantDocumentDownloadRequest,
  ApplicantSearchRequest,
  ApplicantsDownloadRequest,
  SchedulesRequest,
  GoogleMeetURLRequest,
  HashKeyRequest,
  LoginRequest,
  MFARequest,
  PasswordChangeRequest,
  UserCreateRequest,
} from './model/management'

// Login CSR
export const loginCSR = async (req: LoginRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/login`,
    req,
    APICommonHeader,
  )
  return res
}

// Logout CSR
export const LogoutCSR = async (req: HashKeyRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/logout`,
    req,
    APICommonHeader,
  )
  return res
}

// MFA CSR
export const MFACSR = async (req: MFARequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/mfa`,
    req,
    APICommonHeader,
  )
  return res
}

// MFA create CSR
export const MFACreateCSR = async (req: HashKeyRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/code_gen`,
    req,
    APICommonHeader,
  )
  return res
}

// JWT Decode CSR
export const JWTDecodeCSR = async (req: HashKeyRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/decode`,
    req,
    APICommonHeader,
  )
  return res
}

// JWT Decode CSR
export const PasswordChangeCSR = async (req: PasswordChangeRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/password_change`,
    req,
    APICommonHeader,
  )
  return res
}

// Session Confirm CSR
export const SessionConfirmCSR = async (req: HashKeyRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/session_confirm`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者ダウンロード CSR
export const applicantsDownloadCSR = async (req: ApplicantsDownloadRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/download`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者ダウンロード CSR
export const applicantDocumentDownloadCSR = async (
  req: ApplicantDocumentDownloadRequest,
) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/documents_download`,
    req,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob', // レスポンスタイプをblobに設定
      withCredentials: true,
    },
  )
  return res
}

// 応募者検索 CSR
export const applicantsSearchCSR = async (req: ApplicantSearchRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/search`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者検索 SSG
export const applicantsSearchSSG = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSG_URL}/applicant/search`,
    {},
    APICommonHeader,
  )
  return res
}

// ユーザー一覧 CSR
export const UserListCSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/list`,
    {},
    APICommonHeader,
  )
  return res
}

// ユーザーグループ一覧 CSR
export const SearchUserGroupCSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/search_group`,
    {},
    APICommonHeader,
  )
  return res
}

// ユーザー登録 CSR
export const UserCreateCSR = async (req: UserCreateRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/create`,
    req,
    APICommonHeader,
  )
  return res
}

// スケジュール登録 CSR
export const CreateSchedulesCSR = async (req: SchedulesRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/create_schedule`,
    req,
    APICommonHeader,
  )
  return res
}

// スケジュール更新 CSR
export const UpdateSchedulesCSR = async (req: SchedulesRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/update_schedule`,
    req,
    APICommonHeader,
  )
  return res
}

// スケジュール削除 CSR
export const DeleteSchedulesCSR = async (req: HashKeyRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/delete_schedule`,
    req,
    APICommonHeader,
  )
  return res
}

// スケジュール一覧 CSR
export const SchedulesCSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/schedules`,
    {},
    APICommonHeader,
  )
  return res
}

// Google認証URL作成 CSR
export const GoogleAuth = async (req: GoogleMeetURLRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get_url`,
    req,
    APICommonHeader,
  )
  return res
}

// Google認証URL作成 CSR
export const GoogleMeetURL = async (req: GoogleMeetURLRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get_google_meet_url`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者取得(1件) CSR
export const GetApplicantCSR = async (req: HashKeyRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get`,
    req,
    APICommonHeader,
  )
  return res
}

// ユーザーロール一覧 SSG
export const UserRoleListSSG = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSG_URL}/user/role_list`,
    APICommonHeader,
  )
  return res
}

// スケジュール登録種別一覧 SSG
export const UserListScheduleTypeSSG = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSG_URL}/user/schedule_type`,
    {},
    APICommonHeader,
  )
  return res
}

// 応募者ステータス一覧 SSG
export const ApplicantStatusListSSG = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSG_URL}/applicant/status`,
    {},
    APICommonHeader,
  )
  return res
}

// サイト一覧 SSG
export const ApplicantSitesSSG = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSG_URL}/applicant/sites`,
    {},
    APICommonHeader,
  )
  return res
}
