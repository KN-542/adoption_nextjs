import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import store, { RootState } from '@/hooks/store/store'
import CustomTable from '@/components/common/Table'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import {
  Body,
  CheckboxPropsField,
  SearchAutoComplete,
  SearchDates,
  SearchForm,
  SearchSelect,
  SearchSelectTerm,
  SearchSelected,
  SearchSortModel,
  SearchText,
  SelectTitlesModel,
  SelectedCheckbox,
  SelectedMenuModel,
  SettingModel,
  TableHeader,
  TableSort,
} from '@/types/index'
import { useTranslations } from 'next-intl'
import { Box, Button } from '@mui/material'
import { blue, common } from '@mui/material/colors'
import {
  DocumentUploaded,
  SearchAutoCompIndex,
  SearchDateIndex,
  SearchIndex,
  SearchSortKey,
  SearchTextIndex,
} from '@/enum/applicant'
import {
  ApplicantDocumentDownloadRequest,
  DownloadApplicantSubRequest,
  SearchApplicantRequest,
  ApplicantStatusListRequest,
  DownloadApplicantRequest,
  GoogleAuthRequest,
  RolesRequest,
  SearchUserByCompanyRequest,
  AssignUserRequest,
} from '@/api/model/request'
import {
  ApplicantSitesSSG,
  GoogleAuthCSR,
  AssignUserCSR,
  SearchUserByCompanyCSR,
  DownloadApplicantDocumentCSR,
  DownloadApplicantCSR,
  SearchApplicantCSR,
  RolesCSR,
  ApplicantStatusListCSR,
} from '@/api/repository'
import _ from 'lodash'
import { useRouter } from 'next/router'
import NextHead from '@/components/common/Header'
import {
  ButtonColorInverse,
  DirectionColumnForTable,
  FontSize,
  M0Auto,
  maxW,
  mb,
  ml,
  mr,
  mt,
  Resume,
  SpaceBetween,
  TableMenuButtons,
  w,
} from '@/styles/index'
import { RouterPath } from '@/enum/router'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import {
  applicantSearchAutoComp,
  applicantSearchDates,
  applicantSearchPageSize,
  applicantSearchSort,
  applicantSearchTerm,
  applicantSearchText,
  changeSetting,
} from '@/hooks/store'
import Pagination from '@/components/common/Pagination'
import { formatDate, formatDate3 } from '@/hooks/common'
import SelectedMenu from '@/components/common/SelectedMenu'
import ItemsSelectModal from '@/components/common/modal/ItemsSelectModal'
import UploadModal from '@/components/management/modal/UploadModal'
import SearchModal from '@/components/common/modal/SearchModal'
import { HttpStatusCode } from 'axios'
import { Operation } from '@/enum/common'
import {
  SearchApplicantResponse,
  SiteListResponse,
  SearchUserByCompanyResponse,
} from '@/api/model/response'
import Papa from 'papaparse'
import { Pattern } from '@/enum/validation'
import Spinner from '@/components/common/modal/Spinner'
import { GetStaticProps } from 'next'
import { Dayjs } from 'dayjs'

type Props = {
  isError: boolean
  locale: string
  sites: SiteListResponse[]
}

