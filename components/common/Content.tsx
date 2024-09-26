import { Contents } from '@/types/index'
import { DialogContent, Box, Divider, IconButton } from '@mui/material'
import _ from 'lodash'
import {
  DialogKey,
  DialogContentMain,
  DialogValue,
  DialogKeyChild,
  mt,
  mb,
  w,
} from '@/styles/index'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useState } from 'react'

type Props = {
  data: Contents[]
  mt?: number
}

const Content = (props: Props) => {
  // maskShow の状態を配列として管理
  const [maskShows, setMaskShows] = useState<boolean[]>(
    props.data.map((item) => item.mask?.show ?? false),
  )

  const handleMaskClick = (index: number) => {
    // maskShow を更新するための関数
    setMaskShows((prevMaskShows) =>
      prevMaskShows.map((show, i) => (i === index ? !show : show)),
    )
  }

  return (
    <DialogContent sx={[DialogContentMain, w(90), mt(props.mt ?? 15)]}>
      {_.map(props.data, (item, index) => (
        <Box key={index} sx={[mb(5), DialogKey]}>
          <Box sx={DialogKeyChild}>{item.key}</Box>

          <Divider orientation="vertical" flexItem />

          <Box sx={[DialogValue, DialogKey]}>
            {_.some([!item.mask, !item.mask?.disp]) && (
              <Box>{item.element}</Box>
            )}
            {_.every([item.mask, item.mask.disp]) && (
              <>
                <Box>
                  {maskShows[index]
                    ? item.element
                    : item.element.replace(/./g, '*')}
                </Box>
                <IconButton onClick={() => handleMaskClick(index)} edge="end">
                  {maskShows[index] ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      ))}
    </DialogContent>
  )
}

export default Content
