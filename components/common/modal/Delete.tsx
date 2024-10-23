import { RootState } from '@/hooks/store/store'
import {
  Bold,
  ButtonColor,
  FormButtons,
  ModalResponsive,
  mb,
  minW,
  ml,
  mr,
  mt,
} from '@/styles/index'
import { Body, TableHeader } from '@/types/index'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material'
import { common } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import { useSelector } from 'react-redux'
import DeleteIcon from '@mui/icons-material/Delete'
import CustomTable from '../Table'
import _ from 'lodash'

type Props = {
  open: boolean
  headers: TableHeader[]
  bodies: Record<string, Body>[]
  close: () => void
  delete: () => void
}

const DeleteModal: FC<Props> = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  return (
    <Dialog open={props.open} fullScreen sx={ModalResponsive}>
      <DialogTitle component="div">
        <Typography variant="h4" sx={Bold}>
          {t('common.title.modal.delete')}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Typography variant="h6" sx={[mt(2), ml(2), mb(8)]}>
          <Box>{t('common.delete.msg')}</Box>
        </Typography>

        <CustomTable
          height={50}
          isNoContent={false}
          headers={props.headers}
          pageSize={2}
          bodies={props.bodies}
        />
      </DialogContent>

      <Divider />

      <DialogActions sx={[ml(2), mt(-1)]}>
        <Box sx={FormButtons}>
          <Button
            tabIndex={-1}
            size="large"
            variant="outlined"
            color="inherit"
            sx={minW(180)}
            onClick={props.close}
          >
            {t('common.button.cancel')}
          </Button>
          <Button
            tabIndex={-1}
            size="large"
            variant="outlined"
            sx={[minW(180), ButtonColor(common.white, setting.toastErrorColor)]}
            onClick={async () => {
              await props.delete()
              props.close()
            }}
          >
            <DeleteIcon sx={mr(0.25)} />
            {t('common.button.delete')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteModal
