import Content from '@/components/common/Content'
import { changeSetting } from '@/hooks/store'
import store, { RootState } from '@/hooks/store/store'
import { Color, Contents } from '@/types/index'
import { deepPurple, indigo, red } from '@material-ui/core/colors'
import { Box, Button, Typography } from '@mui/material'
import { useTranslations } from 'next-intl'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { RouterPath } from '@/enum/router'
import _ from 'lodash'
import NextHead from '@/components/common/Header'
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
} from '@mui/material/colors'
import {
  ButtonColor,
  ColorBox,
  ColorBoxChild,
  ColorBoxChildNowrap,
  ColorButton,
} from '@/styles/index'
import { GetStaticProps } from 'next'

const Personal = () => {
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

  const data: Contents[] = [
    {
      key: t('features.setting.name'),
      element: <>{'面接官1'}</>,
    },
    {
      key: t('features.setting.email'),
      element: <>{'a@au.com'}</>,
    },
    {
      key: t('features.setting.role'),
      element: <>{'面接官'}</>,
    },
    {
      key: t('features.setting.color'),
      element: (
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

                    router.push(RouterPath.Setting)
                  }}
                >
                  <Typography variant="body2">{obj.color}</Typography>
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      ),
    },
  ]

  return (
    <>
      <NextHead />
      <Content data={data}></Content>
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

export default Personal
