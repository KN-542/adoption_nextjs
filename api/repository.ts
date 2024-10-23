import axios from 'axios'
import { APICommonHeader, axios1 } from '.'
import {
  ApplicantDocumentDownloadRequest,
  SearchApplicantRequest,
  DownloadApplicantRequest,
  GoogleMeetURLRequest,
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
  StatusEventsByTeamRequest,
  GetOwnTeamRequest,
  UpdateBasicTeamRequest,
  UpdateAssignMethodRequest,
  SearchScheduleRequest,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  DeleteScheduleRequest,
  GetApplicantRequest,
  GoogleAuthRequest,
  AssignUserRequest,
  CheckAssignableUserRequest,
  SearchManuscriptRequest,
  CreateManuscriptRequest,
  CreateApplicantTypeRequest,
  ListApplicantTypeRequest,
  SearchManuscriptByTeamRequest,
  UpdateSelectStatusRequest,
  CreateApplicantManuscriptAssociationRequest,
  CreateApplicantTypeAssociationRequest,
  InputResultRequest,
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
  const res = await axios1.post(
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
  const res = await axios1.post(
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
export const GetApplicantCSR = async (req: GetApplicantRequest) => {
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

// サイト一覧 SSR
export const ApplicantSitesSSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSR_URL}/applicant/sites`,
    {},
    APICommonHeader,
  )
  return res
}

// Google認証URL作成 CSR
export const GoogleAuthCSR = async (req: GoogleAuthRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get_url`,
    req,
    APICommonHeader,
  )
  return res
}

// GoogleMeetURL作成 CSR
export const GoogleMeetURLCSR = async (req: GoogleMeetURLRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/get_google_meet_url`,
    req,
    APICommonHeader,
  )
  return res
}

// 面接官割り振り可能判定 CSR
export const CheckAssignableUserCSR = async (
  req: CheckAssignableUserRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/check_assign_user`,
    req,
    APICommonHeader,
  )
  return res
}

// 面接官割り振り CSR
export const AssignUserCSR = async (req: AssignUserRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/assign_user`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者種別一覧_同一チーム CSR
export const ListApplicantTypeByTeamCSR = async (
  req: ListApplicantTypeRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/types`,
    req,
    APICommonHeader,
  )
  return res
}

// ステータス更新 CSR
export const UpdateSelectStatusCSR = async (req: UpdateSelectStatusRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/update_status`,
    req,
    APICommonHeader,
  )
  return res
}

// 種別紐づけ登録 CSR
export const CreateApplicantTypeAssociationCSR = async (
  req: CreateApplicantTypeAssociationRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/update_type`,
    req,
    APICommonHeader,
  )
  return res
}

// 結果入力 CSR
export const InputResultCSR = async (req: InputResultRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/applicant/result`,
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
    `${process.env.NEXT_PUBLIC_CSR_URL}/team/search`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム登録 CSR
export const CreateTeamCSR = async (req: CreateTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/team/create`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム更新 CSR
export const UpdateTeamCSR = async (req: UpdateTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/team/update`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム削除 CSR
export const DeleteTeamCSR = async (req: DeleteTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/team/delete`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム取得 CSR
export const GetTeamCSR = async (req: GetTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/team/get`,
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
    `${process.env.NEXT_PUBLIC_CSR_URL}/team/search_company`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  予定
*/

// 予定登録 CSR
export const CreateScheduleCSR = async (req: CreateScheduleRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/schedule/create`,
    req,
    APICommonHeader,
  )
  return res
}

// 予定更新 CSR
export const UpdateScheduleCSR = async (req: UpdateScheduleRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/schedule/update`,
    req,
    APICommonHeader,
  )
  return res
}

// 予定削除 CSR
export const DeleteSchedulesCSR = async (req: DeleteScheduleRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/schedule/delete`,
    req,
    APICommonHeader,
  )
  return res
}

// 予定一覧 CSR
export const SchedulesCSR = async (req: SearchScheduleRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/schedule/search`,
    req,
    APICommonHeader,
  )
  return res
}

// 予定登録種別一覧 SSR
export const UserListScheduleTypeSSR = async () => {
  const res = await axios1.post(
    `${process.env.NEXT_SSR_URL}/schedule/type`,
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
  原稿
*/

// 原稿検索 CSR
export const SearchManuscriptCSR = async (req: SearchManuscriptRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/manuscript/search`,
    req,
    APICommonHeader,
  )
  return res
}

// 原稿登録 CSR
export const CreateManuscriptCSR = async (req: CreateManuscriptRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/manuscript/create`,
    req,
    APICommonHeader,
  )
  return res
}

// 原稿検索_同一チーム CSR
export const SearchManuscriptByTeamCSR = async (
  req: SearchManuscriptByTeamRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/manuscript/search_by_team`,
    req,
    APICommonHeader,
  )
  return res
}

// 原稿紐づけ登録 CSR
export const CreateApplicantAssociationCSR = async (
  req: CreateApplicantManuscriptAssociationRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/manuscript/assign_applicant`,
    req,
    APICommonHeader,
  )
  return res
}

/* 
  設定
*/

// 自チーム取得 CSR
export const GetOwnTeamCSR = async (req: GetOwnTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/setting/get_team`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム基本情報更新 CSR
export const UpdateBasicTeamCSR = async (req: UpdateBasicTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/setting/update_team`,
    req,
    APICommonHeader,
  )
  return res
}

// ステータス変更 CSR
export const UpdateStatusCSR = async (req: UpdateStatusRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/setting/team`,
    req,
    APICommonHeader,
  )
  return res
}

// チーム毎ステータスイベント取得 CSR
export const StatusEventsByTeamCSR = async (req: StatusEventsByTeamRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/setting/status_events_of_team`,
    req,
    APICommonHeader,
  )
  return res
}

// 面接官割り振り方法更新 CSR
export const UpdateAssignMethodCSR = async (req: UpdateAssignMethodRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/setting/update_assign`,
    req,
    APICommonHeader,
  )
  return res
}

// ステータスイベントマスタ一覧 SSR
export const ListStatusEventSSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSR_URL}/setting/status_events`,
    {},
    APICommonHeader,
  )
  return res
}

// ステータスイベントマスタ一覧 SSR
export const AssignMasterSSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSR_URL}/setting/assign_masters`,
    {},
    APICommonHeader,
  )
  return res
}

// 書類提出ルールマスタ一覧 SSR
export const DocumentRulesSSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSR_URL}/setting/document_rules`,
    {},
    APICommonHeader,
  )
  return res
}

// 職種マスタ一覧 SSR
export const OccupationsSSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSR_URL}/setting/occupations`,
    {},
    APICommonHeader,
  )
  return res
}

// 応募者種別登録 CSR
export const CreateApplicantTypeCSR = async (
  req: CreateApplicantTypeRequest,
) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/setting/create_applicant_type`,
    req,
    APICommonHeader,
  )
  return res
}

// 応募者種別一覧 CSR
export const ListApplicantTypeCSR = async (req: ListApplicantTypeRequest) => {
  const res = await axios1.post(
    `${process.env.NEXT_PUBLIC_CSR_URL}/setting/applicant_types`,
    req,
    APICommonHeader,
  )
  return res
}

// 面接過程マスタ一覧 SSR
export const ProcessingSSR = async () => {
  const res = await axios.post(
    `${process.env.NEXT_SSR_URL}/setting/processing_list`,
    {},
    APICommonHeader,
  )
  return res
}
