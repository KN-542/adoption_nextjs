export enum RouterPath {
  // 根幹
  Admin = '/admin',
  Management = '/management',
  // ログイン
  Login = '/login',
  ManagementLoginMFA = '/login/mfa',
  ManagementLoginPasswordChange = '/login/password',
  // エラー
  Error = '/error',
  // 応募者
  Applicant = '/applicant',
  // ユーザー
  User = '/user',
  UserCreate = '/user/create',
  UserGroup = '/user/group',
  UserCalendar = '/user/calendar',
  // ロール
  Role = '/role',
  // メールテンプレート
  Mail = '/mail',
  // データ集計
  Analysis = '/analysis',
  // 操作ログ
  History = '/history',
  // 個人設定
  Setting = '/setting',
  // 認証
  AuthGoogleMeet = '/auth/google',
  // 企業
  Company = '/company',
}

// ブラウザタイトル決定
export const decideTitle = (path: string) => {
  switch (path) {
    // ログイン
    case RouterPath.Login:
      return 'common.title.login.login'
    case RouterPath.ManagementLoginMFA:
      return 'common.title.login.login'
    case RouterPath.ManagementLoginPasswordChange:
      return 'common.title.login.login'
    // エラー
    case RouterPath.Error:
      return 'common.title.error.500'
    // 応募者
    case RouterPath.Management + RouterPath.Applicant:
      return 'common.title.applicant.list'
    // ユーザー
    case RouterPath.Management + RouterPath.User:
      return 'common.title.user.list'
    case RouterPath.Management + RouterPath.UserCreate:
      return 'common.title.user.create'
    case RouterPath.Management + RouterPath.UserGroup:
      return 'common.title.user.group.list'
    case RouterPath.Management + RouterPath.UserCalendar:
      return 'common.title.user.calendar'
    // 個人設定
    case RouterPath.Admin + RouterPath.Setting:
      return 'common.title.setting.index'
    case RouterPath.Management + RouterPath.Setting:
      return 'common.title.setting.index'
    // 認証
    case RouterPath.Management + RouterPath.AuthGoogleMeet:
      return 'common.title.auth'
    // 企業
    case RouterPath.Admin + RouterPath.Company:
      return 'common.title.company.list'
    default:
      return '404' // TODO
  }
}
