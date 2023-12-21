import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import store, { RootState } from '@/hooks/store/store'
import CustomTable from '@/components/Table'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import {
  ApplicantsTableBody,
  CheckboxPropsField,
  SearchForm,
  SearchSelect,
  SearchSelectTerm,
  SearchSelected,
  SearchSortModel,
  SearchText,
  SelectedCheckbox,
  TableHeader,
  TableSort,
} from '@/types/management'
import { useTranslations } from 'next-intl'
import { Box, Button } from '@mui/material'
import { common } from '@mui/material/colors'
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
  SearchIndex,
  SearchSortKey,
  SearchTextIndex,
  Site,
  dispApplicantSite,
} from '@/enum/applicant'
import UploadModal from '@/components/modal/UploadModal'
import {
  ApplicantDocumentDownloadRequest,
  ApplicantSearchRequest,
  ApplicantsDownloadRequest,
} from '@/api/model/management'
import {
  ApplicantSitesSSG,
  ApplicantStatusListSSG,
  applicantDocumentDownloadCSR,
  applicantsDownloadCSR,
  applicantsSearchCSR,
} from '@/api/repository'
import _ from 'lodash'
import { useRouter } from 'next/router'
import NextHead from '@/components/Header'
import {
  M0Auto,
  mb,
  ml,
  mr,
  mt,
  Resume,
  SpaceBetween,
  TableMenu,
  TableMenuButtons,
  w,
} from '@/styles/index'
import { RouterPath } from '@/enum/router'
import { Role } from '@/enum/user'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import SearchModal from '@/components/modal/SearchModal'
import {
  mgApplicantSearchSort,
  mgApplicantSearchTermList,
  mgApplicantSearchText,
} from '@/hooks/store'
import Pagination from '@/components/Pagination'

const APPLICANT_PAGE_SIZE = 30

const Applicants = ({ api, isError, locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const applicant = useSelector(
    (state: RootState) => state.management.applicant,
  )
  const applicantSearchTermList = cloneDeep(applicant.search.selectedList)
  const applicantSearchText = cloneDeep(applicant.search.textForm)
  const applicantSearchSort = Object.assign({}, applicant.search.sort)
  const user = useSelector((state: RootState) => state.management.user)
  const setting = useSelector((state: RootState) => state.management.setting)

  const [bodies, setBodies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [checkedList, setCheckedList] = useState<SelectedCheckbox[]>([])

  const search = async (currentPage?: number) => {
    // API 応募者一覧
    const list: ApplicantsTableBody[] = []
    const list2: SelectedCheckbox[] = []
    setIsLoading(true)
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
            mail: r.email,
            age: Number(r.age),
            status: Number(r.status),
            statusName: r[`status_name_${locale}`],
            interviewerDate: r.desired_at,
            resume: r.resume,
            curriculumVitae: r.curriculum_vitae,
          })
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
        setIsLoading(false)
      })
      .catch((error) => {
        if (
          every([500 <= error.response.status, error.response.status < 600])
        ) {
          router.push(RouterPath.ManagementError)
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

  useEffect(() => {
    if (isError) router.push(RouterPath.ManagementError)
    search(1)
  }, [])

  const [searchObj, setSearchObj] = useState<SearchForm>({
    selectList: [
      {
        name: t('management.features.applicant.header.status'),
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
        name: t('management.features.applicant.header.site'),
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
        name: t('management.features.applicant.header.resume'),
        isRadio: true,
        list: [
          {
            id: DocumentUploaded.Exist,
            value: t('management.features.applicant.documents.t'),
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
            value: t('management.features.applicant.documents.f'),
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
        name: t('management.features.applicant.header.curriculumVitae'),
        isRadio: true,
        list: [
          {
            id: DocumentUploaded.Exist,
            value: t('management.features.applicant.documents.t'),
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
            value: t('management.features.applicant.documents.f'),
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

    store.dispatch(mgApplicantSearchTermList(applicantSearchTermList))
    store.dispatch(mgApplicantSearchText(applicantSearchText))
    setSearchObj(newObj)
  }

  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

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
          // router.push(RouterPath.ManagementApplicant) // これだと画面が固まる…
        })
        .catch(() => {
          router.push(RouterPath.ManagementError)
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
          router.push(RouterPath.ManagementError)
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
      name: t('management.features.applicant.header.name'),
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
      name: t('management.features.applicant.header.site'),
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
      name: t('management.features.applicant.header.mail'),
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
      name: t('management.features.applicant.header.age'),
      sort: null,
    },
    {
      id: 6,
      name: t('management.features.applicant.header.status'),
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
      name: t('management.features.applicant.header.interviewerDate'),
      sort: null,
    },
    {
      id: 8,
      name: t('management.features.applicant.header.resume'),
      sort: null,
    },
    {
      id: 9,
      name: t('management.features.applicant.header.curriculumVitae'),
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

  return (
    <>
      <NextHead></NextHead>
      {every([!isError, !isLoading]) && (
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
              <Box sx={[TableMenuButtons, , mb(3)]}>
                <Button
                  variant="contained"
                  sx={[
                    ml(1),
                    {
                      backgroundColor: setting.color,
                      '&:hover': {
                        backgroundColor: common.white,
                        color: setting.color,
                      },
                    },
                  ]}
                  onClick={() => setSearchOpen(true)}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('management.features.applicant.search')}
                </Button>
                {isEqual(user.role, Role.Admin) && (
                  <Button
                    variant="contained"
                    sx={[
                      ml(1),
                      {
                        backgroundColor: setting.color,
                        '&:hover': {
                          backgroundColor: common.white,
                          color: setting.color,
                        },
                      },
                    ]}
                    onClick={() => setOpen(true)}
                  >
                    <UploadFileIcon sx={mr(0.25)} />
                    {t('management.features.applicant.upload')}
                  </Button>
                )}
              </Box>
            </Box>
            <CustomTable
              headers={tableHeader}
              bodies={map(bodies, (l) => {
                return {
                  no: l.no,
                  name: l.name,
                  site: t(dispApplicantSite(l.site)),
                  mail: l.mail,
                  age: l.age,
                  status: l.statusName,
                  interviewerDate: isEmpty(l.interviewerDate)
                    ? '-'
                    : l.interviewerDate,
                  resume: isEmpty(l.resume) ? (
                    <>{t('management.features.applicant.documents.f')}</>
                  ) : (
                    <Button
                      variant="text"
                      sx={Resume(setting.color)}
                      onClick={async () => {
                        await download(l.hashKey, 'resume', l.resume)
                      }}
                    >
                      <UploadFileIcon sx={mr(0.25)} />
                      {t('management.features.applicant.documents.t')}
                    </Button>
                  ),
                  curriculumVitae: isEmpty(l.curriculumVitae) ? (
                    <>{t('management.features.applicant.documents.f')}</>
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
                      {t('management.features.applicant.documents.t')}
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
          ></SearchModal>
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

  return {
    props: {
      api: {
        applicantStatusList: applicantStatusList,
        applicantSites: applicantSites,
      },
      isError,
      locale,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default Applicants
