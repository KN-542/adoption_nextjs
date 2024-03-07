// ロール
export enum Role {
  Admin = 1,
  Interviewer,
}
export const dispRole = (n: number): string => {
  switch (n) {
    case Role.Admin:
      return 'management.features.user.role.admin'
    case Role.Interviewer:
      return 'management.features.user.role.interviewer'
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
