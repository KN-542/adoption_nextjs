import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { RootState } from '@/hooks/store/store'
import { GoogleMeetURLCSR } from '@/api/repository'
import { RouterPath } from '@/enum/router'
import _ from 'lodash'
import { GoogleMeetURLRequest } from '@/api/model/request'
import NextHead from '@/components/common/Header'

const Google = () => {
  const router = useRouter()
  const { code } = router.query

  const user = useSelector((state: RootState) => state.user)

  const getGoogleMeetURL = async () => {
    if (_.isEmpty(code)) {
      router.push(RouterPath.Error)
      return
    }

    try {
      // API: GoogleMeetURL作成
      const res = await GoogleMeetURLCSR({
        user_hash_key: user.hashKey,
        code: code,
        is_href: false,
      } as GoogleMeetURLRequest)

      await navigator.clipboard.writeText(res.data.url)
    } catch {
      router.push(RouterPath.Error)
    }
  }

  useEffect(() => {
    if (router.isReady) {
      getGoogleMeetURL()
    }
  }, [router.isReady])

  return (
    <>
      <NextHead />
      Successfully copied!
    </>
  )
}

export default Google
