import axios from 'axios'
import { APICommonHeader, axios1 } from '.'
import {
  ApplicantDocumentDownloadRequest,
  SearchApplicantRequest,
  DownloadApplicantRequest,
  SchedulesRequest,
  GoogleMeetURLRequest,
  HashKeyRequest,
  LoginRequest,
  MFARequest,
  ChangePasswordRequest,
  CreateUserRequest,
  CreateMFARequest,
  LogoutRequest,
  DecodeJWTRequest,
  SidebarRequest,
  RolesRequest,
  ApplicantStatusListRequest,
  SearchUserRequest,
  SearchCompanyRequest,
  CreateCompanyRequest,
  SearchTeamRequest,
  SearchUserByCompanyRequest,
  CreateTeamRequest,
  GetTeamRequest,
  UpdateTeamRequest,
  DeleteTeamRequest,
  DeleteUserRequest,
  SearchRoleByCompanyRequest,
  SearchTeamByCompanyRequest,
  ChangeTeamRequest,
  UpdateStatusRequest,
} from './model/request'

/* 
  共通
*/

// Login CSR
export const LoginCSR = async (req: LoginRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/login`,
    req,
    APICommonHeader,
  )
  return res
}

// Logout CSR
export const LogoutCSR = async (req: LogoutRequest) => {
  const res = await axios1.post(
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
export const CreateMFACSR = async (req: CreateMFARequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/code_gen`,
    req,
    APICommonHeader,
  )
  return res
}

// JWT Decode CSR
export const DecodeJWTCSR = async (req: DecodeJWTRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/decode`,
    req,
    APICommonHeader,
  )
  return res
}

// パスワード変更 CSR
export const ChangePasswordCSR = async (req: ChangePasswordRequest) => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/password_change`,
    req,
    APICommonHeader,
  )
  return res
}

// サイドバー CSR
export const SidebarCSR = async (req: SidebarRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/sidebar`,
    req,
    APICommonHeader,
  )
  return res
}

// 使用可能ロール一覧 CSR
export const RolesCSR = async (req: RolesRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/roles`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム変更 CSR
export const ChangeTeamCSR = async (req: ChangeTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/change_team`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  応募者
*/

// 応募者検索 CSR
export const SearchApplicantCSR = async (req: SearchApplicantRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/search`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者ステータス一覧 CSR
export const ApplicantStatusListCSR = async (
  req: ApplicantStatusListRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/status`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者ダウンロード CSR
export const DownloadApplicantCSR = async (req: DownloadApplicantRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/download`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者取得(1件) CSR
export const GetApplicantCSR = async (req: HashKeyRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get`,
    req,
    APICommonHeader,
  )
  return res
}

// 書類ダウンロード CSR
export const DownloadApplicantDocumentCSR = async (
  req: ApplicantDocumentDownloadRequest,
) => {
  const res = await axios1.post(
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

// サイト一覧 SSG
export const ApplicantSitesSSG = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSG_URL}/applicant/sites`,
    {},
    APICommonHeader,
  )
  return res
}

// Google認証URL作成 CSR
export const GoogleAuth = async (req: GoogleMeetURLRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get_url`,
    req,
    APICommonHeader,
  )
  return res
}

// Google認証URL作成 CSR
export const GoogleMeetURL = async (req: GoogleMeetURLRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get_google_meet_url`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  ユーザー
*/

// ユーザー検索 CSR
export const SearchUserCSR = async (req: SearchUserRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/search`,
    req,
    APICommonHeader,
  )
  return res
}

// ユーザー検索_同一企業 CSR
export const SearchUserByCompanyCSR = async (
  req: SearchUserByCompanyRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/search_company`,
    req,
    APICommonHeader,
  )
  return res
}

// ユーザー登録 CSR
export const CreateUserCSR = async (req: CreateUserRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/create`,
    req,
    APICommonHeader,
  )
  return res
}

// ユーザー削除 CSR
export const DeleteUserCSR = async (req: DeleteUserRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/delete`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  チーム
*/

// チーム一覧 CSR
export const SearchTeamCSR = async (req: SearchTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/search_team`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム登録 CSR
export const CreateTeamCSR = async (req: CreateTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/create_team`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム更新 CSR
export const UpdateTeamCSR = async (req: UpdateTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/update_team`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム削除 CSR
export const DeleteTeamCSR = async (req: DeleteTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/delete_team`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム取得 CSR
export const GetTeamCSR = async (req: GetTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/get_team`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム検索_同一企業 CSR
export const SearchTeamByCompanyCSR = async (
  req: SearchTeamByCompanyRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/search_team_company`,
    req,
    APICommonHeader,
  )
  return res
}

// ステータス変更 CSR
export const UpdateStatusCSR = async (req: UpdateStatusRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/team_setting`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  予定
*/

// 予定登録 CSR
export const CreateSchedulesCSR = async (req: SchedulesRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/create_schedule`,
    req,
    APICommonHeader,
  )
  return res
}

// 予定更新 CSR
export const UpdateSchedulesCSR = async (req: SchedulesRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/update_schedule`,
    req,
    APICommonHeader,
  )
  return res
}

// 予定削除 CSR
export const DeleteSchedulesCSR = async (req: HashKeyRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/delete_schedule`,
    req,
    APICommonHeader,
  )
  return res
}

// 予定一覧 CSR
export const SchedulesCSR = async () => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/user/schedules`,
    {},
    APICommonHeader,
  )
  return res
}

// 予定登録種別一覧 SSG
export const UserListScheduleTypeSSG = async () => {
  const res = await axios1.post(
    `${process.env.NEXT_SSG_URL}/user/schedule_type`,
    {},
    APICommonHeader,
  )
  return res
}

/* 
  企業
*/

// 企業検索 CSR
export const SearchCompanyCSR = async (req: SearchCompanyRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/company/search`,
    req,
    APICommonHeader,
  )
  return res
}

// 企業登録 CSR
export const CreateCompanyCSR = async (req: CreateCompanyRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/company/create`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  ロール
*/

// ロール検索_同一企業 CSR
export const SearchRoleByCompanyCSR = async (
  req: SearchRoleByCompanyRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/role/search_company`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  設定
*/

// ステータスイベントマスタ一覧
export const ListStatusEventSSG = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSG_URL}/setting/status_events`,
    {},
    APICommonHeader,
  )
  return res
}
