import {
  SearchAutoCompIndex,
  SearchDateIndex,
  SearchTextIndex,
} from '@/enum/applicant'
import { SearchCompanyTextIndex } from '@/enum/company'
import { Lang } from '@/enum/user'
import { green, indigo, red } from '@mui/material/colors'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import {
  ApplicantModel,
  ManuscriptModel,
  SearchAutoComplete,
  SearchDates,
  SearchModel,
  SearchSelected,
  SearchSortModel,
  SearchText,
  SelectTitlesModel,
  SettingModel,
  TableDisplayOption,
  TeamModel,
  UserModel,
} from 'types/index'

const state = {
  company: {
    search: {
      pageSize: 25,
      textForm: [
        {
          id: SearchCompanyTextIndex.Name,
          name: '',
          value: '',
        },
      ],
    } as SearchModel,
  },
  applicant: {
    search: {
      pageSize: 25,
      selectedList: [] as SearchSelected[],
      textForm: [
        {
          id: SearchTextIndex.Name,
          name: 'features.applicant.header.name',
          value: '',
        },
        {
          id: SearchTextIndex.Email,
          name: 'features.applicant.header.email',
          value: '',
        },
      ] as SearchText[],
      autoCompForm: [
        {
          id: SearchAutoCompIndex.Interviewer,
          name: 'features.applicant.header.users',
          selectedItems: [] as SelectTitlesModel[],
        },
      ] as SearchAutoComplete[],
      dates: [
        {
          id: SearchDateIndex.CreatedAt,
          name: 'features.applicant.header.createdAt',
          views: ['year', 'month', 'day'],
          format: 'YYYY/MM/DD',
          from: null,
          to: null,
        },
        {
          id: SearchDateIndex.InterviewerDate,
          name: 'features.applicant.header.interviewerDate',
          views: ['year', 'month', 'day'],
          format: 'YYYY/MM/DD',
          from: null,
          to: null,
        },
      ] as SearchDates[],
      sort: {
        key: '',
        isAsc: true,
      } as SearchSortModel,
      option: {
        site: {
          isChange: true,
          display: true,
        },
        status: {
          isChange: true,
          display: true,
        },
        interviewerDate: {
          isChange: true,
          display: true,
        },
        users: {
          isChange: true,
          display: true,
        },
        resume: {
          isChange: true,
          display: true,
        },
        curriculumVitae: {
          isChange: true,
          display: true,
        },
        createdAt: {
          isChange: true,
          display: true,
        },
        manuscript: {
          isChange: true,
          display: false,
        },
        type: {
          isChange: true,
          display: false,
        },
      } as Record<string, TableDisplayOption>,
    } as SearchModel,
  } as ApplicantModel,
  user: {
    search: {
      pageSize: 25,
    },
    hashKey: '',
    name: '',
    email: '',
    path: '',
  } as UserModel,
  team: {
    search: {
      pageSize: 25,
    } as SearchModel,
  } as TeamModel,
  manuscript: {
    search: {
      pageSize: 25,
    } as SearchModel,
  } as ManuscriptModel,
  setting: {
    lang: Lang.JA,
    color: indigo[500],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
    successMsg: [],
    errorMsg: [],
  } as SettingModel,
}

const initState = Object.assign({}, state)

export const slice = createSlice({
  name: 'slice',
  initialState: state,
  // Action
  reducers: {
    // ログイン・ログアウト・設定
    userModel: (state, action: PayloadAction<UserModel>) => {
      Object.assign(state.user, action.payload)
    },
    changeSetting: (state, action: PayloadAction<SettingModel>) => {
      Object.assign(state.setting, action.payload)
    },
    signOut: (state) => {
      Object.assign(state.user, initState.user)
    },
    // 応募者
    applicantSearchPageSize: (state, action: PayloadAction<number>) => {
      state.applicant.search.pageSize = action.payload
    },
    applicantSearchTerm: (state, action: PayloadAction<SearchSelected[]>) => {
      state.applicant.search.selectedList = _.cloneDeep(action.payload)
    },
    applicantSearchText: (state, action: PayloadAction<SearchText[]>) => {
      state.applicant.search.textForm = _.cloneDeep(action.payload)
    },
    applicantSearchAutoComp: (
      state,
      action: PayloadAction<SearchAutoComplete[]>,
    ) => {
      state.applicant.search.autoCompForm = _.cloneDeep(action.payload)
    },
    applicantSearchDates: (state, action: PayloadAction<SearchDates[]>) => {
      state.applicant.search.dates = _.cloneDeep(action.payload)
    },
    applicantSearchSort: (state, action: PayloadAction<SearchSortModel>) => {
      Object.assign(state.applicant.search.sort, action.payload)
    },
    // 企業
    companySearchPageSize: (state, action: PayloadAction<number>) => {
      state.company.search.pageSize = action.payload
    },
    companySearchText: (state, action: PayloadAction<SearchText[]>) => {
      state.company.search.textForm = _.cloneDeep(action.payload)
    },
    // ユーザー
    userSearchPageSize: (state, action: PayloadAction<number>) => {
      state.user.search.pageSize = action.payload
    },
    // チーム
    teamSearchPageSize: (state, action: PayloadAction<number>) => {
      state.team.search.pageSize = action.payload
    },
    // 原稿
    manuscriptSearchPageSize: (state, action: PayloadAction<number>) => {
      state.manuscript.search.pageSize = action.payload
    },
  },
})

export const {
  userModel,
  changeSetting,
  signOut,
  applicantSearchPageSize,
  applicantSearchTerm,
  applicantSearchText,
  applicantSearchAutoComp,
  applicantSearchDates,
  applicantSearchSort,
  companySearchPageSize,
  companySearchText,
  userSearchPageSize,
  teamSearchPageSize,
  manuscriptSearchPageSize,
} = slice.actions
