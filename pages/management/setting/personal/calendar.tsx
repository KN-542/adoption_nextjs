import DropDownList2 from '@/components/common/DropDownList2'
import NextHead from '@/components/common/Header'
import SettingMenu from '@/components/common/SettingMenu'
import store, { RootState } from '@/hooks/store/store'
import {
  Color,
  ColumnMt4,
  DialogContentSetting,
  M0Auto,
  mb,
  ml,
  mr,
  mt,
  SpaceBetween,
  w,
} from '@/styles/index'
import { Box, DialogContent, FormLabel } from '@mui/material'
import { GetServerSideProps } from 'next'
import { useTranslations } from 'next-intl'
import { useSelector } from 'react-redux'
import PaletteIcon from '@mui/icons-material/Palette'
import RectangleIcon from '@mui/icons-material/Rectangle'
import { SelectTitlesModel, SettingModel } from '@/types/index'
import { useState } from 'react'
import { COLOR_SET } from '@/hooks/common'
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

const CalendarDesign = () => {
  const t = useTranslations()
  const setting = useSelector((state: RootState) => state.setting)

  const [colors, setColors] = useState<SelectTitlesModel[]>(
    _.map(setting.calendarColors, (item) => ({
      key: item,
      title: item,
      subTitle: '',
    })),
  )

  return (
    <>
      <NextHead />

      <Box sx={mt(18)}>
        <Box sx={[SpaceBetween, w(90), M0Auto]}>
          <SettingMenu />
          <DialogContent sx={[DialogContentSetting, w(90), ml(3)]}>
            <Box sx={ColumnMt4}>
              <FormLabel sx={[mt(2), mb(1)]}>
                {t('features.setting.personal.sub.calendar.array')}
              </FormLabel>

              <DropDownList2
                list={_.map(colors, (item) => {
                  return {
                    key: item.key,
                    title: item.title,
                    subTitle: item.subTitle,
                  } as SelectTitlesModel
                })}
                initList={_.map(COLOR_SET, (item) => {
                  return {
                    key: item.color,
                    title: item.color,
                    subTitle: '',
                    icon: (
                      <PaletteIcon
                        fontSize="large"
                        sx={[mr(2), Color(item.color)]}
                      />
                    ),
                  } as SelectTitlesModel
                })}
                sx={[ml(2), w(75)]}
                onChange={(value) => {
                  if (_.isEmpty(value)) {
                    const l = [
                      {
                        key: setting.color,
                        title: setting.color,
                        subTitle: '',
                      } as SelectTitlesModel,
                    ]
                    setColors(l)
                    store.dispatch(
                      changeSetting({
                        calendarColors: _.map(l, (v) => v.title),
                      } as SettingModel),
                    )
                    return
                  }

                  setColors(value)
                  store.dispatch(
                    changeSetting({
                      calendarColors: _.map(value, (v) => v.title),
                    } as SettingModel),
                  )
                }}
              />

              <Box sx={mt(4)}>
                {_.map(colors, (item, index) => {
                  return (
                    <Box key={index}>
                      <RectangleIcon
                        fontSize="large"
                        sx={[ml(2), mr(2), Color(item.title)]}
                      />
                      {item.title}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </DialogContent>
        </Box>
      </Box>
    </>
  )
}

export default CalendarDesign
