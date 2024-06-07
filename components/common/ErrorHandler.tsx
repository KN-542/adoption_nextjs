import { Validation } from '@/hooks/validation'
import { Box } from '@mui/material'
import _ from 'lodash'
import { ColorRed } from '@/styles/index'

type Props = {
  validations: Validation[]
  type: string
}

const ErrorHandler = (props: Props) => {
  return (
    <>
      {_.map(
        _.filter(props.validations, (f) => _.isEqual(f.type, props.type)),
        (item, index) => {
          return (
            <Box component="p" role="alert" sx={ColorRed} key={index}>
              {item.message}
            </Box>
          )
        },
      )}
    </>
  )
}

export default ErrorHandler
