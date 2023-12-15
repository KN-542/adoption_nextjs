import { green, indigo, red } from '@mui/material/colors'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'
import {
  ApplicantModel,
  SearchSelected,
  SettingModel,
  SideBarStoreModel,
  UserModel,
} from 'types/management'

const state = {
  management: {
    applicant: {
      searchTermList: [] as SearchSelected[],
    } as ApplicantModel,
    user: {
      hashKey: '',
      name: '',
      mail: '',
      role: 0,
    } as UserModel,
    sidebar: {
      targetId: 0,
      targetName: '',
    } as SideBarStoreModel,
    setting: {
      color: indigo[500],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
      errorMsg: '',
    } as SettingModel,
  },
}

const initState = Object.assign({}, state)

export const slice = createSlice({
  name: 'slice',
  initialState: state,
  // Action
  reducers: {
    mgUserSignIn: (state, action: PayloadAction<UserModel>) => {
      Object.assign(state.management.user, action.payload)
    },
    mgSideBarChange: (state, action: PayloadAction<SideBarStoreModel>) => {
      Object.assign(state.management.sidebar, action.payload)
    },
    mgChangeSetting: (state, action: PayloadAction<SettingModel>) => {
      Object.assign(state.management.setting, action.payload)
    },
    mgSignOut: (state) => {
      Object.assign(state.management.sidebar, initState.management.sidebar)
      Object.assign(state.management.user, initState.management.user)
    },
    mgApplicantSearchTermList: (
      state,
      action: PayloadAction<SearchSelected[]>,
    ) => {
      state.management.applicant.searchTermList = cloneDeep(action.payload)
    },
  },
})

export const {
  mgUserSignIn,
  mgSideBarChange,
  mgChangeSetting,
  mgSignOut,
  mgApplicantSearchTermList,
} = slice.actions
