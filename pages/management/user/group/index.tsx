import { SearchUserGroupCSR } from '@/api/repository'
import NextHead from '@/components/common/Header'
import Pagination from '@/components/common/Pagination'
import SelectedTopMenu from '@/components/common/SelectedTopMenu'
import { RouterPath } from '@/enum/router'
import { RootState } from '@/hooks/store/store'
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
import {
  SelectedCheckbox,
  TableHeader,
  TopMenu,
  UserGroupTableBody,
} from '@/types/management'
import { Box, Button } from '@mui/material'
import { common } from '@mui/material/colors'
import _, { every, isEqual, map, min, size } from 'lodash'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CustomTable from '@/components/common/Table'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'

const USER_PAGE_SIZE = 20

const UserGroup = ({ isError }) => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [bodies, setBodies] = useState<UserGroupTableBody[]>([])
  const [checkedList, setCheckedList] = useState<SelectedCheckbox[]>([])
  const [page, setPage] = useState(1)
  const [loading, IsLoading] = useState(true)

  const search = async (currentPage?: number) => {
    IsLoading(true)

    // API ユーザーグループ一覧
    const list: UserGroupTableBody[] = []
    const list2: SelectedCheckbox[] = []
    await SearchUserGroupCSR()
      .then((res) => {
        _.forEach(res.data.user_groups, (u, index) => {
          list.push({
            no: Number(index) + 1,
            hashKey: u.hash_key,
            name: u.name,
            users: u.users.split(','),
          } as UserGroupTableBody)
        })
        setBodies(list)

        if (currentPage) {
          _.forEach(
            res.data.user_groups.slice(
              USER_PAGE_SIZE * (currentPage - 1),
              min([USER_PAGE_SIZE * currentPage, size(list)]),
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

  useEffect(() => {
    if (isError) router.push(RouterPath.Error)
    search(1)
  }, [])

  const tableHeader: TableHeader[] = [
    {
      id: 1,
      name: 'No',
    },
    {
      id: 2,
      name: t('features.user.header.groupName'),
    },
    {
      id: 3,
      name: t('features.user.header.users'),
    },
  ]

  const topMenu: TopMenu[] = [
    {
      name: t('common.title.user.list'),
      router: RouterPath.User,
    },
    {
      name: t('common.title.user.calendar'),
      router: RouterPath.UserCalendar,
    },
  ]

  const changePage = (i: number) => {
    setPage(i)
  }

  return (
    <>
      <NextHead></NextHead>
      {every([!isError, !loading]) && (
        <>
          <Box sx={mt(12)}>
            <Box sx={[w(90), M0Auto]}>
              <SelectedTopMenu items={topMenu}></SelectedTopMenu>
            </Box>
            <Box sx={[SpaceBetween, w(90), M0Auto]}>
              {size(bodies) > USER_PAGE_SIZE && (
                <Pagination
                  currentPage={page}
                  listSize={size(bodies)}
                  pageSize={USER_PAGE_SIZE}
                  search={search}
                  changePage={changePage}
                ></Pagination>
              )}
              <Box sx={[TableMenuButtons, , mb(3)]}>
                <Button
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                >
                  <AddCircleOutlineIcon sx={mr(0.25)} />
                  {t('features.user.createGroup')}
                </Button>
              </Box>
            </Box>
            <CustomTable
              height={67}
              headers={tableHeader}
              bodies={map(bodies, (u) => {
                return {
                  no: u.no,
                  name: u.name,
                  users: (
                    <Box sx={DirectionColumnForTable}>
                      {map(u.users, (user, index) => {
                        return <Box key={index}>{user}</Box>
                      })}
                    </Box>
                  ),
                }
              }).slice(USER_PAGE_SIZE * (page - 1), USER_PAGE_SIZE * page)}
            />
          </Box>
        </>
      )}
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  let isError = false

  return {
    props: {
      api: {},
      isError,
      locale,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default UserGroup
