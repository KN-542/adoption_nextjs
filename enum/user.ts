// 言語
export enum Lang {
  JA = 'ja',
  EN = 'en',
}

// ロール
export enum Role {
  Admin = 1,
  Interviewer,
}
export const dispRole = (n: number): string => {
  switch (n) {
    case Role.Admin:
      return 'features.user.role.admin'
    case Role.Interviewer:
      return 'features.user.role.interviewer'
    default:
      return 'TODO'
  }
}

// 登録種別
export enum ScheduleTypes {
  None = '',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

// 面接フラグ
export enum InterviewerStatus {
  None = 0,
  Interview = 1,
}
