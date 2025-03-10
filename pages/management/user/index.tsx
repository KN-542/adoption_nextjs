import { FC, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import store, { RootState } from '@/hooks/store/store'
import CustomTable from '@/components/common/Table'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import {
  UsersTableBody,
  TableHeader,
  SelectedCheckbox,
  SettingModel,
  Icons,
  Body,
} from '@/types/index'
import { useTranslations } from 'next-intl'
import { Box, Button } from '@mui/material'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { DeleteUserCSR, RolesCSR, SearchUserCSR } from '@/api/repository'
import { useRouter } from 'next/router'
import { RouterPath } from '@/enum/router'
import NextHead from '@/components/common/Header'
import {
  ButtonColorInverse,
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
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { changeSetting, userSearchPageSize } from '@/hooks/store'
import { GetServerSideProps } from 'next'
import {
  DeleteUserRequest,
  RolesRequest,
  SearchUserRequest,
} from '@/api/model/request'
import { Operation } from '@/enum/common'
import EditNoteIcon from '@mui/icons-material/EditNote'
import DeleteIcon from '@mui/icons-material/Delete'
import { HttpStatusCode } from 'axios'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import { LITTLE_DURING } from '@/hooks/common'
import DeleteModal from '@/components/common/modal/Delete'

type Props = {
  isError: boolean
  locale: string
}

const User: FC<Props> = ({ isError, locale: _locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [bodies, setBodies] = useState<UsersTableBody[]>([])
  const users: UsersTableBody[] = []
  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [icons, setIcons] = useState<Icons[]>([])
  const [deleteList, setDeleteList] = useState<UsersTableBody[]>([])
  const [checkedList, setCheckedList] = useState<SelectedCheckbox[]>([])

  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(user.search.pageSize)

  const [loading, isLoading] = useState(true)
  const [init, isInit] = useState<boolean>(true)
  const [deleteOpen, isDeleteOpen] = useState<boolean>(false)
  const [searchOpen, isSearchOpen] = useState<boolean>(false)
  const [noContent, isNoContent] = useState<boolean>(false)
  const [pageDisp, isPageDisp] = useState<boolean>(false)

  const processing = useRef<boolean>(false)

  const inits = async () => {
    // API 使用可能ロール一覧
    await RolesCSR({
      hash_key: user.hashKey,
    } as RolesRequest)
      .then((res) => {
        setRoles(res.data.map as { [key: string]: boolean })

        if (!res.data.map[Operation.ManagementTeamRead]) {
          store.dispatch(
            changeSetting({
              errorMsg: [t(`common.api.header.403`)],
            } as SettingModel),
          )
          router.push(RouterPath.Management)
        }

        setIcons([
          {
            color: setting.toastSuccessColor,
            element: <EditNoteIcon />,
            role: res.data.map[Operation.ManagementUserEdit],
            onClick: (i: number) => {
              const body: UsersTableBody = users[i]
              router.push(
                `${RouterPath.Management}${RouterPath.UserEdit.replace(
                  '[id]',
                  '',
                )}${encodeURIComponent(body.hashKey)}`,
              )
            },
          },
          {
            color: setting.toastErrorColor,
            element: <DeleteIcon />,
            role: res.data.map[Operation.ManagementUserDelete],
            onClick: (i: number) => {
              const body: UsersTableBody = users[i]
              setDeleteList([body])
              isDeleteOpen(true)
            },
          },
        ])
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
        isInit(false)
      })
  }

  const search = async (currentPage: number, currentSize: number) => {
    isPageDisp(false)
    isLoading(true)

    // API: ユーザー検索
    await SearchUserCSR({
      hash_key: user.hashKey,
    } as SearchUserRequest)
      .then((res) => {
        if (_.isEqual(res.data.code, HttpStatusCode.NoContent)) {
          isNoContent(true)
          return
        }

        _.forEach(res.data.list, (u, index) => {
          users.push({
            no: Number(index) + 1,
            hashKey: u.hash_key,
            name: u.name,
            email: u.email,
            roleName: u.role_name,
          } as UsersTableBody)
        })
        setBodies(users)

        if (currentSize) {
          setPageSize(currentSize)
          store.dispatch(userSearchPageSize(currentSize))
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
        isLoading(false)
        isPageDisp(true)
      })
  }

  const tableHeader: TableHeader[] = [
    {
      name: 'No',
    },
    {
      name: t('features.user.header.name'),
    },
    {
      name: t('features.user.header.email'),
    },
    {
      name: t('features.user.header.role'),
    },
  ]

  const changePage = (i: number) => {
    if (processing.current) return
    processing.current = true

    setPage(i)

    setTimeout(() => {
      processing.current = false
    }, LITTLE_DURING)
  }

  const changePageSize = (i: number) => {
    if (processing.current) return
    processing.current = true

    setPageSize(i)

    setTimeout(() => {
      processing.current = false
    }, LITTLE_DURING)
  }

  const deleteUser = async () => {
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

    // API: ユーザー削除
    await DeleteUserCSR({
      user_hash_key: user.hashKey,
      hash_keys: _.map(deleteList, (u) => u.hashKey),
    } as DeleteUserRequest)
      .then(async () => {
        toast(t(`features.user.index`) + t(`common.toast.delete`), {
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
        isLoading(false) // Backへのページ遷移に変えるかも

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
            t(`common.api.code.userDelete.${code}`) +
              t('common.api.code.userDelete.index'),
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
  }, [])

  return (
    <>
      <NextHead />
      {_.every([!isError, !loading, roles[Operation.ManagementUserRead]]) && (
        <>
          <Box sx={mt(12)}>
            <Box sx={[SpaceBetween, w(90), M0Auto]}>
              {_.every([pageDisp, !_.isEmpty(bodies)]) && (
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
              <Box sx={[TableMenuButtons, , mb(3)]}>
                <Button
                  tabIndex={-1}
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => isSearchOpen(true)}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('common.button.condSearch')}
                </Button>
                {roles[Operation.ManagementTeamCreate] && (
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

                      router.push(RouterPath.Management + RouterPath.UserCreate)
                    }}
                  >
                    <AddCircleOutlineIcon sx={mr(0.25)} />
                    {t('features.user.create')}
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
              bodies={_.map(bodies, (u) => {
                return {
                  no: new Body(u.no),
                  name: new Body(u.name),
                  email: new Body(u.email),
                  role: new Body(u.roleName),
                }
              }).slice(pageSize * (page - 1), pageSize * page)}
            />
            {deleteOpen && (
              <DeleteModal
                open={deleteOpen}
                headers={_.map(tableHeader, (table) => {
                  return {
                    name: table.name,
                  } as TableHeader
                })}
                bodies={_.map(deleteList, (u) => {
                  return {
                    no: new Body(u.no),
                    name: new Body(u.name),
                    email: new Body(u.email),
                    role: new Body(u.roleName),
                  }
                })}
                close={() => isDeleteOpen(false)}
                delete={deleteUser}
              ></DeleteModal>
            )}
          </Box>
        </>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  let isError = false

  return {
    props: {
      api: {},
      isError,
      locale,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default User
