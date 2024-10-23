import React, { useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Divider,
  Box,
} from '@mui/material'
import { useTranslations } from 'next-intl'
import { Bold, DragDropArea, mb, mr } from '@/styles/index'

type Props = {
  open: boolean
  closeModal: () => void
  afterFuncAsync: (f: File) => Promise<void>
}

const UploadModal = (props: Props) => {
  const t = useTranslations()

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone()

  useEffect(() => {
    acceptedFiles.forEach(props.afterFuncAsync) // 選択されたすべてのファイルを読み込む
  }, [acceptedFiles])

  return (
    <Dialog open={props.open} maxWidth="lg">
      <DialogTitle component="div">
        <Typography variant="h4" sx={Bold}>
          {t('common.title.modal.upload')}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Typography variant="h6">
          {t('features.applicant.uploadMsg')}
        </Typography>
        <Box sx={DragDropArea} {...getRootProps()}>
          <input {...getInputProps()} accept=".txt" />{' '}
          <p>{t('features.applicant.uploadMsg2')}</p>
        </Box>
      </DialogContent>

      <Divider sx={mb(2)} />

      <DialogActions sx={[mr(2), mb(2)]}>
        <Button
          tabIndex={-1}
          variant="outlined"
          color="inherit"
          onClick={props.closeModal}
        >
          {t('common.button.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UploadModal
