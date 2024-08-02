// 言語
export enum Lang {
  JA = 'ja',
  EN = 'en',
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

// 割り振り追加設定
export enum RuleAdditionalConfiguration {
  UnRequired = 0,
  Required = 1,
}
