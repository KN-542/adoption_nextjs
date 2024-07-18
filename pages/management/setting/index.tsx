import NextHead from '@/components/common/Header'
import {
  M0Auto,
  minW,
  mt,
  w,
  DialogContentSetting,
  ml,
  SpaceBetween,
} from '@/styles/index'
import { Box, DialogContent } from '@mui/material'
import _ from 'lodash'
import { GetStaticProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC } from 'react'
import SettingMenu from '@/components/common/SettingMenu'

type Props = {}

const Setting: FC<Props> = () => {
  const router = useRouter()
  const t = useTranslations()

  return (
    <>
      <NextHead />
      <Box sx={mt(18)}>
        <Box sx={[SpaceBetween, w(90), M0Auto]}>
          <SettingMenu />
          <DialogContent sx={[DialogContentSetting, w(90), ml(3)]}>
            <Box sx={[w(90), M0Auto]}>
              {
                'settingのルートページには個人設定の基本的なこと書くつもりですよん'
              }
            </Box>
          </DialogContent>
        </Box>
      </Box>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Setting
