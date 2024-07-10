import NextHead from '@/components/common/Header'
import {
  MenuDisp,
  M0Auto,
  minW,
  mt,
  w,
  DialogContentSetting,
  ml,
  Color,
  mr,
  FontSize,
  mb,
  SpaceBetween,
} from '@/styles/index'
import { ButtonContents } from '@/types/index'
import { Box, Button, DialogContent, Typography } from '@mui/material'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { GetStaticProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC } from 'react'
import ApartmentIcon from '@mui/icons-material/Apartment'
import Diversity2Icon from '@mui/icons-material/Diversity2'
import SettingsIcon from '@mui/icons-material/Settings'

type Props = {}

const Setting: FC<Props> = () => {
  const router = useRouter()
  const t = useTranslations()

  const menus: ButtonContents[] = [
    {
      name: (
        <>
          <ApartmentIcon sx={[Color(common.black), mr(1)]} />
          {'企業設定'}
        </>
      ),
    },
    {
      name: (
        <>
          <Diversity2Icon sx={[Color(common.black), mr(1)]} />
          {'チーム設定'}
        </>
      ),
    },
    {
      name: (
        <>
          <SettingsIcon sx={[Color(common.black), mr(1)]} />
          {'個人設定'}
        </>
      ),
    },
  ]

  return (
    <>
      <NextHead></NextHead>
      <Box sx={mt(18)}>
        <Box sx={[SpaceBetween, w(90), M0Auto]}>
          <DialogContent sx={[DialogContentSetting, w(20), ml(15), minW(300)]}>
            <Box sx={[w(90), M0Auto]}>
              {_.map(menus, (m, i) => {
                return (
                  <Box key={i} sx={[i < _.size(menus) - 1 ? mb(3) : null]}>
                    <Typography
                      variant="h6"
                      sx={[MenuDisp(common.black), FontSize(20)]}
                    >
                      {m.name}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </DialogContent>
          <DialogContent sx={[DialogContentSetting, w(80), ml(15), minW(300)]}>
            <Box sx={[w(90), M0Auto]}></Box>
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
