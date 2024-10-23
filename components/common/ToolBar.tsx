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
  TextTransformNone,
  ToolBarMlMedia,
} from '@/styles/index'
import {
  ChangeTeamRequest,
  GetOwnTeamRequest,
  LogoutRequest,
  SearchTeamByCompanyRequest,
} from '@/api/model/request'
import { SettingModel, UserModel } from '@/types/index'
import {
  ChangeTeamCSR,
  GetOwnTeamCSR,
  SearchTeamByCompanyCSR,
} from '@/api/repository'
import _ from 'lodash'
import {
  GetTeamResponse,
  SearchTeamByCompanyResponse,
} from '@/api/model/response'
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

  const [team, setTeam] = useState<GetTeamResponse>(null)
  const [teams, setTeams] = useState<SearchTeamByCompanyResponse[]>([])

  const [loading, isLoading] = useState(true)

  const [anchorEl, setAnchorEl] = useState(null)

  const inits = async () => {
    try {
      // API: チーム検索_同一企業
      const res = await SearchTeamByCompanyCSR({
        hash_key: user.hashKey,
      } as SearchTeamByCompanyRequest)

      const list: SearchTeamByCompanyResponse[] = []
      _.forEach(res.data.list, (u) => {
        list.push({
          hashKey: u.hash_key,
          name: u.name,
          sub: '',
        } as SearchTeamByCompanyResponse)
      })
      setTeams(list)

      // API: チーム取得
      const res2 = await GetOwnTeamCSR({
        user_hash_key: user.hashKey,
      } as GetOwnTeamRequest)

      setTeam({
        hashKey: res2.data.team.hash_key,
        name: res2.data.team.name,
      } as GetTeamResponse)
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
        router.push(_.isEmpty(routerPath) ? RouterPath.Login : routerPath)
      }
    } finally {
      isLoading(false)
    }
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
    if (_.isEqual(user.path, RouterPath.Management)) {
      inits()
    } else {
      isLoading(false)
    }
  }, [router.pathname])

  return (
    <>
      {_.every([!loading]) && (
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
                {_.isEqual(user.path, RouterPath.Management) && (
                  <>
                    <Button
                      tabIndex={-1}
                      sx={[mr(1), TextTransformNone]}
                      color="inherit"
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                      <Diversity2Icon sx={mr(0.25)} />
                      {team.name}
                    </Button>
                    <Menu
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
                  </>
                )}
                <Button
                  tabIndex={-1}
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
                  tabIndex={-1}
                  color="inherit"
                  onClick={async (e) => {
                    e.preventDefault()
                    await logout()
                  }}
                >
                  <LogoutIcon sx={mr(0.25)} />
                  {t('toolbar.logout')}
                </Button>
              </Box>
            </Toolbar>
          </Box>
        </AppBar>
      )}
    </>
  )
}

export default ToolBar
