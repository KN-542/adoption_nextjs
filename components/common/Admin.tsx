// components/Admin.js
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import ToolBar from '@/components/common/ToolBar'
import Sidebar from '@/components/common/Sidebar'
import store, { RootState } from '@/hooks/store/store'
import { JWTDecodeCSR, LogoutCSR } from '@/api/repository'
import { RouterPath } from '@/enum/router'
import { APICommonCode, APISessionCheckCode } from '@/enum/apiError'
import _, { every, isEqual } from 'lodash'
import { ToastContainer } from 'react-toastify'
import { mgChangeSetting, signOut, userModel } from '@/hooks/store'
import { SettingModel, UserModel } from '@/types/management'
import { useTranslations } from 'next-intl'
import { JWTDecodeRequest, LogoutRequest } from '@/api/model/request'

const Admin = ({ Component, pageProps }) => {
  const router = useRouter()
  const t = useTranslations()

  const user: UserModel = useSelector((state: RootState) => state.user)

  const [disp, isDisp] = useState<boolean>(false)
  const [drawerOpen, isDrawerOpen] = useState<boolean>(false)

  const logout = async (req: LogoutRequest, msg: string) => {
    await LogoutCSR(req)
      .then(() => {
        store.dispatch(signOut())
        store.dispatch(
          mgChangeSetting({
            errorMsg: msg,
          } as SettingModel),
        )
        router.push(RouterPath.Login)
      })
      .catch((error) => {
        _.isEqual(error.response.data.code, APICommonCode.BadRequest)
          ? router.push(RouterPath.Login)
          : router.push(RouterPath.Error)
        return
      })
  }

  useEffect(() => {
    // JWT検証
    JWTDecodeCSR({
      hash_key: user.hashKey,
    } as JWTDecodeRequest)
      .then(() => {
        isDisp(true)
      })
      .catch(async (error) => {
        if (
          every([500 <= error.response.status, error.response.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        let msg = ''
        if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
          msg = t(`common.api.code.${error.response.data.code}`)
        } else if (
          isEqual(error.response.data.code, APISessionCheckCode.LoginRequired)
        ) {
          msg = t(`common.api.code.expired${error.response.data.code}`)
        }

        store.dispatch(
          mgChangeSetting({
            errorMsg: msg,
          } as SettingModel),
        )

        await logout({ hash_key: user.hashKey } as LogoutRequest, msg)
        return
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
