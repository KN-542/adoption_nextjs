import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Divider,
} from '@mui/material'
import { useTranslations } from 'next-intl'
import _ from 'lodash'
import { Bold, ColorRed, mb, mr, mt } from '@/styles/index'
import Content from '../common/Content'
import { Contents } from '@/types/management'

type Props = {
  open: boolean
  data: Contents[]
  closeModal: () => void
}

const UserCreateModal = (props: Props) => {
  const t = useTranslations()

  return (
    <Dialog open={props.open} fullWidth maxWidth="xl">
      <DialogTitle component="div">
        <Typography variant="h4" sx={Bold}>
          {t('common.title.modal.createUser')}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Typography variant="h6">{t('features.user.createMsg')}</Typography>
        <Typography variant="h6">{t('features.user.createMsg2')}</Typography>
        <Typography variant="h6" sx={[mt(4), ColorRed]}>
          {t('features.user.createMsg3')}
        </Typography>
        <Content data={props.data} mt={5}></Content>
      </DialogContent>

      <Divider sx={mb(2)} />

      <DialogActions sx={[mr(2), mb(2)]}>
        <Button variant="outlined" color="inherit" onClick={props.closeModal}>
          {t('features.user.backList')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserCreateModal
