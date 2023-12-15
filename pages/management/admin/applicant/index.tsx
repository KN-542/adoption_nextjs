import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import store, { RootState } from '@/hooks/store/store'
import EnhancedTable from '@/components/Table'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import {
  ApplicantsTableBody,
  SearchForm,
  SearchSelect,
  SearchSelectTerm,
  SearchSelected,
  TableHeader,
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
  map,
} from 'lodash'
import {
  ApplicantStatus,
  SearchIndex,
  Site,
  dispApplicantSite,
  dispApplicantStatus,
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
import { ml, mr, mt, Resume, TableMenu, TableMenuButtons } from '@/styles/index'
import { RouterPath } from '@/enum/router'
import { Role } from '@/enum/user'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import Search from '@/components/Search'
import SearchModal from '@/components/modal/SearchModal'
import { mgApplicantSearchTermList } from '@/hooks/store'

const Applicants = ({ api, isError, locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const applicant = useSelector(
    (state: RootState) => state.management.applicant,
  )
  const applicantSearchTermList = cloneDeep(applicant.searchTermList)
  const user = useSelector((state: RootState) => state.management.user)
  const setting = useSelector((state: RootState) => state.management.setting)

  const [bodies, setBodies] = useState([])

  const search = async () => {
    // API 応募者一覧
    const list: ApplicantsTableBody[] = []
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
            status: r[`status_name_${locale}`],
            interviewerDate: isEmpty(r.desired_at) ? '-' : r.desired_at,
            resume: r.resume,
            curriculumVitae: r.curriculum_vitae,
          })
        })

        setBodies(list)
      })
      .catch(() => {
        router.push(RouterPath.ManagementError)
      })
  }

  useEffect(() => {
    if (isError) router.push(RouterPath.ManagementError)
    search()
  }, [])

  const [searchObj, setSearchObj] = useState<SearchForm>({
    selectList: [
      {
        name: t('management.features.applicant.searchModal.status'),
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
        name: t('management.features.applicant.searchModal.site'),
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
    ] as SearchSelect[],
  })

  const changeSearchObjBySelect = (
    index: number,
    index2: number,
    optionId: number,
  ) => {
    const newObj = Object.assign({}, searchObj)
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

  const selectInit = () => {
    for (const item of searchObj.selectList) {
      for (const option of item.list) {
        option.isSelected = false
      }
    }

    applicantSearchTermList.length = 0
    store.dispatch(mgApplicantSearchTermList(applicantSearchTermList))
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

  const tableHeader: TableHeader[] = [
    {
      id: 1,
      name: 'No',
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 2,
      name: t('management.features.applicant.header.name'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 3,
      name: t('management.features.applicant.header.site'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 4,
      name: t('management.features.applicant.header.mail'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 5,
      name: t('management.features.applicant.header.age'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 6,
      name: t('management.features.applicant.header.status'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 7,
      name: t('management.features.applicant.header.interviewerDate'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 8,
      name: t('management.features.applicant.header.resume'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
    {
      id: 9,
      name: t('management.features.applicant.header.curriculumVitae'),
      sort: {
        target: false,
        isAsc: false,
      },
    },
  ]

  return (
    <>
      <NextHead></NextHead>
      {!isError && (
        <>
          <Box sx={mt(12)}>
            <Box sx={TableMenuButtons}>
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
            <EnhancedTable
              headers={tableHeader}
              bodies={map(bodies, (l) => {
                return {
                  no: l.no,
                  name: l.name,
                  site: t(dispApplicantSite(l.site)),
                  mail: l.mail,
                  age: l.age,
                  status: l.status,
                  interviewerDate: l.interviewerDate,
                  resume: isEmpty(l.resume) ? (
                    <>{t('management.features.applicant.documents.f')}</>
                  ) : (
                    <Button
                      color="primary"
                      sx={Resume}
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
                      color="primary"
                      sx={Resume}
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
              })}
              isCheckbox={true}
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
