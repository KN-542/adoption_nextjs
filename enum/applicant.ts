// 媒体
export enum Site {
  Recruit = 1,
  Mynavi,
  Doda,
}
export const dispApplicantSite = (n: number): string => {
  switch (n) {
    case Site.Recruit:
      return 'features.applicant.site.recruit'
    case Site.Mynavi:
      return 'features.applicant.site.mynavi'
    case Site.Doda:
      return 'features.applicant.site.doda'
    default:
      return 'TODO'
  }
}

// 応募者ステータス
export enum ApplicantStatus {
  // 日程未回答
  ScheduleUnanswered,
  // 日程回答済み
  ScheduleAnswered,
  // 書類提出済み
  DocumentsSubmitted,
  // 内定
  Offer,
  // 内定承諾済み
  InternalCommitments,
  // 日程回答期限超過
  CalendarAnswerDeadlineExceeded,
  // 書類提出期限超過
  DeadlineForSubmissionOfBooksExceeds,
  // 書類選考落ち
  FailingToPassThePhysicalExamination,
  // 面接落ち
  FailingAnInterview,
  // 選考辞退
  Withdrawal,
  // 内定辞退
  InternalizedDismissal,
  // 内定承諾後辞退
  DismissalAfterInternalCommitment,
}
export const dispApplicantStatus = (n: number): string => {
  switch (n) {
    case ApplicantStatus.ScheduleUnanswered:
      return 'features.applicant.status.scheduleUnanswered'
    case ApplicantStatus.ScheduleAnswered:
      return 'features.applicant.status.scheduleAnswered'
    case ApplicantStatus.DocumentsSubmitted:
      return 'features.applicant.status.documentsSubmitted'
    case ApplicantStatus.Offer:
      return 'features.applicant.status.offer'
    case ApplicantStatus.InternalCommitments:
      return 'features.applicant.status.internalCommitments'
    case ApplicantStatus.CalendarAnswerDeadlineExceeded:
      return 'features.applicant.status.calendarAnswerDeadlineExceeded'
    case ApplicantStatus.DeadlineForSubmissionOfBooksExceeds:
      return 'features.applicant.status.deadlineForSubmissionOfBooksExceeds'
    case ApplicantStatus.FailingToPassThePhysicalExamination:
      return 'features.applicant.status.failingToPassThePhysicalExamination'
    case ApplicantStatus.FailingAnInterview:
      return 'features.applicant.status.failingAnInterview'
    case ApplicantStatus.Withdrawal:
      return 'features.applicant.status.withdrawal'
    case ApplicantStatus.InternalizedDismissal:
      return 'features.applicant.status.internalizedDismissal'
    case ApplicantStatus.DismissalAfterInternalCommitment:
      return 'features.applicant.status.dismissalAfterInternalCommitment'
    default:
      return 'TODO'
  }
}

// 検索項目 index
export enum SearchIndex {
  // 応募者ステータス
  Status = 0,
  // 媒体
  Site,
  // 履歴書
  Resume,
  // 職務経歴書
  CurriculumVitae,
}

// 書類
export enum DocumentUploaded {
  // あり
  Exist = 1,
  // なし
  NotExist = 2,
}

// 検索項目 Text
export enum SearchTextIndex {
  // 氏名
  Name = 0,
  // メールアドレス
  Email,
}

// 検索項目 AutoComplete
export enum SearchAutoCompIndex {
  // 面接官
  Interviewer = 0,
  // 面接官(サブ)
  SubInterviewer,
}

// 検索項目 Date
export enum SearchDateIndex {
  // 登録日時
  CreatedAt = 0,
  // 面接日時
  InterviewerDate,
}

// 検索項目 sort key
export enum SearchSortKey {
  // 氏名
  Name = 'name',
  // メールアドレス
  Email = 'email',
  // 媒体
  Site = 'site_id',
  // 選考状況
  Status = 'status',
  // 面接希望日時
  InterviewerDate = 'start',
  // 登録日時
  CreatedAt = 'created_at',
}
