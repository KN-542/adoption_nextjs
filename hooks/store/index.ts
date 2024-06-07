import { SearchAutoCompIndex, SearchTextIndex } from '@/enum/applicant'
import { Lang } from '@/enum/user'
import { green, indigo, red } from '@mui/material/colors'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import {
  ApplicantModel,
  SearchAutoComplete,
  SearchModel,
  SearchSelected,
  SearchSortModel,
  SearchText,
  SelectTitlesModel,
  SettingModel,
  UserModel,
} from 'types/common/index'

const state = {
  applicant: {
    search: {
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
      sort: {
        key: '',
        isAsc: true,
      } as SearchSortModel,
    } as SearchModel,
  } as ApplicantModel,
  user: {
    hashKey: '',
    name: '',
    email: '',
    path: '',
  } as UserModel,
  setting: {
    lang: Lang.JA,
    color: indigo[500],
    toastSuccessColor: green[500],
    toastErrorColor: red[500],
    errorMsg: '',
  } as SettingModel,
}

const initState = Object.assign({}, state)

export const slice = createSlice({
  name: 'slice',
  initialState: state,
  // Action
  reducers: {
    userModel: (state, action: PayloadAction<UserModel>) => {
      Object.assign(state.user, action.payload)
    },
    mgChangeSetting: (state, action: PayloadAction<SettingModel>) => {
      Object.assign(state.setting, action.payload)
    },
    signOut: (state) => {
      Object.assign(state.user, initState.user)
    },
    mgApplicantSearchTermList: (
      state,
      action: PayloadAction<SearchSelected[]>,
    ) => {
      state.applicant.search.selectedList = _.cloneDeep(action.payload)
    },
    mgApplicantSearchText: (state, action: PayloadAction<SearchText[]>) => {
      state.applicant.search.textForm = _.cloneDeep(action.payload)
    },
    mgApplicantSearchAutoComp: (
      state,
      action: PayloadAction<SearchAutoComplete[]>,
    ) => {
      state.applicant.search.autoCompForm = _.cloneDeep(action.payload)
    },
    mgApplicantSearchSort: (state, action: PayloadAction<SearchSortModel>) => {
      Object.assign(state.applicant.search.sort, action.payload)
    },
  },
})

export const {
  userModel,
  mgChangeSetting,
  signOut,
  mgApplicantSearchTermList,
  mgApplicantSearchText,
  mgApplicantSearchAutoComp,
  mgApplicantSearchSort,
} = slice.actions
