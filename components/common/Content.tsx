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
} from '@/styles/index'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useState } from 'react'

type Props = {
  data: Contents[]
  mt?: number
}

const Content = (props: Props) => {
  return (
    <DialogContent sx={[DialogContentMain, mt(props.mt ?? 15)]}>
      {_.map(props.data, (item, index) => {
        const [maskShow, setMaskShow] = useState<boolean>(
          item.mask?.show ?? false,
        )

        const handleMaskClick = () => {
          setMaskShow(!maskShow)
        }

        return (
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
                    {maskShow ? item.element : item.element.replace(/./g, '*')}
                  </Box>
                  <IconButton onClick={handleMaskClick} edge="end">
                    {maskShow ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        )
      })}
    </DialogContent>
  )
}

export default Content
