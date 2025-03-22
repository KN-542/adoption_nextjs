import store from '@/hooks/store/store'
import { GetServerSideProps } from 'next'
import { common } from '@mui/material/colors'
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
import { COLOR_SET } from '@/hooks/common'

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
  return (
    <>
      <NextHead />

      <Box sx={mt(18)}>
        <Box sx={[SpaceBetween, w(90), M0Auto]}>
          <SettingMenu />
          <DialogContent sx={[DialogContentSetting, w(90), ml(3)]}>
            <Box sx={ColorBox}>
              <Box sx={ColorBoxChild}>
                {_.map(COLOR_SET, (obj, index) => (
                  <Box key={index} sx={ColorBoxChildNowrap}>
                    <Button
                      tabIndex={-1}
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
