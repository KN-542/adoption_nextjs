export enum RouterPath {
  // ログイン
  ManagementLogin = '/management/login',
  ManagementLoginMFA = '/management/login/mfa',
  ManagementLoginPasswordChange = '/management/login/password',
  // エラー
  ManagementError = '/management/error',
  // 応募者
  ManagementApplicant = '/management/admin/applicant',
  // 予約者
  ManagementReserver = '/management/admin/reserver',
  // ユーザー
  ManagementUser = '/management/admin/user',
  ManagementUserCreate = '/management/admin/user/create',
  ManagementUserGroup = '/management/admin/user/group',
  ManagementUserCalendar = '/management/admin/user/calendar',
  // メールテンプレート
  ManagementMailTemplate = '/management/admin/mail',
  // データ集計
  ManagementAnalysis = '/management/admin/analysis',
  // 操作ログ
  ManagementHistory = '/management/admin/history',
  // 個人設定
  ManagementSetting = '/management/admin/setting',
}

export const decideTitle = (path: string) => {
  switch (path) {
    // ログイン
    case RouterPath.ManagementLogin:
      return 'common.title.login.login'
    case RouterPath.ManagementLoginMFA:
      return 'common.title.login.login'
    case RouterPath.ManagementLoginPasswordChange:
      return 'common.title.login.login'
    // エラー
    case RouterPath.ManagementError:
      return 'common.title.error.500'
    // 応募者
    case RouterPath.ManagementApplicant:
      return 'common.title.applicant.list'
    // ユーザー
    case RouterPath.ManagementUser:
      return 'common.title.user.list'
    case RouterPath.ManagementUserCreate:
      return 'common.title.user.create'
    case RouterPath.ManagementUserGroup:
      return 'common.title.user.group.list'
    case RouterPath.ManagementUserCalendar:
      return 'common.title.user.calendar'
    // 個人設定
    case RouterPath.ManagementSetting:
      return 'common.title.setting.index'
    default:
      return '404' // TODO
  }
}
