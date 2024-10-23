import {
  RolesRequest,
  SearchManuscriptRequest,
  DeleteManuscriptsRequest,
} from '@/api/model/request'
import {
  SearchManuscriptResponse,
  SiteListResponse,
} from '@/api/model/response'
import { RolesCSR, SearchManuscriptCSR } from '@/api/repository'
import { RouterPath } from '@/enum/router'
import { changeSetting, manuscriptSearchPageSize } from '@/hooks/store'
import store, { RootState } from '@/hooks/store/store'
import { Body, Icons, SettingModel, TableHeader } from '@/types/index'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { GetServerSideProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { HttpStatusCode } from 'axios'
import NextHead from '@/components/common/Header'
import { Operation } from '@/enum/common'
import { Box, Button } from '@mui/material'
import {
  ButtonColorInverse,
  DirectionColumnForTable,
  M0Auto,
  mb,
  ml,
  mr,
  mt,
  SpaceBetween,
  TableMenuButtons,
  w,
} from '@/styles/index'
import Pagination from '@/components/common/Pagination'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CustomTable from '@/components/common/Table'
import EditNoteIcon from '@mui/icons-material/EditNote'
import DeleteIcon from '@mui/icons-material/Delete'
import Spinner from '@/components/common/modal/Spinner'
import DeleteModal from '@/components/common/modal/Delete'
import { DeleteManuscriptsCSR } from '@/api/repository'
import { LITTLE_DURING } from '@/hooks/common'

type Props = {
  isError: boolean
  locale: string
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      locale,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

const Manuscripts: FC<Props> = ({ locale: _locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const manuscript = useSelector((state: RootState) => state.manuscript)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [icons, setIcons] = useState<Icons[]>([])
  const [bodies, setBodies] = useState<SearchManuscriptResponse[]>([])
  const manuscripts: SearchManuscriptResponse[] = []
  const [deleteList, setDeleteList] = useState<SearchManuscriptResponse[]>([])

  const [page, setPage] = useState<number>(1)
  const [size, setSize] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(manuscript.search.pageSize)

  const [init, isInit] = useState<boolean>(true)
  const [loading, isLoading] = useState<boolean>(true)
  const [noContent, isNoContent] = useState<boolean>(false)
  const [spinner, isSpinner] = useState<boolean>(false)
  const [pageDisp, isPageDisp] = useState<boolean>(false)

  const processing = useRef<boolean>(false)
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      setIcons([
        {
          color: setting.toastSuccessColor,
          element: <EditNoteIcon />,
          role: res.data.map[Operation.ManagementUserEdit],
          onClick: (i: number) => {},
        },
        {
          color: setting.toastErrorColor,
          element: <DeleteIcon />,
          role: res.data.map[Operation.ManagementUserDelete],
          onClick: (i: number) => {
            const body: SearchManuscriptResponse = manuscripts[i]
            setDeleteList([body])
            setIsOpenDeleteModal(true)
          },
        },
      ])
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
    isPageDisp(false)
    isLoading(true)
    if (init) isLoading(true)

    // API: 原稿検索
    await SearchManuscriptCSR({
      user_hash_key: user.hashKey,
      page: currentPage,
      page_size: currentSize,
    } as SearchManuscriptRequest)
      .then((res) => {
        if (_.isEqual(res.data.code, HttpStatusCode.NoContent)) {
          isNoContent(true)
          return
        }

        _.forEach(res.data.list, (m, index) => {
          manuscripts.push({
            no: currentSize * (currentPage - 1) + Number(index) + 1,
            hashKey: m.hash_key,
            content: m.content,
            sites: _.map(_.cloneDeep(m.sites), (site) => {
              return {
                hashKey: site.hash_key,
                name: site.site_name,
              } as SiteListResponse
            }),
          } as SearchManuscriptResponse)
        })
        setBodies(manuscripts)
        setSize(Number(res.data.num))

        if (currentSize) {
          setPageSize(currentSize)
          store.dispatch(manuscriptSearchPageSize(currentSize))
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

  const changePage = (i: number) => {
    setPage(i)
  }

  const changePageSize = (i: number) => {
    setPageSize(i)
  }

  // 削除処理
  const manuscriptDelete = async () => {
    if (processing.current) return
    processing.current = true

    if (_.isEmpty(deleteList)) {
      toast(t('common.api.header.400'), {
        style: {
          backgroundColor: setting.toastErrorColor,
          color: common.white,
          width: 630,
        },
        position: 'bottom-left',
        hideProgressBar: true,
        closeButton: () => <ClearIcon />,
      })

      setTimeout(() => {
        processing.current = false
      }, LITTLE_DURING)
      return
    }
    // API: 原稿削除
    await DeleteManuscriptsCSR({
      user_hash_key: user.hashKey,
      manuscript_hash_keys: deleteList.map((d) => d.hashKey),
    } as DeleteManuscriptsRequest)
      .then(async () => {
        toast(t(`features.manuscript.index`) + t(`common.toast.delete`), {
          style: {
            backgroundColor: setting.toastSuccessColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })

        isLoading(true)
        await search(1, pageSize)
        setDeleteList([])
        isLoading(false)

        setTimeout(() => {
          processing.current = false
        }, LITTLE_DURING)
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg, code }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (code) {
          toast(
            `${t(`common.api.code.manuscript.${String(code)}`)}${t(
              'common.api.code.manuscript.index',
            )}`,
            {
              style: {
                backgroundColor: setting.toastErrorColor,
                color: common.white,
                width: 500,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            },
          )

          setTimeout(() => {
            processing.current = false
          }, LITTLE_DURING)
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

          setTimeout(() => {
            processing.current = false
          }, LITTLE_DURING)
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

  const tableHeader: TableHeader[] = [
    {
      name: 'No',
    },
    {
      name: t('features.manuscript.header.content'),
    },
    {
      name: t('features.manuscript.header.site'),
    },
  ]

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
        if (init) await inits()

        await search(1, pageSize)
      } finally {
        isLoading(false)
      }
    }

    initialize()
  }, [])

  return (
    <>
      <NextHead />
      {_.every([!loading, roles[Operation.ManagementManuscriptRead]]) && (
        <>
          {spinner && <Spinner />}
          <Box sx={mt(12)}>
            <Box sx={[SpaceBetween, w(90), M0Auto]}>
              {_.every([pageDisp, !_.isEqual(size, 0)]) && (
                <Pagination
                  show={_.size(bodies) > pageSize}
                  currentPage={page}
                  listSize={_.size(bodies)}
                  pageSize={pageSize}
                  search={search}
                  changePage={changePage}
                  changePageSize={changePageSize}
                ></Pagination>
              )}
              <Box sx={[TableMenuButtons, mb(3)]}>
                <Button
                  tabIndex={-1}
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => {}}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('common.button.condSearch')}
                </Button>
                {roles[Operation.ManagementManuscriptCreate] && (
                  <Button
                    tabIndex={-1}
                    variant="contained"
                    sx={[
                      ml(1),
                      ButtonColorInverse(common.white, setting.color),
                    ]}
                    onClick={() => {
                      if (processing.current) return
                      processing.current = true

                      router.push(
                        RouterPath.Management + RouterPath.ManuscriptCreate,
                      )
                    }}
                  >
                    <AddCircleOutlineIcon sx={mr(0.25)} />
                    {t('features.manuscript.create')}
                  </Button>
                )}
              </Box>
            </Box>
            <CustomTable
              height={67}
              headers={tableHeader}
              isNoContent={noContent}
              icons={icons}
              pageSize={pageSize}
              bodies={_.map(bodies, (m) => {
                return {
                  no: new Body(m.no),
                  content: new Body(m.content),
                  site: new Body(
                    (
                      <Box sx={DirectionColumnForTable}>
                        {_.map(m.sites, (site, index) => {
                          return <Box key={index}>{site.name}</Box>
                        })}
                      </Box>
                    ),
                  ),
                }
              }).slice(pageSize * (page - 1), pageSize * page)}
            />
          </Box>
          {isOpenDeleteModal && (
            <DeleteModal
              open={isOpenDeleteModal}
              headers={_.map(tableHeader, (table) => {
                return {
                  name: table.name,
                } as TableHeader
              })}
              bodies={_.map(deleteList, (u) => {
                return {
                  no: new Body(u.no),
                  content: new Body(u.content),
                  sites: new Body(
                    (
                      <Box sx={DirectionColumnForTable}>
                        {_.map(u.sites, (site, index) => {
                          return <Box key={index}>{site.name}</Box>
                        })}
                      </Box>
                    ),
                  ),
                }
              })}
              close={() => setIsOpenDeleteModal(false)}
              delete={manuscriptDelete}
            ></DeleteModal>
          )}
        </>
      )}
    </>
  )
}

export default Manuscripts