const Applicants: React.FC<Props> = ({ isError, locale: _locale, sites }) => {
  const router = useRouter()
  const t = useTranslations()

  const applicant = useSelector((state: RootState) => state.applicant)
  const applicantSearchTermList: SearchSelected[] = _.cloneDeep(
    applicant.search.selectedList,
  )
  const applicantSearchTextList = _.cloneDeep(applicant.search.textForm)
  const applicantSearchAutoCompForm = _.cloneDeep(applicant.search.autoCompForm)
  const applicantSearchDatesForm = _.cloneDeep(applicant.search.dates)
  const applicantSearchSortList = Object.assign({}, applicant.search.sort)
  const applicantSearchOption = Object.assign({}, applicant.search.option)

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [bodies, setBodies] = useState<SearchApplicantResponse[]>([])
  const [statusList, setStatusList] = useState<SiteListResponse[]>([])
  const [usersBelongTeam, setUsersBelongTeam] = useState<
    SearchUserByCompanyResponse[]
  >([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(applicant.search.pageSize)
  const [checkedList, setCheckedList] = useState<SelectedCheckbox[]>([])
  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [searchObj, setSearchObj] = useState<SearchForm>({})

  const [size, setSize] = useState<number>(0)

  const [loading, isLoading] = useState<boolean>(true)
  const [open, isOpen] = useState<boolean>(false)
  const [searchOpen, isSearchOpen] = useState<boolean>(false)
  const [userSelectOpen, isUserSelectOpen] = useState<boolean>(false)
  const [noContent, isNoContent] = useState<boolean>(false)
  const [init, isInit] = useState<boolean>(true)
  const [spinner, isSpinner] = useState<boolean>(false)
  const [pageDisp, isPageDisp] = useState<boolean>(false)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      // API: 応募者ステータス一覧取得
      const res2: SiteListResponse[] = []
      const tempList = await ApplicantStatusListCSR({
        user_hash_key: user.hashKey,
      } as ApplicantStatusListRequest)

      if (_.isEqual(tempList.data.code, HttpStatusCode.NoContent)) {
        isNoContent(true)
        return
      }

      _.forEach(tempList.data.list, (item, index) => {
        res2.push({
          id: Number(index) + 1,
          hashKey: item.hash_key,
          name: item.status_name,
        } as SiteListResponse)
      })
      setStatusList(res2)

      // API: ユーザー検索
      const res3: SearchUserByCompanyResponse[] = []
      const tempList2 = await SearchUserByCompanyCSR({
        hash_key: user.hashKey,
      } as SearchUserByCompanyRequest)

      if (_.isEqual(tempList2.data.code, HttpStatusCode.NoContent)) {
        isNoContent(true)
        return
      }

      _.forEach(tempList2.data.list, (item, index) => {
        res3.push({
          no: Number(index) + 1,
          hashKey: item.hash_key,
          name: item.name,
          email: item.email,
        } as SearchUserByCompanyResponse)
      })
      setUsersBelongTeam(res3)

      setSearchObj({
        selectList: [
          {
            name: t('features.applicant.header.status'),
            isRadio: false,
            list: _.map(res2, (item) => {
              return {
                id: Number(item.id),
                key: item.hashKey,
                value: item.name,
                isSelected: !_.isEmpty(
                  _.find(applicantSearchTermList, (option) => {
                    return _.every([
                      _.isEqual(option.id, Number(item.id)),
                      _.isEqual(option.index, SearchIndex.Status),
                    ])
                  }),
                ),
              }
            }) as SearchSelectTerm[],
          },
          {
            name: t('features.applicant.header.site'),
            isRadio: false,
            list: _.map(sites, (item) => {
              return {
                id: Number(item.id),
                key: item.hashKey,
                value: item.name,
                isSelected: !_.isEmpty(
                  _.find(applicantSearchTermList, (option) => {
                    return _.every([
                      _.isEqual(option.id, Number(item.id)),
                      _.isEqual(option.index, SearchIndex.Site),
                    ])
                  }),
                ),
              }
            }) as SearchSelectTerm[],
          },
          {
            name: t('features.applicant.header.resume'),
            isRadio: true,
            list: [
              {
                id: DocumentUploaded.Exist,
                value: t('features.applicant.documents.t'),
                isSelected: !_.isEmpty(
                  _.find(applicantSearchTermList, (option) => {
                    return _.every([
                      _.isEqual(option.id, DocumentUploaded.Exist),
                      _.isEqual(option.index, SearchIndex.Resume),
                    ])
                  }),
                ),
              },
              {
                id: DocumentUploaded.NotExist,
                value: t('features.applicant.documents.f'),
                isSelected: !_.isEmpty(
                  _.find(applicantSearchTermList, (option) => {
                    return _.every([
                      _.isEqual(option.id, DocumentUploaded.NotExist),
                      _.isEqual(option.index, SearchIndex.Resume),
                    ])
                  }),
                ),
              },
            ] as SearchSelectTerm[],
          },
          {
            name: t('features.applicant.header.curriculumVitae'),
            isRadio: true,
            list: [
              {
                id: DocumentUploaded.Exist,
                value: t('features.applicant.documents.t'),
                isSelected: !_.isEmpty(
                  _.find(applicantSearchTermList, (option) => {
                    return _.every([
                      _.isEqual(option.id, DocumentUploaded.Exist),
                      _.isEqual(option.index, SearchIndex.CurriculumVitae),
                    ])
                  }),
                ),
              },
              {
                id: DocumentUploaded.NotExist,
                value: t('features.applicant.documents.f'),
                isSelected: !_.isEmpty(
                  _.find(applicantSearchTermList, (option) => {
                    return _.every([
                      _.isEqual(option.id, DocumentUploaded.NotExist),
                      _.isEqual(option.index, SearchIndex.CurriculumVitae),
                    ])
                  }),
                ),
              },
            ] as SearchSelectTerm[],
          },
        ] as SearchSelect[],
        textForm: [
          {
            id: applicantSearchTextList[SearchTextIndex.Name].id,
            name: t(applicantSearchTextList[SearchTextIndex.Name].name),
            value: applicantSearchTextList[SearchTextIndex.Name].value,
          },
          {
            id: applicantSearchTextList[SearchTextIndex.Email].id,
            name: t(applicantSearchTextList[SearchTextIndex.Email].name),
            value: applicantSearchTextList[SearchTextIndex.Email].value,
          },
        ] as SearchText[],
        autoCompForm: [
          {
            id: applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer].id,
            name: t(
              applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer].name,
            ),
            items: _.map(res3, (u) => {
              return {
                key: u.hashKey,
                title: u.name,
                subTitle: u.email,
              } as SelectTitlesModel
            }) as SelectTitlesModel[],
            selectedItems:
              applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer]
                .selectedItems,
          },
        ] as SearchAutoComplete[],
        dates: [
          {
            id: applicantSearchDatesForm[SearchDateIndex.CreatedAt].id,
            name: t(applicantSearchDatesForm[SearchDateIndex.CreatedAt].name),
            views: applicantSearchDatesForm[SearchDateIndex.CreatedAt].views,
            format: applicantSearchDatesForm[SearchDateIndex.CreatedAt].format,
            from: applicantSearchDatesForm[SearchDateIndex.CreatedAt].from,
            to: applicantSearchDatesForm[SearchDateIndex.CreatedAt].to,
          },
          {
            id: applicantSearchDatesForm[SearchDateIndex.InterviewerDate].id,
            name: t(
              applicantSearchDatesForm[SearchDateIndex.InterviewerDate].name,
            ),
            views:
              applicantSearchDatesForm[SearchDateIndex.InterviewerDate].views,
            format:
              applicantSearchDatesForm[SearchDateIndex.InterviewerDate].format,
            from: applicantSearchDatesForm[SearchDateIndex.InterviewerDate]
              .from,
            to: applicantSearchDatesForm[SearchDateIndex.InterviewerDate].to,
          },
        ] as SearchDates[],
      })
    } catch ({ isServerError, routerPath, toastMsg, storeMsg }) {
      if (isServerError) {
        router.push(routerPath)
        return
      }

      if (!_.isEmpty(toastMsg)) {
        toast(t(toastMsg), {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })
        return
      }

      if (!_.isEmpty(storeMsg)) {
        const msg = t(storeMsg)
        store.dispatch(
          changeSetting({
            errorMsg: _.isEmpty(msg) ? [] : [msg],
          } as SettingModel),
        )
        router.push(_.isEmpty(routerPath) ? RouterPath.Management : routerPath)
      }
    } finally {
      isInit(false)
    }
  }

  const search = async (currentPage: number, currentSize: number) => {
    isSpinner(true)
    isPageDisp(false)
    if (init) isLoading(true)

    // API 応募者検索
    const list: SearchApplicantResponse[] = []
    const list2: SelectedCheckbox[] = []

    const resume = _.filter(applicantSearchTermList, (item) =>
      _.isEqual(item.index, SearchIndex.Resume),
    )
    const curriculumVitae = _.filter(applicantSearchTermList, (item) =>
      _.isEqual(item.index, SearchIndex.CurriculumVitae),
    )

    await SearchApplicantCSR({
      // ユーザーハッシュキー
      user_hash_key: user.hashKey,
      // ページ
      page: currentPage,
      // ページサイズ
      page_size: currentSize,
      // サイト一覧
      sites: _.map(
        _.filter(applicantSearchTermList, (item) =>
          _.isEqual(item.index, SearchIndex.Site),
        ),
        (item2) => {
          return item2.hashKey
        },
      ),
      // 応募者ステータス
      applicant_status_list: _.map(
        _.filter(applicantSearchTermList, (item) =>
          _.isEqual(item.index, SearchIndex.Status),
        ),
        (item2) => {
          return item2.hashKey
        },
      ),
      // 履歴書
      resume_flg: _.isEmpty(resume)
        ? null
        : _.map(resume, (item) => {
            return item.id
          })[0],
      // 職務経歴書
      curriculum_vitae_flg: _.isEmpty(curriculumVitae)
        ? null
        : _.map(curriculumVitae, (item) => {
            return item.id
          })[0],
      // 氏名
      name: applicantSearchTextList[SearchTextIndex.Name].value.trim(),
      // メールアドレス
      email: applicantSearchTextList[SearchTextIndex.Email].value.trim(),
      // 面接官
      users: _.map(
        applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer]
          .selectedItems,
        (item) => {
          return item.key.trim()
        },
      ),
      // 面接日時_From
      interviewer_date_from:
        applicantSearchDatesForm[SearchDateIndex.InterviewerDate].from,
      // 面接日時_To
      interviewer_date_to:
        applicantSearchDatesForm[SearchDateIndex.InterviewerDate].to,
      // 登録日時_From
      created_at_from: applicantSearchDatesForm[SearchDateIndex.CreatedAt].from,
      // 登録日時_To
      created_at_to: applicantSearchDatesForm[SearchDateIndex.CreatedAt].to,
      // ソート(key)
      sort_key: applicantSearchSortList.key,
      // ソート(向き)
      sort_asc: applicantSearchSortList.isAsc,
    } as SearchApplicantRequest)
      .then((res) => {
        if (_.isEqual(res.data.code, HttpStatusCode.NoContent)) {
          isNoContent(true)
          return
        }

        _.forEach(_.isEmpty(res.data.list) ? [] : res.data.list, (r, index) => {
          list.push({
            no: currentSize * (currentPage - 1) + Number(index) + 1,
            hashKey: r.hash_key,
            name: r.name,
            site: Number(r.site_id),
            siteName: r.site_name,
            email: r.email,
            statusName: r.status_name,
            interviewerDate: new Date(r.start),
            google: r.google_meet_url,
            resume: r.resume_extension,
            curriculumVitae: r.curriculum_vitae_extension,
            createdAt: new Date(r.created_at),
            users: _.map(r.users, (u) => {
              return u.hash_key
            }),
            userNames: _.map(r.users, (u) => {
              return u.name
            }),
            calendarHashKey: r.calendar_hash_key,
          } as SearchApplicantResponse)
        })
        setBodies(list)
        setSize(Number(res.data.num))

        if (currentPage) {
          _.forEach(res.data.list, (r) => {
            list2.push({
              key: r.hash_key,
              checked: false,
            } as SelectedCheckbox)
          })
          setCheckedList(list2)
        }

        if (currentSize) {
          setPageSize(currentSize)
          store.dispatch(applicantSearchPageSize(currentSize))
        }
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
          return
        }

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
      .finally(() => {
        isSpinner(false)
        isLoading(false)
        isPageDisp(true)
      })
  }

  const changeSearchObjBySelect = (
    index: number,
    index2: number,
    optionId: number,
    isRadio: boolean,
    key: string,
  ) => {
    const newObj = Object.assign({}, searchObj)
    if (isRadio) {
      for (const option of newObj.selectList[index].list) {
        option.isSelected = false
      }
      while (
        _.findIndex(applicantSearchTermList, (item) =>
          _.isEqual(item.index, index),
        ) > -1
      ) {
        const i = _.findIndex(applicantSearchTermList, (item) =>
          _.isEqual(item.index, index),
        )
        applicantSearchTermList.splice(i, 1)
      }
    }

    newObj.selectList[index].list[index2].isSelected =
      !newObj.selectList[index].list[index2].isSelected
    setSearchObj(newObj)

    if (newObj.selectList[index].list[index2].isSelected) {
      applicantSearchTermList.push({
        index: index,
        id: optionId,
        hashKey: key,
      } as SearchSelected)
      store.dispatch(applicantSearchTerm(applicantSearchTermList))
    } else {
      const i = _.findIndex(applicantSearchTermList, (item) =>
        _.every([_.isEqual(item.index, index), _.isEqual(item.id, optionId)]),
      )
      applicantSearchTermList.splice(i, 1)

      store.dispatch(applicantSearchTerm(applicantSearchTermList))
    }
  }

  const selectInit = (index: number) => {
    const newObj = Object.assign({}, searchObj)

    for (const option of newObj.selectList[index].list) {
      option.isSelected = false
    }
    while (
      _.findIndex(applicantSearchTermList, (item) =>
        _.isEqual(item.index, index),
      ) > -1
    ) {
      const i = _.findIndex(applicantSearchTermList, (item) =>
        _.isEqual(item.index, index),
      )
      applicantSearchTermList.splice(i, 1)
    }

    store.dispatch(applicantSearchTerm(applicantSearchTermList))
    setSearchObj(newObj)
  }

  const changeSearchObjByText = (index: number, value: string) => {
    const newObj = Object.assign({}, searchObj)
    newObj.textForm[index].value = value
    applicantSearchTextList[index].value = value
    store.dispatch(applicantSearchText(applicantSearchTextList))
    setSearchObj(newObj)
  }

  const changeSearchObjByAutoComp = (
    index: number,
    selectedItems: SelectTitlesModel[],
  ) => {
    const newObj = Object.assign({}, searchObj)
    newObj.autoCompForm[index].selectedItems.length = 0
    applicantSearchAutoCompForm[index].selectedItems.length = 0

    if (_.isEmpty(selectedItems)) {
      store.dispatch(applicantSearchAutoComp(applicantSearchAutoCompForm))
      setSearchObj(newObj)
      return
    }

    newObj.autoCompForm[index].selectedItems.push(
      selectedItems[_.size(selectedItems) - 1],
    )
    applicantSearchAutoCompForm[index].selectedItems.push(
      selectedItems[_.size(selectedItems) - 1],
    )

    store.dispatch(applicantSearchAutoComp(applicantSearchAutoCompForm))
    setSearchObj(newObj)
  }

  const changeSearchObjByFromDates = (index: number, from: Dayjs) => {
    const f = new Date(from.year(), from.month(), from.date())

    const newObj = Object.assign({}, searchObj)

    newObj.dates[index].from = f
    applicantSearchDatesForm[index].from = f

    store.dispatch(applicantSearchDates(applicantSearchDatesForm))
    setSearchObj(newObj)
  }

  const changeSearchObjByToDates = (index: number, to: Dayjs) => {
    const t = new Date(to.year(), to.month(), to.date())

    const newObj = Object.assign({}, searchObj)

    newObj.dates[index].to = t
    applicantSearchDatesForm[index].to = t

    store.dispatch(applicantSearchDates(applicantSearchDatesForm))
    setSearchObj(newObj)
  }

  const initInputs = () => {
    const newObj = Object.assign({}, searchObj)

    for (const item of newObj.selectList) {
      for (const option of item.list) {
        option.isSelected = false
      }
    }
    applicantSearchTermList.length = 0

    for (const item of newObj.textForm) {
      item.value = ''
    }
    for (const item of applicantSearchTextList) {
      item.value = ''
    }
    for (const item of newObj.autoCompForm) {
      item.selectedItems.length = 0
    }
    for (const item of applicantSearchAutoCompForm) {
      item.selectedItems.length = 0
    }
    for (const item of newObj.dates) {
      item.from = null
      item.to = null
    }
    for (const item of applicantSearchDatesForm) {
      item.from = null
      item.to = null
    }

    store.dispatch(applicantSearchTerm(applicantSearchTermList))
    store.dispatch(applicantSearchText(applicantSearchTextList))
    store.dispatch(applicantSearchAutoComp(applicantSearchAutoCompForm))
    store.dispatch(applicantSearchDates(applicantSearchDatesForm))
    setSearchObj(newObj)
  }

  const submitUsers = async (hashKeys: string[]) => {
    const a = _.find(checkedList, (c) => c.checked)
    if (_.isUndefined(a)) {
      router.push(RouterPath.Error)
    }

    // API: 面接官割り振り
    await AssignUserCSR({
      user_hash_key: user.hashKey,
      hash_key: a.key,
      hash_keys: hashKeys,
    } as AssignUserRequest)
      .then(async () => {
        toast(t('features.applicant.menu.user') + t('common.toast.create'), {
          style: {
            backgroundColor: setting.toastSuccessColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })

        await search(1, pageSize)
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg, code }) => {
        const error = { isServerError, routerPath, toastMsg, storeMsg, code }
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (code) {
          toast(t(`common.api.code.assign.${String(code)}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
          throw error
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
          throw error
        }

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
  }

  // 選択済みメニュー表示
  const dispMenu: SelectedMenuModel[] = [
    // Google Meet
    {
      name: t('features.applicant.menu.googleMeet'),
      icon: <MeetingRoomIcon sx={[mr(0.25), mb(0.5), FontSize(26)]} />,
      color: blue[300],
      condition: _.every([
        _.isEqual(_.size(_.filter(checkedList, (c) => c.checked)), 1),
        _.findIndex(bodies, (item) =>
          _.isEqual(
            item.hashKey,
            _.filter(checkedList, (c) => c.checked)[0]?.key,
          ),
        ) > -1,
        !_.isEmpty(
          bodies[
            _.findIndex(bodies, (item) =>
              _.isEqual(
                item.hashKey,
                _.filter(checkedList, (c) => c.checked)[0]?.key,
              ),
            )
          ]?.resume,
        ),
        !_.isEmpty(
          bodies[
            _.findIndex(bodies, (item) =>
              _.isEqual(
                item.hashKey,
                _.filter(checkedList, (c) => c.checked)[0]?.key,
              ),
            )
          ]?.curriculumVitae,
        ),
      ]),
      onClick: async () => {
        const hashKey = _.filter(checkedList, (c) => c.checked)[0].key

        try {
          // API Google認証URL作成
          const res2 = await GoogleAuthCSR({
            user_hash_key: user.hashKey,
            hash_key: hashKey,
          } as GoogleAuthRequest)

          window.open(
            _.isEmpty(res2.data?.auth_url)
              ? res2.data?.google_meet_url
              : res2.data?.auth_url,
            '_blank',
            'noopener,noreferrer',
          )
        } catch ({ isServerError, routerPath, toastMsg, storeMsg }) {
          if (isServerError) {
            router.push(routerPath)
            return
          }

          if (!_.isEmpty(toastMsg)) {
            toast(t(toastMsg), {
              style: {
                backgroundColor: setting.toastErrorColor,
                color: common.white,
                width: 500,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
            return
          }

          if (!_.isEmpty(storeMsg)) {
            const msg = t(storeMsg)
            store.dispatch(
              changeSetting({
                errorMsg: _.isEmpty(msg) ? [] : [msg],
              } as SettingModel),
            )
            router.push(
              _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
            )
          }
        }
      },
    },
    // 面接官割振り
    {
      name: t('features.applicant.menu.user'),
      icon: <MeetingRoomIcon sx={[mr(0.25), mb(0.5), FontSize(26)]} />,
      color: common.black,
      condition: _.every([
        _.isEqual(_.size(_.filter(checkedList, (c) => c.checked)), 1),
        _.findIndex(bodies, (item) =>
          _.isEqual(
            item.hashKey,
            _.filter(checkedList, (c) => c.checked)[0]?.key,
          ),
        ) > -1,
        !_.isEmpty(
          bodies[
            _.findIndex(bodies, (item) =>
              _.isEqual(
                item.hashKey,
                _.filter(checkedList, (c) => c.checked)[0]?.key,
              ),
            )
          ]?.resume,
        ),
        !_.isEmpty(
          bodies[
            _.findIndex(bodies, (item) =>
              _.isEqual(
                item.hashKey,
                _.filter(checkedList, (c) => c.checked)[0]?.key,
              ),
            )
          ]?.curriculumVitae,
        ),
        roles[Operation.ManagementApplicantAssignUser],
      ]),
      onClick: async () => {
        isUserSelectOpen(true)
      },
    },
  ]

  // ファイル読み込み
  const readCSVFile = async (file): Promise<string[][]> => {
    const reader = new FileReader()

    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        if (event.target) {
          Papa.parse(event.target.result, {
            header: false,
            complete: (results) => {
              resolve(results.data)
            },
            error: (error) => {
              reject(error)
            },
          })
        }
      }

      reader.onerror = (event) => {
        if (event.target) {
          reject(event.target.error)
        }
      }

      reader.readAsText(file, 'SHIFT-JIS')
    })
  }

  // ファイル読み込み後の処理
  const readFile = async (file: File) => {
    // もろもろチェック
    if (
      _.every([
        roles[Operation.ManagementApplicantDownload],
        file,
        _.some([
          _.isEqual(file.type, 'text/plain'),
          _.isEqual(file.type, 'text/csv'),
        ]),
      ])
    ) {
      // ファイル名チェック
      const site: SiteListResponse = _.find(sites, (s) =>
        file.name.includes(s.fileName),
      )
      if (_.isEmpty(site)) {
        toast(t('common.file.nameError'), {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })
        return
      }

      const csv: string[][] = []

      // ファイル読み込み
      try {
        const data = await readCSVFile(file) // TODO バリデーションをもっと細かくできるといい
        data.pop()
        data.shift()

        for (let i = 0; i < _.size(data); i++) {
          if (!_.isEqual(_.size(data[i]), site.columns + 1)) {
            toast(`${site.name}${t('features.applicant.uploadMsg3')}`, {
              style: {
                backgroundColor: setting.toastErrorColor,
                color: common.white,
                width: 600,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
            return
          }
        }

        for (const item of data) {
          csv.push(item)
        }
      } catch (_) {
        toast(t('common.file.error'), {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })
        return
      }

      isSpinner(true)

      try {
        // API 応募者ダウンロード リクエスト生成
        const subRequest: DownloadApplicantSubRequest[] = []
        for (const item of csv) {
          const outerId = item[site.outerIndex]
          if (
            !_.isEmpty(
              _.filter(subRequest, (s) => _.isEqual(s.outer_id, outerId)),
            )
          )
            continue

          const name =
            site.nameCheckType > 0
              ? item[site.nameIndex]
              : `${item[site.nameIndex]} ${item[site.nameIndex + 1]}`
          const email = item[site.emailIndex]
          const tel = _.isEmpty(item[site.telIndex])
            ? item[site.telIndex + 1]
            : item[site.telIndex]

          const age = item[site.ageIndex].match(/\d+/)
          if (
            _.some([
              _.isEmpty(outerId),
              _.isEmpty(name),
              _.isEmpty(email),
              _.size(outerId) > 100,
              _.size(name) > 50,
              _.size(email) > 100,
              _.isNull(age),
              !new RegExp(Pattern.Email).test(email),
              !new RegExp(Pattern.HalfNum).test(tel),
            ])
          ) {
            toast(`${site.name}${t('features.applicant.uploadMsg3')}`, {
              style: {
                backgroundColor: setting.toastErrorColor,
                color: common.white,
                width: 600,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
            return
          }

          subRequest.push({
            outer_id: outerId,
            name: name,
            email: email,
            tel: tel,
            age: Number(age[0]),
          } as DownloadApplicantSubRequest)
        }

        const request: DownloadApplicantRequest = {
          user_hash_key: user.hashKey,
          site_hash_key: site.hashKey,
          applicants: subRequest,
        }

        // API 応募者ダウンロード
        isPageDisp(false)
        const res = await DownloadApplicantCSR(request)
        toast(
          t('features.applicant.uploadMsgSuccess') +
            String(res.data.update_num) +
            t('features.applicant.uploadMsgSuccess2') +
            t('common.toast.create'),
          {
            style: {
              backgroundColor: setting.toastSuccessColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          },
        )
      } catch ({ isServerError, routerPath, toastMsg, storeMsg }) {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
          return
        }

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      }

      await search(1, pageSize)

      isOpen(false)
      isSpinner(false)
    } else {
      toast(t('common.file.typeError'), {
        style: {
          backgroundColor: setting.toastErrorColor,
          color: common.white,
          width: 500,
        },
        position: 'bottom-left',
        hideProgressBar: true,
        closeButton: () => <ClearIcon />,
      })
      return
    }
  }

  const download = async (hashKey: string, namePre: string) => {
    // API: 書類ダウンロード
    await DownloadApplicantDocumentCSR({
      user_hash_key: user.hashKey,
      hash_key: hashKey,
      name_pre: namePre,
    } as ApplicantDocumentDownloadRequest)
      .then((res) => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: 'application/octet-stream' }),
        )

        const applicant = _.find(bodies, (body) =>
          _.isEqual(body.hashKey, hashKey),
        )

        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `${namePre}_${applicant.name}_${applicant.email}.${
            _.isEqual(namePre, 'resume')
              ? applicant.resume
              : applicant.curriculumVitae
          }`,
        )
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
          return
        }

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
  }

  const [tableHeader, setTableHeader] = useState<Record<string, TableHeader>>({
    no: {
      name: 'No',
      option: {
        isChange: false,
        display: true,
      },
      sort: null,
    },
    name: {
      name: t('features.applicant.header.name'),
      option: {
        isChange: false,
        display: true,
      },
      sort: {
        key: SearchSortKey.Name,
        target: _.isEqual(SearchSortKey.Name, applicantSearchSortList.key),
        isAsc: _.isEqual(SearchSortKey.Name, applicantSearchSortList.key)
          ? applicantSearchSortList.isAsc
          : false,
      },
    },
    email: {
      name: t('features.applicant.header.email'),
      option: {
        isChange: false,
        display: true,
      },
      sort: {
        key: SearchSortKey.Email,
        target: _.isEqual(SearchSortKey.Email, applicantSearchSortList.key),
        isAsc: _.isEqual(SearchSortKey.Email, applicantSearchSortList.key)
          ? applicantSearchSortList.isAsc
          : false,
      },
    },
    site: {
      name: t('features.applicant.header.site'),
      option: {
        isChange: applicantSearchOption['site'].isChange,
        display: applicantSearchOption['site'].display,
      },
      sort: {
        key: SearchSortKey.Site,
        target: _.isEqual(SearchSortKey.Site, applicantSearchSortList.key),
        isAsc: _.isEqual(SearchSortKey.Site, applicantSearchSortList.key)
          ? applicantSearchSortList.isAsc
          : false,
      },
    },
    status: {
      name: t('features.applicant.header.status'),
      option: {
        isChange: applicantSearchOption['status'].isChange,
        display: applicantSearchOption['status'].display,
      },
      sort: {
        key: SearchSortKey.Status,
        target: _.isEqual(SearchSortKey.Status, applicantSearchSortList.key),
        isAsc: _.isEqual(SearchSortKey.Status, applicantSearchSortList.key)
          ? applicantSearchSortList.isAsc
          : true,
      },
    },
    manuscript: {
      name: t('features.applicant.header.manuscript'),
      option: {
        isChange: applicantSearchOption['manuscript'].isChange,
        display: applicantSearchOption['manuscript'].display,
      },
      sort: {
        key: SearchSortKey.Manuscript,
        target: _.isEqual(
          SearchSortKey.Manuscript,
          applicantSearchSortList.key,
        ),
        isAsc: _.isEqual(SearchSortKey.Manuscript, applicantSearchSortList.key)
          ? applicantSearchSortList.isAsc
          : true,
      },
    },
    type: {
      name: t('features.applicant.header.type'),
      option: {
        isChange: applicantSearchOption['type'].isChange,
        display: applicantSearchOption['type'].display,
      },
      sort: {
        key: SearchSortKey.Type,
        target: _.isEqual(SearchSortKey.Type, applicantSearchSortList.key),
        isAsc: _.isEqual(SearchSortKey.Type, applicantSearchSortList.key)
          ? applicantSearchSortList.isAsc
          : true,
      },
    },
    interviewerDate: {
      name: t('features.applicant.header.interviewerDate'),
      option: {
        isChange: applicantSearchOption['interviewerDate'].isChange,
        display: applicantSearchOption['interviewerDate'].display,
      },
      sort: {
        key: SearchSortKey.InterviewerDate,
        target: _.isEqual(
          SearchSortKey.InterviewerDate,
          applicantSearchSortList.key,
        ),
        isAsc: _.isEqual(
          SearchSortKey.InterviewerDate,
          applicantSearchSortList.key,
        )
          ? applicantSearchSortList.isAsc
          : true,
      },
    },
    users: {
      name: t('features.applicant.header.users'),
      option: {
        isChange: applicantSearchOption['users'].isChange,
        display: applicantSearchOption['users'].display,
      },
      sort: null,
    },
    resume: {
      name: t('features.applicant.header.resume'),
      option: {
        isChange: applicantSearchOption['resume'].isChange,
        display: applicantSearchOption['resume'].display,
      },
      sort: null,
    },
    curriculumVitae: {
      name: t('features.applicant.header.curriculumVitae'),
      option: {
        isChange: applicantSearchOption['curriculumVitae'].isChange,
        display: applicantSearchOption['curriculumVitae'].display,
      },
      sort: null,
    },
    createdAt: {
      name: t('features.applicant.header.createdAt'),
      option: {
        isChange: applicantSearchOption['createdAt'].isChange,
        display: applicantSearchOption['createdAt'].display,
      },
      sort: {
        key: SearchSortKey.CreatedAt,
        target: _.isEqual(SearchSortKey.CreatedAt, applicantSearchSortList.key),
        isAsc: _.isEqual(SearchSortKey.CreatedAt, applicantSearchSortList.key)
          ? applicantSearchSortList.isAsc
          : true,
      },
    },
  })

  const changeTarget = (sort: TableSort) => {
    const newObj = Object.assign({}, searchObj)
    const obj = Object.assign({}, tableHeader)
    const list = _.values(obj)

    const index = _.findIndex(list, (item) =>
      _.every([!_.isNull(item.sort), _.isEqual(item.sort?.key, sort.key)]),
    )

    for (const item of _.filter(list, (el, i) =>
      _.every([!_.isEmpty(el.sort), !_.isEqual(i, index)]),
    )) {
      item.sort.target = false
      item.sort.isAsc = true
    }

    list[index].sort.isAsc = !sort.isAsc
    list[index].sort.target = true

    const newSort = {
      key: sort.key,
      isAsc: list[index].sort.isAsc,
    } as SearchSortModel

    Object.assign(applicantSearchSortList, newSort)

    const header: Record<string, TableHeader> = {}
    for (let i = 0; i < _.size(list); i++) {
      header[_.keys(obj)[i]] = list[i]
    }
    setTableHeader(header)
    setSearchObj(newObj)

    store.dispatch(applicantSearchSort(newSort))
  }

  const changePage = (i: number) => {
    setPage(i)
  }
  const changePageSize = (i: number) => {
    setPageSize(i)
  }

  useEffect(() => {
    // トースト
    if (loading) {
      if (!_.isEmpty(setting.errorMsg)) {
        setTimeout(() => {
          for (const msg of setting.errorMsg) {
            toast(msg, {
              style: {
                backgroundColor: setting.toastErrorColor,
                color: common.white,
                width: 630,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
          }
        }, 0.1 * 1000)

        store.dispatch(
          changeSetting({
            errorMsg: [],
          } as SettingModel),
        )
      }

      if (!_.isEmpty(setting.successMsg)) {
        setTimeout(() => {
          for (const msg of setting.successMsg) {
            toast(msg, {
              style: {
                backgroundColor: setting.toastSuccessColor,
                color: common.white,
                width: 630,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
          }
        }, 0.1 * 1000)

        store.dispatch(
          changeSetting({
            successMsg: [],
          } as SettingModel),
        )
      }
    }

    const initialize = async () => {
      try {
        if (isError) {
          router.push(RouterPath.Error)
          return
        }

        if (init) await inits()

        await search(1, pageSize)
      } finally {
        isLoading(false)
      }
    }

    initialize()
  }, [router.pathname])

  return (
    <>
      <NextHead />
      {_.every([
        !isError,
        !loading,
        roles[Operation.ManagementApplicantRead],
      ]) && (
        <>
          {spinner && <Spinner />}
          <Box sx={mt(12)}>
            <Box sx={[SpaceBetween, w(90), M0Auto]}>
              {_.every([pageDisp, !_.isEqual(size, 0)]) && (
                <Pagination
                  show={size > pageSize}
                  currentPage={page}
                  listSize={size}
                  pageSize={pageSize}
                  search={search}
                  changePage={changePage}
                  changePageSize={changePageSize}
                ></Pagination>
              )}
              {_.size(_.filter(checkedList, (c) => c.checked)) > 0 && (
                <SelectedMenu
                  menu={dispMenu}
                  size={_.size(_.filter(checkedList, (c) => c.checked))}
                ></SelectedMenu>
              )}
              <Box
                sx={[
                  TableMenuButtons,
                  mb(3),
                  _.size(_.filter(checkedList, (c) => c.checked)) > 0
                    ? maxW(300)
                    : null,
                ]}
              >
                <Button
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => isSearchOpen(true)}
                >
                  <ViewColumnIcon sx={mr(0.25)} />
                  {t('common.button.columnDisplay')}
                </Button>
                <Button
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => isSearchOpen(true)}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('common.button.condSearch')}
                </Button>
                {roles[Operation.ManagementApplicantDownload] && (
                  <Button
                    variant="contained"
                    sx={[
                      ml(1),
                      ButtonColorInverse(common.white, setting.color),
                    ]}
                    onClick={() => isOpen(true)}
                  >
                    <UploadFileIcon sx={mr(0.25)} />
                    {t('features.applicant.upload')}
                  </Button>
                )}
              </Box>
            </Box>
            <CustomTable
              height={75}
              headers={_.values(
                Object.fromEntries(
                  _.filter(
                    Object.entries(tableHeader),
                    ([_, value]) => value.option.display,
                  ),
                ),
              )}
              isNoContent={noContent}
              bodies={_.map(bodies, (l) => {
                return {
                  no: new Body(String(l.no), tableHeader.no.option.display),
                  name: new Body(l.name, tableHeader.name.option.display),
                  email: new Body(l.email, tableHeader.email.option.display),
                  site: new Body(l.siteName, tableHeader.site.option.display),
                  status: new Body(
                    l.statusName,
                    tableHeader.status.option.display,
                  ),
                  interviewerDate:
                    l.interviewerDate.getFullYear() < 2
                      ? new Body('', tableHeader.interviewerDate.option.display)
                      : new Body(
                          formatDate3(l.interviewerDate),
                          tableHeader.interviewerDate.option.display,
                        ),
                  users: new Body(
                    (
                      <Box sx={DirectionColumnForTable}>
                        {_.map(l.userNames, (user, index) => {
                          return <Box key={index}>{user}</Box>
                        })}
                      </Box>
                    ),
                    tableHeader.users.option.display,
                  ),
                  resume: new Body(
                    _.isEmpty(l.resume) ? (
                      <>{t('features.applicant.documents.f')}</>
                    ) : (
                      <Button
                        variant="text"
                        sx={Resume(setting.color)}
                        onClick={async () => {
                          await download(l.hashKey, 'resume')
                        }}
                      >
                        <UploadFileIcon sx={mr(0.25)} />
                        {t('features.applicant.documents.t')}
                      </Button>
                    ),
                    tableHeader.resume.option.display,
                  ),
                  curriculumVitae: new Body(
                    _.isEmpty(l.curriculumVitae) ? (
                      <>{t('features.applicant.documents.f')}</>
                    ) : (
                      <Button
                        variant="text"
                        sx={Resume(setting.color)}
                        onClick={async () => {
                          await download(l.hashKey, 'curriculum_vitae')
                        }}
                      >
                        <UploadFileIcon sx={mr(0.25)} />
                        {t('features.applicant.documents.t')}
                      </Button>
                    ),
                    tableHeader.curriculumVitae.option.display,
                  ),
                  createdAt: new Body(
                    formatDate(l.createdAt),
                    tableHeader.createdAt.option.display,
                  ),
                }
              })}
              pageSize={pageSize}
              checkbox={
                {
                  checkedList: checkedList,
                  onClick: (i: number, checked: boolean) => {
                    const list = _.cloneDeep(checkedList)
                    list[i].checked = !checked
                    setCheckedList(list)
                  },
                  onClickAll: (b: boolean) => {
                    const list = _.cloneDeep(checkedList)
                    for (const item of list) {
                      item.checked = b
                    }
                    setCheckedList(list)
                  },
                } as CheckboxPropsField
              }
              changeTarget={changeTarget}
              search={search}
              changePage={changePage}
            />
          </Box>
          <UploadModal
            open={open}
            closeModal={() => isOpen(false)}
            afterFuncAsync={readFile}
          ></UploadModal>
          <SearchModal
            open={searchOpen}
            closeModal={() => isSearchOpen(false)}
            searchObj={searchObj}
            changeSearchObjBySelect={changeSearchObjBySelect}
            selectInit={selectInit}
            initInputs={initInputs}
            submit={() => {
              router.push(RouterPath.Management + RouterPath.Back)
            }}
            changePage={changePage}
            changeSearchObjByText={changeSearchObjByText}
            changeSearchObjByAutoComp={changeSearchObjByAutoComp}
            changeSearchObjByFromDates={changeSearchObjByFromDates}
            changeSearchObjByToDates={changeSearchObjByToDates}
          ></SearchModal>
          <ItemsSelectModal
            open={userSelectOpen}
            items={_.map(usersBelongTeam, (u) => {
              return {
                key: u.hashKey,
                title: u.name,
                subTitle: u.email,
              } as SelectTitlesModel
            })}
            selectedItems={
              _.isEmpty(_.filter(checkedList, (c) => c.checked))
                ? []
                : _.filter(bodies, (b) =>
                    _.isEqual(
                      b.hashKey,
                      _.filter(checkedList, (c) => c.checked)[0].key,
                    ),
                  )[0].users
            }
            title={t('features.applicant.menu.user')}
            subTitle={t('features.applicant.assign.subTitle')}
            buttonTitle={t('features.applicant.menu.user')}
            submit={submitUsers}
            close={() => isUserSelectOpen(false)}
          ></ItemsSelectModal>
        </>
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let isError: boolean = false

  // API サイト一覧
  const sites: SiteListResponse[] = []
  await ApplicantSitesSSG()
    .then((res) => {
      _.forEach(res.data.list, (item, index) => {
        sites.push({
          id: Number(index) + 1,
          hashKey: item.hash_key,
          name: item.site_name,
          fileName: item.file_name,
          outerIndex: Number(item.outer_id_index),
          nameIndex: Number(item.name_index),
          emailIndex: Number(item.email_index),
          telIndex: Number(item.tel_index),
          ageIndex: Number(item.age_index),
          nameCheckType: Number(item.name_check_type),
          columns: Number(item.num_of_column),
        } as SiteListResponse)
      })
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      isError,
      locale,
      sites: sites,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Applicants
