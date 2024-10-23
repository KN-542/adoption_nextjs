import { RootState } from '@/hooks/store/store'
import {
  Bold,
  ButtonColor,
  Color,
  TableMenuButtons,
  minW,
  ml,
  ModalResponsive,
  mr,
  mt,
} from '@/styles/index'
import { TableHeader } from '@/types/index'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Typography,
} from '@mui/material'
import { common } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { FC, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import _ from 'lodash'
import { LITTLE_DURING } from '@/hooks/common'

type Props = {
  open: boolean
  headers: Record<string, TableHeader>
  close: () => void
  submit: (headers: Record<string, TableHeader>) => void
}

const ColumnsModal: FC<Props> = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [headers, setHeaders] = useState<Record<string, TableHeader>>(
    props.headers,
  )

  const [loading, isLoading] = useState<boolean>(false)

  const processing = useRef<boolean>(false)

  return (
    <Dialog open={props.open} maxWidth="md" sx={ModalResponsive}>
      <DialogTitle component="div">
        <Typography variant="h4" sx={Bold}>
          {t('common.title.modal.columns')}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {!loading && (
          <Box>
            {_.map(
              _.filter(_.keys(headers), (k) => headers[k].option.isChange),
              (key, index) => {
                return (
                  <FormControlLabel
                    key={index}
                    sx={[minW(400)]}
                    color={setting.color}
                    checked={headers[key].option.display}
                    control={
                      <Checkbox
                        style={Color(setting.color)}
                        checked={headers[key].option.display}
                        onClick={() => {
                          isLoading(true)
                          setHeaders((h) => {
                            const newHeaders = { ...h }
                            newHeaders[key].option.display =
                              !newHeaders[key].option.display
                            return newHeaders
                          })
                          isLoading(false)
                        }}
                      />
                    }
                    label={headers[key].name}
                  />
                )
              },
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={[ml(2), mt(-1)]}>
        <Box sx={[TableMenuButtons, mt(6)]}>
          <Button
            tabIndex={-1}
            size="large"
            variant="outlined"
            color="inherit"
            sx={[mr(2), minW(180)]}
            onClick={props.close}
          >
            {t('common.button.cancel')}
          </Button>
          <Button
            tabIndex={-1}
            size="large"
            variant="outlined"
            sx={[minW(180), ButtonColor(common.white, setting.color)]}
            onClick={() => {
              if (processing.current) return
              processing.current = true

              props.submit(headers)

              setTimeout(() => {
                processing.current = false
              }, LITTLE_DURING)
            }}
          >
            <ViewColumnIcon sx={mr(0.25)} />
            {t('common.button.columnDisplay')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ColumnsModal
