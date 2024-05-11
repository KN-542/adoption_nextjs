import { Contents } from '@/types/management'
import { DialogContent, Box, Divider } from '@mui/material'
import { map } from 'lodash'
import {
  DialogKey,
  DialogContentMain,
  DialogValue,
  DialogKeyChild,
  mt,
} from '@/styles/index'

type Props = {
  data: Contents[]
  mt?: number
}

const Content = (props: Props) => {
  return (
    <DialogContent sx={[DialogContentMain, mt(props.mt ?? 15)]}>
      {map(props.data, (item, index) => {
        return (
          <Box key={index} sx={DialogKey}>
            <Box sx={DialogKeyChild}>{item.key}</Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={DialogValue}>{item.element}</Box>
          </Box>
        )
      })}
    </DialogContent>
  )
}

export default Content
