import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { RootState } from '@/hooks/store/store'
import { GoogleMeetURL } from '@/api/repository'
import { RouterPath } from '@/enum/router'
import _ from 'lodash'
import { GoogleMeetURLRequest } from '@/api/model/management'
import {} from '@/hooks/store'

const GoogleMeet = () => {
  const router = useRouter()
  const { code } = router.query

  const user = useSelector((state: RootState) => state.management.user)

  const getGoogleMeetURL = async () => {
    if (_.isEmpty(code)) {
      router.push(RouterPath.ManagementError)
      return
    }

    await GoogleMeetURL({
      user_hash_key: user.hashKey,
      code: code,
    } as GoogleMeetURLRequest)
      .then((res) => {
        window.location.href = res.data.google_meet_url
      })
      .catch(() => {
        router.push(RouterPath.ManagementError)
        return
      })
  }

  useEffect(() => {
    if (router.isReady) {
      getGoogleMeetURL()
    }
  }, [router.isReady])

  return <></>
}

export default GoogleMeet
