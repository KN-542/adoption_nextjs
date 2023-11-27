import { useSelector } from 'react-redux'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar } from '@material-ui/core'
import { Button, Typography } from '@mui/material'
import { useTranslations } from 'next-intl'
import { RootState } from '@/hooks/store/store'
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
import { HashKeyRequest } from '@/api/model/management'

type Props = {
  onToggleDrawer: () => void
  logout: (req: HashKeyRequest, msg: string) => void
}

const ToolBar = (props: Props) => {
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.management.user)
  const setting = useSelector((state: RootState) => state.management.setting)

  const logout = async () => {
    await props.logout(
      {
        hash_key: user.hashKey,
      } as HashKeyRequest,
      '',
    )
  }

  return (
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
              onClick={(e) => {
                e.preventDefault()
                router.push(RouterPath.ManagementSetting)
              }}
            >
              <SettingsIcon sx={mr(0.25)} />
              {t('management.toolbar.setting')}
            </Button>
            <Button
              color="inherit"
              onClick={async (e) => {
                e.preventDefault()
                await logout()
              }}
            >
              <LogoutIcon sx={mr(0.25)} />
              {t('management.toolbar.logout')}
            </Button>
            <Image
              src="/logo.png"
              alt="CLINKS logo"
              width={100}
              height={24}
              style={{ marginLeft: '2rem' }}
              priority
            />
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
  )
}

export default ToolBar
