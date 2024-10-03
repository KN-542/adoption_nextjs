import store, { RootState } from '@/hooks/store/store'
import { GetServerSideProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import {
  amber,
  blue,
  brown,
  common,
  cyan,
  deepOrange,
  green,
  grey,
  lime,
  pink,
  teal,
  indigo,
  red,
  deepPurple,
} from '@mui/material/colors'
import { Color } from '@/types/index'
import NextHead from '@/components/common/Header'
import { Box, Button, DialogContent, Typography } from '@mui/material'
import {
  ButtonColor,
  ColorBox,
  ColorBoxChild,
  ColorBoxChildNowrap,
  ColorButton,
  DialogContentSetting,
  M0Auto,
  ml,
  mt,
  SpaceBetween,
  w,
} from '@/styles/index'
import SettingMenu from '@/components/common/SettingMenu'
import _ from 'lodash'
import { changeSetting } from '@/hooks/store'

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

const PersonalColor = () => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const colorSet: Color[] = [
    {
      color: indigo[300],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: indigo[500],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: indigo[800],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: blue[300],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: blue[500],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: blue[800],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: deepPurple[300],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: deepPurple[500],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: deepPurple[800],
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: common.black,
      toastSuccessColor: green[500],
      toastErrorColor: red[500],
    },
    {
      color: red[300],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: red[500],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: red[800],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: deepOrange[300],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: deepOrange[500],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: deepOrange[800],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: deepOrange[900],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: pink[300],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: pink[500],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: pink[800],
      toastSuccessColor: green[500],
      toastErrorColor: common.black,
    },
    {
      color: green[300],
      toastSuccessColor: blue[500],
      toastErrorColor: red[500],
    },
    {
      color: green[500],
      toastSuccessColor: blue[500],
      toastErrorColor: red[500],
    },
    {
      color: green[800],
      toastSuccessColor: blue[500],
      toastErrorColor: red[500],
    },
    {
      color: cyan[300],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: cyan[500],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: cyan[800],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: teal[300],
      toastSuccessColor: blue[500],
      toastErrorColor: red[500],
    },
    {
      color: teal[500],
      toastSuccessColor: blue[500],
      toastErrorColor: red[500],
    },
    {
      color: teal[800],
      toastSuccessColor: blue[500],
      toastErrorColor: red[500],
    },
    {
      color: teal[900],
      toastSuccessColor: blue[500],
      toastErrorColor: red[500],
    },
    {
      color: lime[300],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: lime[500],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: lime[800],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: amber[300],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: amber[500],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: amber[800],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: brown[300],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: brown[500],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: brown[800],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: brown[900],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: grey[300],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: grey[500],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: grey[800],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
    {
      color: grey[900],
      toastSuccessColor: green[800],
      toastErrorColor: red[500],
    },
  ]

  return (
    <>
      <NextHead />

      <Box sx={mt(18)}>
        <Box sx={[SpaceBetween, w(90), M0Auto]}>
          <SettingMenu />
          <DialogContent sx={[DialogContentSetting, w(90), ml(3)]}>
            <Box sx={ColorBox}>
              <Box sx={ColorBoxChild}>
                {_.map(colorSet, (obj, index) => (
                  <Box key={index} sx={ColorBoxChildNowrap}>
                    <Button
                      variant="contained"
                      sx={[ColorButton, ButtonColor(common.white, obj.color)]}
                      onClick={(e) => {
                        e.preventDefault()
                        store.dispatch(changeSetting(obj))
                      }}
                    >
                      <Typography variant="body2">{obj.color}</Typography>
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          </DialogContent>
        </Box>
      </Box>
    </>
  )
}

export default PersonalColor
