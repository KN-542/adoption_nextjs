import { Box, Button } from '@mui/material'
import {
  BackGroundColor,
  BorderRadius,
  MenuDisp,
  SpaceBetween,
  SelectMenu,
  mb,
  w,
  ml,
  FontSize,
  M0Auto,
  mr,
  TextBottom,
} from '@/styles/index'
import { common } from '@mui/material/colors'
import { SelectedMenuModel } from '@/types/common/index'
import _ from 'lodash'
import { useTranslations } from 'next-intl'

type Props = {
  menu: SelectedMenuModel[]
  size: number
}

const SelectedMenu = (props: Props) => {
  const t = useTranslations()

  return (
    <Box
      sx={[
        SpaceBetween,
        w(100),
        M0Auto,
        BackGroundColor(common.white),
        mb(3),
        BorderRadius(4),
        SelectMenu,
      ]}
    >
      <Box>
        {_.map(
          _.filter(props.menu, (m) => m.condition),
          (menu, index) => {
            return (
              <Button
                key={index}
                variant="text"
                onClick={menu.onClick}
                sx={[
                  MenuDisp(menu.color),
                  index > 0 ? null : ml(1),
                  FontSize(20),
                ]}
              >
                {menu.icon}
                {menu.name}
              </Button>
            )
          },
        )}
      </Box>
      <Box sx={[TextBottom, mr(1)]}>{`${props.size}${t(
        'common.menu.size',
      )}`}</Box>
    </Box>
  )
}

export default SelectedMenu
