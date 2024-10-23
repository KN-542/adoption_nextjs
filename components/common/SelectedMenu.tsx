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
  minW,
  Color,
  TextTransformNone,
  WhiteSpaceNoWrap,
  TextLeft,
} from '@/styles/index'
import { common } from '@mui/material/colors'
import { SelectedMenuModel } from '@/types/index'
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
        w(40),
        M0Auto,
        BackGroundColor(common.white),
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
                tabIndex={-1}
                key={index}
                variant="text"
                onClick={menu.onClick}
                sx={[TextTransformNone, ml(1), FontSize(20)]}
              >
                <Box component="span" sx={MenuDisp(menu.color)}>
                  {menu.icon}
                </Box>
                <Box
                  component="span"
                  sx={[minW(250), TextLeft, Color(common.black)]}
                >
                  {menu.name}
                </Box>
              </Button>
            )
          },
        )}
      </Box>
      <Box sx={[TextBottom, WhiteSpaceNoWrap, ml(3), mr(1)]}>{`${props.size}${t(
        'common.menu.size',
      )}`}</Box>
    </Box>
  )
}

export default SelectedMenu
