import { useSelector } from 'react-redux'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar } from '@material-ui/core'
import { Button, Menu, MenuItem, Typography } from '@mui/material'
import { useTranslations } from 'next-intl'
import store, { RootState } from '@/hooks/store/store'
import router from 'next/router'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { RouterPath, decideTitle } from '@/enum/router'
import {
  FlexGrow,
  mr,
  SpaceBetween,
  SpaceBetweenContent,
  ToolBarMlMedia,
} from '@/styles/index'
import {
  ChangeTeamRequest,
  LogoutRequest,
  SearchTeamByCompanyRequest,
} from '@/api/model/request'
import { SettingModel, UserModel } from '@/types/index'
import { ChangeTeamCSR, SearchTeamByCompanyCSR } from '@/api/repository'
import _ from 'lodash'
import { SearchTeamByCompanyResponse } from '@/api/model/response'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { common } from '@mui/material/colors'
import { changeSetting } from '@/hooks/store'
import ClearIcon from '@mui/icons-material/Clear'
import Diversity2Icon from '@mui/icons-material/Diversity2'

type Props = {
  onToggleDrawer: () => void
  logout: (req: LogoutRequest, msg: string) => void
}

const ToolBar = (props: Props) => {
  const t = useTranslations()

  const setting: SettingModel = useSelector((state: RootState) => state.setting)
  const user: UserModel = useSelector((state: RootState) => state.user)

  const [teams, setTeams] = useState<SearchTeamByCompanyResponse[]>([])

  const [loading, isLoading] = useState(true)

  const [anchorEl, setAnchorEl] = useState(null)

  const init = async () => {
    // API: チーム検索_同一企業
    await SearchTeamByCompanyCSR({
      hash_key: user.hashKey,
    } as SearchTeamByCompanyRequest)
      .then((res) => {
        const list: SearchTeamByCompanyResponse[] = []
        _.forEach(res.data.list, (u) => {
          list.push({
            hashKey: u.hash_key,
            name: u.name,
            sub: '',
          } as SearchTeamByCompanyResponse)
        })
        setTeams(list)
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
          router.push(_.isEmpty(routerPath) ? RouterPath.Login : routerPath)
        }
      })
  }

  const logout = async () => {
    await props.logout(
      {
        lang: setting.lang,
        hash_key: user.hashKey,
      } as LogoutRequest,
      '',
    )
  }

  const changeTeam = async (hashKey: string) => {
    // API: チーム変更
    await ChangeTeamCSR({
      user_hash_key: user.hashKey,
      hash_key: hashKey,
    } as ChangeTeamRequest)
      .then(() => {
        router.push(RouterPath.Management + RouterPath.Back)
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
          router.push(_.isEmpty(routerPath) ? RouterPath.Login : routerPath)
        }
      })
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <>
      {!loading && (
        <AppBar
          position="static"
          style={{
            position: 'fixed',
            top: 0,
            backgroundColor: setting.color,
          }}
        >
          <Box sx={FlexGrow}>
            <Toolbar sx={SpaceBetween}>
              <IconButton
                aria-label="menu-button"
                size="large"
                edge="start"
                color="inherit"
                sx={mr(2)}
                onClick={props.onToggleDrawer}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={ToolBarMlMedia}>
                {t(decideTitle(router.pathname))}
              </Typography>
              <Box sx={SpaceBetweenContent}>
                <Button
                  sx={mr(1)}
                  color="inherit"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <Diversity2Icon sx={mr(0.25)} />
                  {t('toolbar.teams')}
                </Button>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  {_.map(teams, (t, index) => {
                    return (
                      <MenuItem
                        key={index}
                        onClick={async () => await changeTeam(t.hashKey)}
                      >
                        {t.name}
                      </MenuItem>
                    )
                  })}
                </Menu>
                <Button
                  sx={mr(1)}
                  color="inherit"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(user.path + RouterPath.Setting)
                  }}
                >
                  <SettingsIcon sx={mr(0.25)} />
                  {t('toolbar.setting')}
                </Button>
                <Button
                  color="inherit"
                  onClick={async (e) => {
                    e.preventDefault()
                    await logout()
                  }}
                >
                  <LogoutIcon sx={mr(0.25)} />
                  {t('toolbar.logout')}
                </Button>
                {/* TODO ロゴは後に対応 */}
                {/* <Image
              src="/logo.png"
              alt="CLINKS logo"
              width={100}
              height={24}
              style={{ marginLeft: '2rem' }}
              priority
            /> */}
              </Box>
            </Toolbar>
          </Box>
        </AppBar>
      )}
    </>
  )
}

export default ToolBar
