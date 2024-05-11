import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import store, { RootState } from '@/hooks/store/store'
import CustomTable from '@/components/common/Table'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import {
  ApplicantsTableBody,
  CheckboxPropsField,
  SearchAutoComplete,
  SearchForm,
  SearchSelect,
  SearchSelectTerm,
  SearchSelected,
  SearchSortModel,
  SearchText,
  SelectTitlesModel,
  SelectedCheckbox,
  SelectedMenuModel,
  TableHeader,
  TableSort,
  UsersTableBody,
} from '@/types/management'
import { useTranslations } from 'next-intl'
import { Box, Button } from '@mui/material'
import { blue, common } from '@mui/material/colors'
import {
  cloneDeep,
  every,
  filter,
  find,
  findIndex,
  isEmpty,
  isEqual,
  isNull,
  map,
  min,
  size,
} from 'lodash'
import {
  DocumentUploaded,
  SearchAutoCompIndex,
  SearchIndex,
  SearchSortKey,
  SearchTextIndex,
  Site,
} from '@/enum/applicant'
import UploadModal from '@/components/modal/UploadModal'
import {
  ApplicantDocumentDownloadRequest,
  ApplicantSearchRequest,
  ApplicantsDownloadRequest,
  GoogleMeetURLRequest,
  HashKeyRequest,
  SchedulesRequest,
} from '@/api/model/request'
import {
  ApplicantSitesSSG,
  ApplicantStatusListSSG,
  GetApplicantCSR,
  GoogleAuth,
  UpdateSchedulesCSR,
  UserListCSR,
  UserListSSG,
  applicantDocumentDownloadCSR,
  applicantsDownloadCSR,
  applicantsSearchCSR,
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
import { Role } from '@/enum/user'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import SearchModal from '@/components/modal/SearchModal'
import {
  mgApplicantSearchAutoComp,
  mgApplicantSearchSort,
  mgApplicantSearchTermList,
  mgApplicantSearchText,
} from '@/hooks/store'
import Pagination from '@/components/common/Pagination'
import { formatDate2 } from '@/hooks/common'
import SelectedMenu from '@/components/common/SelectedMenu'
import ItemsSelectModal from '@/components/modal/ItemsSelectModal'

const APPLICANT_PAGE_SIZE = 30

const Applicants = ({ api, isError, locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const applicant = useSelector((state: RootState) => state.applicant)
  const applicantSearchTermList = cloneDeep(applicant.search.selectedList)
  const applicantSearchText = cloneDeep(applicant.search.textForm)
  const applicantSearchAutoCompForm = cloneDeep(applicant.search.autoCompForm)
  const applicantSearchSort = Object.assign({}, applicant.search.sort)
  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [bodies, setBodies] = useState<ApplicantsTableBody[]>([])
  const [loading, IsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [checkedList, setCheckedList] = useState<SelectedCheckbox[]>([])

  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userSelectOpen, setUserSelectOpen] = useState(false)

  const search = async (currentPage?: number) => {
    // API 応募者一覧
    const list: ApplicantsTableBody[] = []
    const list2: SelectedCheckbox[] = []
    IsLoading(true)
    await applicantsSearchCSR({
      site_id_list: map(
        filter(applicantSearchTermList, (item) =>
          isEqual(item.index, SearchIndex.Site),
        ),
        (item2) => {
          return item2.id
        },
      ),
      applicant_status_list: map(
        filter(applicantSearchTermList, (item) =>
          isEqual(item.index, SearchIndex.Status),
        ),
        (item2) => {
          return item2.id
        },
      ),
      resume: isEmpty(
        filter(applicantSearchTermList, (item) =>
          isEqual(item.index, SearchIndex.Resume),
        ),
      )
        ? null
        : map(
            filter(applicantSearchTermList, (item) =>
              isEqual(item.index, SearchIndex.Resume),
            ),
            (item2) => {
              return item2.id
            },
          )[0],
      curriculum_vitae: isEmpty(
        filter(applicantSearchTermList, (item) =>
          isEqual(item.index, SearchIndex.CurriculumVitae),
        ),
      )
        ? null
        : map(
            filter(applicantSearchTermList, (item) =>
              isEqual(item.index, SearchIndex.CurriculumVitae),
            ),
            (item2) => {
              return item2.id
            },
          )[0],
      name: applicantSearchText[SearchTextIndex.Name].value.trim(),
      email: applicantSearchText[SearchTextIndex.Mail].value.trim(),
      users: map(
        applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer]
          .selectedItems,
        (item) => {
          return item.key
        },
      )
        .join(',')
        .trim(),
      sort_key: applicantSearchSort.key,
      sort_asc: applicantSearchSort.isAsc,
    } as ApplicantSearchRequest)
      .then((res) => {
        _.forEach(res.data.applicants, (r, index) => {
          list.push({
            no: Number(index) + 1,
            hashKey: r.hash_key,
            name: r.name,
            site: Number(r.site_id),
            siteName: r[`site_name_${locale}`],
            mail: r.email,
            age: Number(r.age),
            status: Number(r.status),
            statusName: r[`status_name_${locale}`],
            interviewerDate: new Date(r.desired_at),
            google: r.google_meet_url,
            resume: r.resume,
            curriculumVitae: r.curriculum_vitae,
            users: String(r.users).split(','),
            userNames: String(r.user_names).split(','),
            calendarHashKey: r.calendar_hash_key,
          } as ApplicantsTableBody)
        })
        setBodies(list)

        if (currentPage) {
          _.forEach(
            res.data.applicants.slice(
              APPLICANT_PAGE_SIZE * (currentPage - 1),
              min([APPLICANT_PAGE_SIZE * currentPage, size(list)]),
            ),
            (r) => {
              list2.push({
                key: r.hash_key,
                checked: false,
              } as SelectedCheckbox)
            },
          )
          setCheckedList(list2)
        }
        IsLoading(false)
      })
      .catch((error) => {
        if (
          every([500 <= error.response.status, error.response.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
          toast(t(`common.api.code.${error.response.data.code}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
        }
      })
  }

  const [searchObj, setSearchObj] = useState<SearchForm>({
    selectList: [
      {
        name: t('features.applicant.header.status'),
        isRadio: false,
        list: map(api.applicantStatusList, (item) => {
          return {
            id: Number(item.id),
            value: item[`status_name_${locale}`],
            isSelected: !isEmpty(
              find(applicantSearchTermList, (option) => {
                return every([
                  isEqual(option.id, Number(item.id)),
                  isEqual(option.index, SearchIndex.Status),
                ])
              }),
            ),
          }
        }) as SearchSelectTerm[],
      },
      {
        name: t('features.applicant.header.site'),
        isRadio: false,
        list: map(api.applicantSites, (item) => {
          return {
            id: Number(item.id),
            value: item[`site_name_${locale}`],
            isSelected: !isEmpty(
              find(applicantSearchTermList, (option) => {
                return every([
                  isEqual(option.id, Number(item.id)),
                  isEqual(option.index, SearchIndex.Site),
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
            isSelected: !isEmpty(
              find(applicantSearchTermList, (option) => {
                return every([
                  isEqual(option.id, DocumentUploaded.Exist),
                  isEqual(option.index, SearchIndex.Resume),
                ])
              }),
            ),
          },
          {
            id: DocumentUploaded.NotExist,
            value: t('features.applicant.documents.f'),
            isSelected: !isEmpty(
              find(applicantSearchTermList, (option) => {
                return every([
                  isEqual(option.id, DocumentUploaded.NotExist),
                  isEqual(option.index, SearchIndex.Resume),
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
            isSelected: !isEmpty(
              find(applicantSearchTermList, (option) => {
                return every([
                  isEqual(option.id, DocumentUploaded.Exist),
                  isEqual(option.index, SearchIndex.CurriculumVitae),
                ])
              }),
            ),
          },
          {
            id: DocumentUploaded.NotExist,
            value: t('features.applicant.documents.f'),
            isSelected: !isEmpty(
              find(applicantSearchTermList, (option) => {
                return every([
                  isEqual(option.id, DocumentUploaded.NotExist),
                  isEqual(option.index, SearchIndex.CurriculumVitae),
                ])
              }),
            ),
          },
        ] as SearchSelectTerm[],
      },
    ] as SearchSelect[],
    textForm: [
      {
        id: applicantSearchText[SearchTextIndex.Name].id,
        name: t(applicantSearchText[SearchTextIndex.Name].name),
        value: applicantSearchText[SearchTextIndex.Name].value,
      },
      {
        id: applicantSearchText[SearchTextIndex.Mail].id,
        name: t(applicantSearchText[SearchTextIndex.Mail].name),
        value: applicantSearchText[SearchTextIndex.Mail].value,
      },
    ] as SearchText[],
    autoCompForm: [
      {
        id: applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer].id,
        name: t(
          applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer].name,
        ),
        items: map(api.users, (u) => {
          return {
            key: u.hashKey,
            title: u.name,
            subTitle: u.mail,
          } as SelectTitlesModel
        }) as SelectTitlesModel[],
        selectedItems:
          applicantSearchAutoCompForm[SearchAutoCompIndex.Interviewer]
            .selectedItems,
      },
    ] as SearchAutoComplete[],
  })

  const changeSearchObjBySelect = (
    index: number,
    index2: number,
    optionId: number,
    isRadio: boolean,
  ) => {
    const newObj = Object.assign({}, searchObj)
    if (isRadio) {
      for (const option of newObj.selectList[index].list) {
        option.isSelected = false
      }
      while (
        findIndex(applicantSearchTermList, (item) =>
          isEqual(item.index, index),
        ) > -1
      ) {
        const i = findIndex(applicantSearchTermList, (item) =>
          isEqual(item.index, index),
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
      } as SearchSelected)
      store.dispatch(mgApplicantSearchTermList(applicantSearchTermList))
    } else {
      const i = findIndex(applicantSearchTermList, (item) =>
        every([isEqual(item.index, index), isEqual(item.id, optionId)]),
      )
      applicantSearchTermList.splice(i, 1)

      store.dispatch(mgApplicantSearchTermList(applicantSearchTermList))
    }
  }

  const selectInit = (index: number) => {
    const newObj = Object.assign({}, searchObj)

    for (const option of newObj.selectList[index].list) {
      option.isSelected = false
    }
    while (
      findIndex(applicantSearchTermList, (item) => isEqual(item.index, index)) >
      -1
    ) {
      const i = findIndex(applicantSearchTermList, (item) =>
        isEqual(item.index, index),
      )
      applicantSearchTermList.splice(i, 1)
    }

    store.dispatch(mgApplicantSearchTermList(applicantSearchTermList))
    setSearchObj(newObj)
  }

  const changeSearchObjByText = (index: number, value: string) => {
    const newObj = Object.assign({}, searchObj)
    newObj.textForm[index].value = value
    applicantSearchText[index].value = value
    store.dispatch(mgApplicantSearchText(applicantSearchText))
    setSearchObj(newObj)
  }

  const changeSearchObjByAutoComp = (
    index: number,
    selectedItems: SelectTitlesModel[],
  ) => {
    const newObj = Object.assign({}, searchObj)
    newObj.autoCompForm[index].selectedItems.length = 0
    applicantSearchAutoCompForm[index].selectedItems.length = 0

    if (isEmpty(selectedItems)) {
      store.dispatch(mgApplicantSearchAutoComp(applicantSearchAutoCompForm))
      setSearchObj(newObj)
      return
    }

    newObj.autoCompForm[index].selectedItems.push(
      selectedItems[size(selectedItems) - 1],
    )
    applicantSearchAutoCompForm[index].selectedItems.push(
      selectedItems[size(selectedItems) - 1],
    )

    store.dispatch(mgApplicantSearchAutoComp(applicantSearchAutoCompForm))
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
    for (const item of applicantSearchText) {
      item.value = ''
    }
    for (const item of newObj.autoCompForm) {
      item.selectedItems.length = 0
    }
    for (const item of applicantSearchAutoCompForm) {
      item.selectedItems.length = 0
    }

    store.dispatch(mgApplicantSearchTermList(applicantSearchTermList))
    store.dispatch(mgApplicantSearchText(applicantSearchText))
    store.dispatch(mgApplicantSearchAutoComp(applicantSearchAutoCompForm))
    setSearchObj(newObj)
  }

  const submitUsers = async (hashKeys: string[]) => {
    const applicantHashKey = filter(checkedList, (c) => c.checked)[0].key
    const calendarHashKey = filter(bodies, (b) =>
      isEqual(b.hashKey, applicantHashKey),
    )[0].calendarHashKey
    await UpdateSchedulesCSR({
      hash_key: calendarHashKey,
      applicant_hash_key: applicantHashKey,
      user_hash_keys: hashKeys.join(','),
    } as SchedulesRequest)
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

        await search(1)
      })
      .catch((error) => {
        if (
          every([500 <= error.response.status, error.response.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
          toast(t(`common.api.code.${error.response.data.code}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
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
      condition: every([
        isEqual(size(filter(checkedList, (c) => c.checked)), 1),
        findIndex(bodies, (item) =>
          isEqual(item.hashKey, filter(checkedList, (c) => c.checked)[0]?.key),
        ) > -1,
        !isEmpty(
          bodies[
            findIndex(bodies, (item) =>
              isEqual(
                item.hashKey,
                filter(checkedList, (c) => c.checked)[0]?.key,
              ),
            )
          ]?.resume,
        ),
      ]),
      onClick: async () => {
        const hashKey = filter(checkedList, (c) => c.checked)[0].key

        try {
          // API 応募者取得(1件)
          const res = await GetApplicantCSR({
            hash_key: hashKey,
          } as HashKeyRequest)

          if (!isEmpty(res.data?.google_meet_url)) {
            window.open(
              res.data?.google_meet_url,
              '_blank',
              'noopener,noreferrer',
            )
            return
          }

          // API Google認証URL作成
          const res2 = await GoogleAuth({
            applicant: {
              hash_key: hashKey,
            } as HashKeyRequest,
            user_hash_key: user.hashKey,
          } as GoogleMeetURLRequest)

          window.open(res2.data?.url, '_blank', 'noopener,noreferrer')
        } catch (error) {
          if (error.response) {
            if (500 <= error.response.status && error.response.status < 600) {
              router.push(RouterPath.Error)
              return
            }

            if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
              toast(t(`common.api.code.${error.response.data.code}`), {
                style: {
                  backgroundColor: setting.toastErrorColor,
                  color: common.white,
                  width: 500,
                },
                position: 'bottom-left',
                hideProgressBar: true,
                closeButton: () => <ClearIcon />,
              })
            }
          }
        }
      },
    },
    // 面接官割振り
    {
      name: t('features.applicant.menu.user'),
      icon: <MeetingRoomIcon sx={[mr(0.25), mb(0.5), FontSize(26)]} />,
      color: common.black,
      condition: every([
        isEqual(size(filter(checkedList, (c) => c.checked)), 1),
        findIndex(bodies, (item) =>
          isEqual(item.hashKey, filter(checkedList, (c) => c.checked)[0]?.key),
        ) > -1,
        !isEmpty(
          bodies[
            findIndex(bodies, (item) =>
              isEqual(
                item.hashKey,
                filter(checkedList, (c) => c.checked)[0]?.key,
              ),
            )
          ]?.resume,
        ),
        isEqual(user.role, Role.Admin),
      ]),
      onClick: async () => {
        setUserSelectOpen(true)
      },
    },
  ]

  const readTextFile = async (file: File) => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        if (event.target) {
          resolve(event.target.result)
        }
      }
      reader.onerror = (event) => {
        if (event.target) {
          reject(event.target.error)
        }
      }
      reader.readAsText(file, 'SHIFT-JIS') // リクナビの仕様上、SHIFT-JIS エンコーディングを指定
    })
  }
  const readFile = async (file: File) => {
    if (_.isEqual(file.type, 'text/plain')) {
      const text = String(await readTextFile(file))

      const lines = text.split('\n')
      // const header = lines[0].split(',')
      const body: string[][] = []
      _.forEach(lines, (values, index) => {
        if (index > 0) {
          const list: string[] = []
          for (const value of values.split(',')) {
            list.push(value)
          }
          body.push(list)
        }
      })
      body.pop()
      console.dir(body)

      // API通信
      const req: ApplicantsDownloadRequest = {
        values: body,
        site: Site.Recruit,
      }
      await applicantsDownloadCSR(req)
        .then(() => {
          router.reload()
          // router.push(RouterPath.Applicant) // これだと画面が固まる…
        })
        .catch(() => {
          router.push(RouterPath.Error)
        })
    } else {
      console.error('選択されたファイルはtxtファイルではありません。')
    }
  }

  const download = async (
    hashKey: string,
    namePre: string,
    fileName: string,
  ) => {
    await applicantDocumentDownloadCSR({
      hash_key: hashKey,
      name_pre: namePre,
    } as ApplicantDocumentDownloadRequest)
      .then((res) => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: 'application/octet-stream' }),
        )
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        if (
          every([500 <= error.response.status, error.response.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
          toast(t(`common.api.code.${error.response.data.code}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
        }
      })
  }

  const [tableHeader, setTableHeader] = useState<TableHeader[]>([
    {
      id: 1,
      name: 'No',
      sort: null,
    },
    {
      id: 2,
      name: t('features.applicant.header.name'),
      sort: {
        key: SearchSortKey.Name,
        target: isEqual(SearchSortKey.Name, applicantSearchSort.key),
        isAsc: isEqual(SearchSortKey.Name, applicantSearchSort.key)
          ? applicantSearchSort.isAsc
          : false,
      },
    },
    {
      id: 3,
      name: t('features.applicant.header.site'),
      sort: {
        key: SearchSortKey.Site,
        target: isEqual(SearchSortKey.Site, applicantSearchSort.key),
        isAsc: isEqual(SearchSortKey.Site, applicantSearchSort.key)
          ? applicantSearchSort.isAsc
          : false,
      },
    },
    {
      id: 4,
      name: t('features.applicant.header.mail'),
      sort: {
        key: SearchSortKey.Mail,
        target: isEqual(SearchSortKey.Mail, applicantSearchSort.key),
        isAsc: isEqual(SearchSortKey.Mail, applicantSearchSort.key)
          ? applicantSearchSort.isAsc
          : false,
      },
    },
    {
      id: 5,
      name: t('features.applicant.header.age'),
      sort: null,
    },
    {
      id: 6,
      name: t('features.applicant.header.status'),
      sort: {
        key: SearchSortKey.Status,
        target: isEqual(SearchSortKey.Status, applicantSearchSort.key),
        isAsc: isEqual(SearchSortKey.Status, applicantSearchSort.key)
          ? applicantSearchSort.isAsc
          : true,
      },
    },
    {
      id: 7,
      name: t('features.applicant.header.interviewerDate'),
      sort: {
        key: SearchSortKey.IntervierDate,
        target: isEqual(SearchSortKey.Status, applicantSearchSort.key),
        isAsc: isEqual(SearchSortKey.Status, applicantSearchSort.key)
          ? applicantSearchSort.isAsc
          : true,
      },
    },
    {
      id: 8,
      name: t('features.applicant.header.users'),
      sort: null,
    },
    {
      id: 9,
      name: t('features.applicant.header.resume'),
      sort: null,
    },
    {
      id: 10,
      name: t('features.applicant.header.curriculumVitae'),
      sort: null,
    },
  ])

  const changeTarget = (sort: TableSort) => {
    const newObj = Object.assign({}, searchObj)
    const list = cloneDeep(tableHeader)

    const index = findIndex(list, (item) =>
      every([!isNull(item.sort), isEqual(item.sort?.key, sort.key)]),
    )

    for (const item of filter(list, (el) => !isEmpty(el.sort))) {
      item.sort.target = false
      item.sort.isAsc = true
    }

    list[index].sort.isAsc = !sort.isAsc
    list[index].sort.target = true

    const newSort = {
      key: sort.key,
      isAsc: !sort.isAsc,
    } as SearchSortModel

    Object.assign(applicantSearchSort, newSort)
    setTableHeader(list)
    setSearchObj(newObj)

    store.dispatch(mgApplicantSearchSort(newSort))
  }

  const changePage = (i: number) => {
    setPage(i)
  }

  useEffect(() => {
    if (isError) router.push(RouterPath.Error)

    search(1)
  }, [])

  return (
    <>
      <NextHead></NextHead>
      {every([!isError, !loading]) && (
        <>
          <Box sx={mt(12)}>
            <Box sx={[SpaceBetween, w(90), M0Auto]}>
              {size(bodies) > APPLICANT_PAGE_SIZE && (
                <Pagination
                  currentPage={page}
                  listSize={size(bodies)}
                  pageSize={APPLICANT_PAGE_SIZE}
                  search={search}
                  changePage={changePage}
                ></Pagination>
              )}
              {size(filter(checkedList, (c) => c.checked)) > 0 && (
                <SelectedMenu
                  menu={dispMenu}
                  size={size(filter(checkedList, (c) => c.checked))}
                ></SelectedMenu>
              )}
              <Box
                sx={[
                  TableMenuButtons,
                  mb(3),
                  size(filter(checkedList, (c) => c.checked)) > 0
                    ? maxW(300)
                    : null,
                ]}
              >
                <Button
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => setSearchOpen(true)}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('features.applicant.search')}
                </Button>
                {isEqual(user.role, Role.Admin) && (
                  <Button
                    variant="contained"
                    sx={[
                      ml(1),
                      ButtonColorInverse(common.white, setting.color),
                    ]}
                    onClick={() => setOpen(true)}
                  >
                    <UploadFileIcon sx={mr(0.25)} />
                    {t('features.applicant.upload')}
                  </Button>
                )}
              </Box>
            </Box>
            <CustomTable
              height={75}
              headers={tableHeader}
              bodies={map(bodies, (l) => {
                return {
                  no: l.no,
                  name: l.name,
                  site: l.siteName,
                  mail: l.mail,
                  age: l.age,
                  status: l.statusName,
                  interviewerDate:
                    l.interviewerDate.getFullYear() < 2
                      ? '-'
                      : formatDate2(l.interviewerDate),
                  users: (
                    <Box sx={DirectionColumnForTable}>
                      {map(l.userNames, (user, index) => {
                        return <Box key={index}>{user}</Box>
                      })}
                    </Box>
                  ),
                  resume: isEmpty(l.resume) ? (
                    <>{t('features.applicant.documents.f')}</>
                  ) : (
                    <Button
                      variant="text"
                      sx={Resume(setting.color)}
                      onClick={async () => {
                        await download(l.hashKey, 'resume', l.resume)
                      }}
                    >
                      <UploadFileIcon sx={mr(0.25)} />
                      {t('features.applicant.documents.t')}
                    </Button>
                  ),
                  curriculumVitae: isEmpty(l.curriculumVitae) ? (
                    <>{t('features.applicant.documents.f')}</>
                  ) : (
                    <Button
                      variant="text"
                      sx={Resume(setting.color)}
                      onClick={async () => {
                        await download(
                          l.hashKey,
                          'curriculum_vitae',
                          l.curriculumVitae,
                        )
                      }}
                    >
                      <UploadFileIcon sx={mr(0.25)} />
                      {t('features.applicant.documents.t')}
                    </Button>
                  ),
                }
              }).slice(
                APPLICANT_PAGE_SIZE * (page - 1),
                APPLICANT_PAGE_SIZE * page,
              )}
              checkbox={
                {
                  checkedList: checkedList,
                  onClick: (i: number, checked: boolean) => {
                    const list = cloneDeep(checkedList)
                    list[i].checked = !checked
                    setCheckedList(list)
                  },
                  onClickAll: (b: boolean) => {
                    const list = cloneDeep(checkedList)
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
            closeModal={() => setOpen(false)}
            afterFuncAsync={readFile}
          ></UploadModal>
          <SearchModal
            open={searchOpen}
            closeModal={() => setSearchOpen(false)}
            searchObj={searchObj}
            changeSearchObjBySelect={changeSearchObjBySelect}
            selectInit={selectInit}
            initInputs={initInputs}
            submit={search}
            changePage={changePage}
            changeSearchObjByText={changeSearchObjByText}
            changeSearchObjByAutoComp={changeSearchObjByAutoComp}
          ></SearchModal>
          <ItemsSelectModal
            open={userSelectOpen}
            items={map(api.users, (u) => {
              return {
                key: u.hashKey,
                title: u.name,
                subTitle: u.mail,
              } as SelectTitlesModel
            })}
            selectedItems={
              isEmpty(filter(checkedList, (c) => c.checked))
                ? []
                : filter(bodies, (b) =>
                    isEqual(
                      b.hashKey,
                      filter(checkedList, (c) => c.checked)[0].key,
                    ),
                  )[0].users
            }
            title={t('features.applicant.menu.user')}
            subTitle={t('features.applicant.assign.subTitle')}
            buttonTitle={t('features.applicant.menu.user')}
            submit={submitUsers}
            close={() => setUserSelectOpen(false)}
          ></ItemsSelectModal>
        </>
      )}
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  let isError: boolean = false

  const applicantStatusList = []
  await ApplicantStatusListSSG()
    .then((res) => {
      for (const item of res.data.list) {
        applicantStatusList.push(item)
      }
    })
    .catch(() => {
      isError = true
    })

  const applicantSites = []
  await ApplicantSitesSSG()
    .then((res) => {
      for (const item of res.data.list) {
        applicantSites.push(item)
      }
    })
    .catch(() => {
      isError = true
    })

  const users: UsersTableBody[] = []
  await UserListSSG()
    .then((res) => {
      _.forEach(res.data.users, (u, index) => {
        users.push({
          no: Number(index) + 1,
          hashKey: u.hash_key,
          name: u.name,
          mail: u.email,
          role: Number(u.role_id),
          roleName: u[`role_name_${locale}`],
        } as UsersTableBody)
      })
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      api: {
        applicantStatusList: applicantStatusList,
        applicantSites: applicantSites,
        users: users as UsersTableBody[],
      },
      isError,
      locale,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Applicants
