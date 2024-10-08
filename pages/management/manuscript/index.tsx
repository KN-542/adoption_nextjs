import { RolesRequest, SearchManuscriptRequest } from '@/api/model/request'
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
import { FC, useEffect, useState } from 'react'
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

  const [page, setPage] = useState<number>(1)
  const [size, setSize] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(manuscript.search.pageSize)

  const [init, isInit] = useState<boolean>(true)
  const [loading, isLoading] = useState<boolean>(true)
  const [noContent, isNoContent] = useState<boolean>(false)
  const [spinner, isSpinner] = useState<boolean>(false)
  const [pageDisp, isPageDisp] = useState<boolean>(false)

  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [isOpenDeleteModal, setOpenDeleteModal] = useState<boolean>(false)

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
          onClick: (_i: number) => {},
        },
        {
          color: setting.toastErrorColor,
          element: <DeleteIcon />,
          role: res.data.map[Operation.ManagementUserDelete],
          onClick: (_i: number) => {
            setSelectedIndex(_i)
            setOpenDeleteModal(true)
          }
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
    const list: SearchManuscriptResponse[] = []
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
          list.push({
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
        setBodies(list)
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
  const manuscriptDelete = async (manuscriptHashKey) => {
    // API呼び出し: 削除
    await DeleteManuscriptsCSR({
      user_hash_key: user.hashKey,
      manuscript_hash_key: [manuscriptHashKey],
    }).then(() => {
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
      // リストを再取得
      search(page, pageSize)
    }).catch(({isServerError, routerPath, toastMsg, storeMsg}) => {
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
    // 削除モーダルを閉じる
    setOpenDeleteModal(false)
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
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => {}}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('common.button.condSearch')}
                </Button>
                {roles[Operation.ManagementManuscriptCreate] && (
                  <Button
                    variant="contained"
                    sx={[
                      ml(1),
                      ButtonColorInverse(common.white, setting.color),
                    ]}
                    onClick={() =>
                      router.push(
                        RouterPath.Management + RouterPath.ManuscriptCreate,
                      )
                    }
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
          <DeleteModal
            open={isOpenDeleteModal}
            headers={[{ name: '原稿内容' }]}
            bodies={[{ '原稿内容': new Body(bodies[selectedIndex]?.content) }]}
            close={() => setOpenDeleteModal(false)}
            delete={() => manuscriptDelete(bodies[selectedIndex]?.hashKey)}
          />
        </>
      )}
    </>
  )
}

export default Manuscripts
