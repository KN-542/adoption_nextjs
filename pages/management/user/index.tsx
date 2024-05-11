import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/hooks/store/store'
import CustomTable from '@/components/common/Table'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import {
  UsersTableBody,
  TableHeader,
  SelectedCheckbox,
  TopMenu,
} from '@/types/management'
import { useTranslations } from 'next-intl'
import { Box, Button } from '@mui/material'
import { common } from '@mui/material/colors'
import { every, isEqual, map, min, size } from 'lodash'
import { UserListCSR } from '@/api/repository'
import _ from 'lodash'
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
import SelectedTopMenu from '@/components/common/SelectedTopMenu'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'

const USER_PAGE_SIZE = 20

const User = ({ isError, locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [bodies, setBodies] = useState<UsersTableBody[]>([])
  const [checkedList, setCheckedList] = useState<SelectedCheckbox[]>([])
  const [page, setPage] = useState(1)
  const [loading, IsLoading] = useState(true)

  const search = async (currentPage?: number) => {
    IsLoading(true)

    // API ユーザー一覧
    const list: UsersTableBody[] = []
    const list2: SelectedCheckbox[] = []
    await UserListCSR()
      .then((res) => {
        _.forEach(res.data.users, (u, index) => {
          list.push({
            no: Number(index) + 1,
            hashKey: u.hash_key,
            name: u.name,
            mail: u.email,
            role: Number(u.role_id),
            roleName: u[`role_name_${locale}`],
          } as UsersTableBody)
        })
        setBodies(list)

        if (currentPage) {
          _.forEach(
            res.data.users.slice(
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
      name: t('features.user.header.name'),
    },
    {
      id: 3,
      name: t('features.user.header.mail'),
    },
    {
      id: 4,
      name: t('features.user.header.role'),
    },
  ]

  const changePage = (i: number) => {
    setPage(i)
  }

  const topMenu: TopMenu[] = [
    {
      name: t('common.title.user.group.list'),
      router: RouterPath.UserGroup,
    },
    {
      name: t('common.title.user.calendar'),
      router: RouterPath.UserCalendar,
    },
  ]

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
                  onClick={() => router.push(RouterPath.UserCreate)}
                >
                  <AddCircleOutlineIcon sx={mr(0.25)} />
                  {t('features.user.create')}
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
                  mail: u.mail,
                  role: u.roleName,
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
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default User
