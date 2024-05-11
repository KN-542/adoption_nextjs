import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { decideTitle } from '@/enum/router'

const NextHead = () => {
  const router = useRouter()
  const t = useTranslations()

  return (
    <>
      <Head>
        <title>{t(decideTitle(router.pathname))}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
    </>
  )
}

export default NextHead
