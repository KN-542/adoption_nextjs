export enum RouterPath {
  // 根幹
  Admin = '/admin',
  Management = '/management',
  // ログイン
  Login = '/login',
  // エラー
  Error = '/error',
  // ホーム
  Home = '',
  // 応募者
  Applicant = '/applicant',
  // ユーザー
  User = '/user',
  UserCreate = '/user/create',
  UserEdit = '/user/edit/[id]',
  // チーム
  Team = '/team',
  TeamCreate = '/team/create',
  TeamEdit = '/team/edit/[id]',
  // 予定
  Schedule = '/schedule',
  // ロール
  Role = '/role',
  // メールテンプレート
  Email = '/mail',
  // 変数
  Variable = '/variable',
  // データ集計
  Analysis = '/analysis',
  // 操作ログ
  History = '/log',
  // 設定
  Setting = '/setting',
  SettingTeam = '/team/basic',
  SettingTeamStatus = '/team/status',
  SettingTeamAssign = '/team/assign',
  // 企業
  Company = '/company',
  CompanyCreate = '/company/create',
  // 認証
  AuthGoogleMeet = '/auth/google',
  // BACK
  Back = '/back',
}

// ブラウザタイトル決定
export const decideTitle = (path: string) => {
  switch (path) {
    // ログイン
    case RouterPath.Login:
      return 'common.title.login'
    // エラー
    case RouterPath.Error:
      return 'common.title.error.500'
    // ホーム
    case RouterPath.Admin + RouterPath.Home:
      return 'common.title.home'
    case RouterPath.Management + RouterPath.Home:
      return 'common.title.home'
    // 応募者
    case RouterPath.Management + RouterPath.Applicant:
      return 'common.title.applicant.list'
    // ユーザー
    case RouterPath.Management + RouterPath.User:
      return 'common.title.user.list'
    case RouterPath.Management + RouterPath.UserCreate:
      return 'common.title.user.create'
    case RouterPath.Management + RouterPath.UserEdit:
      return 'common.title.user.edit'
    // チーム
    case RouterPath.Management + RouterPath.Team:
      return 'common.title.team.list'
    case RouterPath.Management + RouterPath.TeamCreate:
      return 'common.title.team.create'
    case RouterPath.Management + RouterPath.TeamEdit:
      return 'common.title.team.edit'
    // 予定
    case RouterPath.Management + RouterPath.Schedule:
      return 'common.title.schedule.list'
    // 設定
    case RouterPath.Admin + RouterPath.Setting:
      return 'common.title.setting.index'
    case RouterPath.Management + RouterPath.Setting:
      return 'common.title.setting.index'
    case RouterPath.Management + RouterPath.Setting + RouterPath.SettingTeam:
      return 'common.title.setting.index'
    case RouterPath.Management +
      RouterPath.Setting +
      RouterPath.SettingTeamStatus:
      return 'common.title.setting.index'
    case RouterPath.Management +
      RouterPath.Setting +
      RouterPath.SettingTeamAssign:
      return 'common.title.setting.index'
    // 認証
    case RouterPath.Management + RouterPath.AuthGoogleMeet:
      return 'common.title.auth'
    // メールテンプレート
    case RouterPath.Management + RouterPath.Email:
      return 'common.title.mail.list'
    // 企業
    case RouterPath.Admin + RouterPath.Company:
      return 'common.title.company.list'
    case RouterPath.Admin + RouterPath.CompanyCreate:
      return 'common.title.company.create'
    // 認証
    case RouterPath.Management + RouterPath.AuthGoogleMeet:
      return 'common.title.back'
    default:
      return '404' // TODO
  }
}
