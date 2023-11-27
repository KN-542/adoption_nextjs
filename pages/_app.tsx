import { useRouter } from 'next/router'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import '@/styles/index.css'
import _, { isEqual } from 'lodash'
import { appWithTranslation } from 'next-i18next'
import { NextIntlClientProvider } from 'next-intl'
import store from '@/hooks/store/store'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { HashKeyRequest } from '@/api/model/management'
import { LogoutCSR } from '@/api/repository'
import { RouterPath } from '@/enum/router'
import { mgChangeSetting, mgSignOut } from '@/hooks/store'
import Admin from '@/components/Admin'
import AppMFA from '@/components/AppMFA'
import AppPasswordChange from '@/components/AppPasswordChange'
import { SettingModel } from '@/types/management'
import { APICommonCode } from '@/enum/apiError'

const App = ({ Component, pageProps }) => {
  const router = useRouter()

  // ログアウト
  const logout = async (req: HashKeyRequest, msg: string) => {
    await LogoutCSR(req)
      .then(() => {
        store.dispatch(mgSignOut())
        store.dispatch(
          mgChangeSetting({
            errorMsg: msg,
          } as SettingModel),
        )
        router.push(RouterPath.ManagementLogin)
      })
      .catch((error) => {
        isEqual(error.response.data.code, APICommonCode.BadRequest)
          ? router.push(RouterPath.ManagementLogin)
          : router.push(RouterPath.ManagementError)
        return
      })
  }

  // management/admin 配下の場合
  if (_.includes(router.pathname, 'management/admin')) {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistStore(store)}>
          <NextIntlClientProvider messages={pageProps.messages}>
            <Admin
              Component={Component}
              pageProps={pageProps}
              logout={logout}
            />
          </NextIntlClientProvider>
        </PersistGate>
      </Provider>
    )
  } else {
    if (isEqual(router.pathname, RouterPath.ManagementLoginMFA)) {
      return (
        <Provider store={store}>
          <PersistGate persistor={persistStore(store)}>
            <NextIntlClientProvider messages={pageProps.messages}>
              <AppMFA
                Component={Component}
                pageProps={pageProps}
                logout={logout}
              />
            </NextIntlClientProvider>
          </PersistGate>
        </Provider>
      )
    }
    if (isEqual(router.pathname, RouterPath.ManagementLoginPasswordChange)) {
      return (
        <Provider store={store}>
          <PersistGate persistor={persistStore(store)}>
            <NextIntlClientProvider messages={pageProps.messages}>
              <AppPasswordChange
                Component={Component}
                pageProps={pageProps}
                logout={logout}
              />
            </NextIntlClientProvider>
          </PersistGate>
        </Provider>
      )
    }
    return (
      <Provider store={store}>
        <PersistGate persistor={persistStore(store)}>
          <NextIntlClientProvider messages={pageProps.messages}>
            <Component {...pageProps} />
            <ToastContainer />
          </NextIntlClientProvider>
        </PersistGate>
      </Provider>
    )
  }
}

export default appWithTranslation(App)
