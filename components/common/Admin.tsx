import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import ToolBar from '@/components/common/ToolBar'
import Sidebar from '@/components/common/Sidebar'
import store, { RootState } from '@/hooks/store/store'
import { DecodeJWTCSR, LogoutCSR } from '@/api/repository'
import { RouterPath } from '@/enum/router'
import { ToastContainer, toast } from 'react-toastify'
import { changeSetting, signOut } from '@/hooks/store'
import _ from 'lodash'
import { SettingModel, UserModel } from '@/types/index'
import { useTranslations } from 'next-intl'
import { DecodeJWTRequest, LogoutRequest } from '@/api/model/request'
import { common } from '@mui/material/colors'
import ClearIcon from '@mui/icons-material/Clear'

const Admin = ({ Component, pageProps }) => {
  const router = useRouter()
  const t = useTranslations()

  const user: UserModel = useSelector((state: RootState) => state.user)
  const setting: SettingModel = useSelector((state: RootState) => state.setting)

  const [disp, isDisp] = useState<boolean>(false)
  const [drawerOpen, isDrawerOpen] = useState<boolean>(false)

  const logout = async (req: LogoutRequest, msg: string) => {
    await LogoutCSR(req)
      .then(() => {
        store.dispatch(signOut())
        store.dispatch(
          changeSetting({
            errorMsg: _.isEmpty(msg) ? [] : [msg],
          } as SettingModel),
        )
        router.push(RouterPath.Login)
      })
      .catch(() => {
        router.push(RouterPath.Error)
      })
  }

  useEffect(() => {
    // JWT検証
    DecodeJWTCSR({
      hash_key: user.hashKey,
    } as DecodeJWTRequest)
      .then(() => {
        isDisp(true)
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
  }, [])

  return (
    <>
      {disp && (
        <>
          <ToolBar
            onToggleDrawer={() => {
              isDrawerOpen((b) => !b)
            }}
            logout={async () => {
              await logout({ hash_key: user.hashKey } as LogoutRequest, '')
            }}
          />
          <Sidebar
            drawerOpen={drawerOpen}
            onToggleDrawer={() => {
              isDrawerOpen((b) => !b)
            }}
            logout={async () => {
              await logout({ hash_key: user.hashKey } as LogoutRequest, '')
            }}
          />
          <Component {...pageProps} />
          <ToastContainer />
        </>
      )}
    </>
  )
}

export default Admin
