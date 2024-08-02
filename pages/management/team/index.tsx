import { DeleteTeamCSR, RolesCSR, SearchTeamCSR } from '@/api/repository'
import NextHead from '@/components/common/Header'
import Pagination from '@/components/common/Pagination'
import { RouterPath } from '@/enum/router'
import store, { RootState } from '@/hooks/store/store'
import {
  ButtonColorInverse,
  DirectionColumnForTable,
  M0Auto,
  SpaceBetween,
  TableMenuButtons,
  mb,
  ml,
  mr,
  mt,
  w,
} from '@/styles/index'
import { TableHeader, TeamTableBody, SettingModel, Icons } from '@/types/index'
import { Box, Button } from '@mui/material'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CustomTable from '@/components/common/Table'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import {
  RolesRequest,
  DeleteTeamRequest,
  SearchTeamRequest,
} from '@/api/model/request'
import { Operation } from '@/enum/common'
import { changeSetting } from '@/hooks/store'
import { HttpStatusCode } from 'axios'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import { GetStaticProps } from 'next'
import EditNoteIcon from '@mui/icons-material/EditNote'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteModal from '@/components/common/modal/Delete'

type Props = {
  isError: boolean
  locale: string
}

const TEAM_PAGE_SIZE = 30

const Team: FC<Props> = ({ isError, locale: _locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [bodies, setBodies] = useState<TeamTableBody[]>([])
  const teams: TeamTableBody[] = []
  const [deleteList, setDeleteList] = useState<TeamTableBody[]>([])
  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [icons, setIcons] = useState<Icons[]>([])
  const [page, setPage] = useState<number>(1)

  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)
  const [noContent, isNoContent] = useState<boolean>(false)
  const [searchOpen, isSearchOpen] = useState<boolean>(false)
  const [deleteOpen, isDeleteOpen] = useState<boolean>(false)

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
            role: res.data.map[Operation.ManagementTeamEdit],
            onClick: (i: number) => {
              const body: TeamTableBody = teams[i]
              router.push(
                `${RouterPath.Management}${RouterPath.TeamEdit.replace(
                  '[id]',
                  '',
                )}${encodeURIComponent(body.hashKey)}`,
              )
            },
          },
          {
            color: setting.toastErrorColor,
            element: <DeleteIcon />,
            role: res.data.map[Operation.ManagementTeamDelete],
            onClick: (i: number) => {
              const body: TeamTableBody = teams[i]
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

  const search = async () => {
    isLoading(true)

    // API チーム一覧
    await SearchTeamCSR({
      user_hash_key: user.hashKey,
    } as SearchTeamRequest)
      .then((res) => {
        if (_.isEqual(res.data.code, HttpStatusCode.NoContent)) {
          isNoContent(true)
          return
        }

        _.forEach(res.data.list, (u, index) => {
          teams.push({
            no: Number(index) + 1,
            hashKey: u.hash_key,
            name: u.name,
            users: _.isEmpty(u.users)
              ? []
              : _.map(u.users, (item) => {
                  return item.name
                }),
          } as TeamTableBody)
        })
        setBodies(teams)
        isLoading(false)
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

  const tableHeader: TableHeader[] = [
    {
      id: 1,
      name: 'No',
    },
    {
      id: 2,
      name: t('features.team.header.name'),
    },
    {
      id: 3,
      name: t('features.team.header.users'),
    },
  ]

  const changePage = (i: number) => {
    setPage(i)
  }

  const deleteTeam = async () => {
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
      return
    }

    // API: チーム削除
    await DeleteTeamCSR({
      user_hash_key: user.hashKey,
      hash_key: deleteList[0].hashKey,
    } as DeleteTeamRequest)
      .then(async () => {
        store.dispatch(
          changeSetting({
            successMsg: [t(`features.team.index`) + t(`common.toast.delete`)],
          } as SettingModel),
        )

        router.push(RouterPath.Management + RouterPath.Back)
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg, code }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (code) {
          toast(t('common.api.code.teamDelete'), {
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

        await search()
      } finally {
        isLoading(false)
      }
    }

    initialize()
  }, [])

  return (
    <>
      <NextHead />
      {_.every([!isError, !loading, roles[Operation.ManagementTeamRead]]) && (
        <>
          <Box sx={mt(12)}>
            <Box sx={[SpaceBetween, w(90), M0Auto]}>
              <Pagination
                show={_.size(bodies) > TEAM_PAGE_SIZE}
                currentPage={page}
                listSize={_.size(bodies)}
                pageSize={TEAM_PAGE_SIZE}
                search={search}
                changePage={changePage}
              ></Pagination>
              <Box sx={[TableMenuButtons, mb(3)]}>
                <Button
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => isSearchOpen(true)}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('common.button.condSearch')}
                </Button>
                {roles[Operation.ManagementTeamCreate] && (
                  <Button
                    variant="contained"
                    sx={[
                      ml(1),
                      ButtonColorInverse(common.white, setting.color),
                    ]}
                    onClick={() =>
                      router.push(RouterPath.Management + RouterPath.TeamCreate)
                    }
                  >
                    <AddCircleOutlineIcon sx={mr(0.25)} />
                    {t('features.team.create')}
                  </Button>
                )}
              </Box>
            </Box>
            <CustomTable
              height={75}
              headers={tableHeader}
              isNoContent={noContent}
              icons={icons}
              bodies={_.map(bodies, (u) => {
                return {
                  no: u.no,
                  name: u.name,
                  users: (
                    <Box sx={DirectionColumnForTable}>
                      {_.map(u.users, (user, index) => {
                        return <Box key={index}>{user}</Box>
                      })}
                    </Box>
                  ),
                }
              }).slice(TEAM_PAGE_SIZE * (page - 1), TEAM_PAGE_SIZE * page)}
            />
          </Box>

          {deleteOpen && (
            <DeleteModal
              open={deleteOpen}
              headers={_.map(tableHeader, (table) => {
                return {
                  id: table.id,
                  name: table.name,
                } as TableHeader
              })}
              bodies={_.map(deleteList, (u) => {
                return {
                  no: u.no,
                  name: u.name,
                  users: (
                    <Box sx={DirectionColumnForTable}>
                      {_.map(u.users, (user, index) => {
                        return <Box key={index}>{user}</Box>
                      })}
                    </Box>
                  ),
                }
              })}
              close={() => isDeleteOpen(false)}
              delete={deleteTeam}
            ></DeleteModal>
          )}
        </>
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
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

export default Team
