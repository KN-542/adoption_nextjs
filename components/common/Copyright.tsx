import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { SxProps, Theme } from '@mui/material/styles'

type Props = {
  sx?: SxProps<Theme>
}

const Copyright = (props: Props) => {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      <Link color="inherit" href="https://www.aaa/" target="_blank">
        AAA Co., Ltd.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

export default Copyright
