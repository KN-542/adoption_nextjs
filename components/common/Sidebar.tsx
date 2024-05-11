import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import {
  List,
  Drawer,
  ListItem,
  ListItemButton,
  Divider,
  Box,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CoPresentIcon from '@mui/icons-material/CoPresent'
import MailIcon from '@mui/icons-material/Mail'
import EqualizerIcon from '@mui/icons-material/Equalizer'
import HistoryIcon from '@mui/icons-material/History'
import IconButton from '@mui/material/IconButton'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ApartmentIcon from '@mui/icons-material/Apartment'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { SidebarModel } from 'types/management'
import { useTranslations } from 'next-intl'
import store, { RootState } from '@/hooks/store/store'
import _, { cloneDeep, every, indexOf, isEqual, map } from 'lodash'
import { RouterPath } from '@/enum/router'
import { Color, mb, mt, SidebarBody, SidebarName, wBlock } from '@/styles/index'
import { HashKeyRequest, SidebarRequest } from '@/api/model/request'
import { Role } from '@/enum/user'
import { useEffect, useState } from 'react'
import { SidebarCSR } from '@/api/repository'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import { common } from '@mui/material/colors'
import ClearIcon from '@mui/icons-material/Clear'

type Props = {
  drawerOpen: boolean
  onToggleDrawer: () => void
  logout: (req: HashKeyRequest, msg: string) => void
}

const Sidebar = (props: Props) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [loading, IsLoading] = useState(true)
  const [sidebars, setSidebars] = useState<SidebarModel[]>([])

  // サイドバーアイコン決定
  const decideSidebarIcon = (path: string): JSX.Element => {
    switch (path) {
      // 企業
      case RouterPath.Admin + RouterPath.Company:
        return <ApartmentIcon sx={Color(setting.color)} />
      // ロール
      case RouterPath.Admin + RouterPath.Role:
        return <AssignmentIndIcon sx={Color(setting.color)} />
      case RouterPath.Management + RouterPath.Role:
        return <AssignmentIndIcon sx={Color(setting.color)} />
      // ユーザー
      case RouterPath.Admin + RouterPath.User:
        return <CoPresentIcon sx={Color(setting.color)} />
      case RouterPath.Management + RouterPath.User:
        return <CoPresentIcon sx={Color(setting.color)} />
      // 操作ログ
      case RouterPath.Admin + RouterPath.History:
        return <HistoryIcon sx={Color(setting.color)} />
      case RouterPath.Management + RouterPath.History:
        return <HistoryIcon sx={Color(setting.color)} />
      // 応募者
      case RouterPath.Management + RouterPath.Applicant:
        return <PersonIcon sx={Color(setting.color)} />
      // メールテンプレート
      case RouterPath.Management + RouterPath.Mail:
        return <MailIcon sx={Color(setting.color)} />
      // データ集計
      case RouterPath.Management + RouterPath.Analysis:
        return <EqualizerIcon sx={Color(setting.color)} />
      // 個人設定
      case RouterPath.Admin + RouterPath.Setting:
        return <SettingsIcon sx={Color(setting.color)} />
      case RouterPath.Management + RouterPath.Setting:
        return <SettingsIcon sx={Color(setting.color)} />
      // ログアウト
      case '':
        return <LogoutIcon sx={Color(setting.color)} />
      default:
        return <></>
    }
  }

  const getSidebars = async () => {
    await SidebarCSR({
      hash_key: user.hashKey,
    } as SidebarRequest)
      .then((res) => {
        const list: SidebarModel[] = []
        for (const item of cloneDeep(res.data.sidebars)) {
          if (
            isEqual(
              indexOf(
                map(list, (o) => {
                  return o.name
                }),
                item[`name_${setting.lang}`],
              ),
              -1,
            )
          )
            list.push({
              name: item[`name_${setting.lang}`],
              href: item.path,
            } as SidebarModel)
        }

        setSidebars(list)
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

  const subData: SidebarModel[] = [
    {
      name: t('sidebar.setting'),
      href: user.path + RouterPath.Setting,
    },
    {
      name: t('sidebar.logout'),
      href: '',
      button: async () => {
        await props.logout(
          {
            hash_key: user.hashKey,
          } as HashKeyRequest,
          '',
        )
      },
    },
  ]

  const renderRow = (row: SidebarModel): JSX.Element => {
    return (
      <ListItem disablePadding key={row.name} sx={[mt(2), mb(2)]}>
        <ListItemButton
          onClick={
            row.button
              ? row.button
              : (e) => {
                  e.preventDefault()
                  router.push(row.href)
                }
          }
        >
          {decideSidebarIcon(row.href)}
          <Box sx={SidebarName}>{row.name}</Box>
        </ListItemButton>
      </ListItem>
    )
  }

  useEffect(() => {
    getSidebars()
  }, [])

  return (
    <>
      {!loading && (
        <Drawer
          variant="temporary"
          open={props.drawerOpen}
          onClose={props.onToggleDrawer}
        >
          <Box
            sx={wBlock(300)}
            role="presentation"
            onClick={props.onToggleDrawer}
          >
            <Box
              sx={[
                SidebarBody,
                {
                  backgroundColor: setting.color,
                },
              ]}
            >
              <IconButton
                aria-label="menu-button"
                size="large"
                color="inherit"
                onClick={props.onToggleDrawer}
              >
                <AccountCircleIcon fontSize="large" />
              </IconButton>
              <p color="inherit">{user.name}</p>
            </Box>

            <List>
              {sidebars.map((row, index) => {
                return <Box key={index}>{renderRow(row)}</Box>
              })}
            </List>

            <Divider />

            <List>
              {subData.map((row, index) => {
                return <Box key={index}>{renderRow(row)}</Box>
              })}
            </List>
          </Box>
        </Drawer>
      )}
    </>
  )
}

export default Sidebar
