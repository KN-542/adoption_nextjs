import React, { useEffect, useState } from 'react'
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
import _ from 'lodash'
import {
  Bold,
  ButtonColor,
  FormThreeButtons,
  m,
  mb,
  minW,
  ml,
  mr,
  mt,
} from '@/styles/index'
import { useSelector } from 'react-redux'
import { common } from '@mui/material/colors'
import { RootState } from '@/hooks/store/store'
import { Body, TableHeader } from '@/types/index'
import CustomTable from '../Table'

type Props = {
  open: boolean
  headers?: TableHeader[]
  bodies?: Record<string, Body>[]
  title: string
  buttonTitle: string
  buttonTitle2: string
  msg: string
  w?: number
  m?: number
  ok: () => void
  ng: () => void
  close: () => void
}

const SubmitModal = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [loading, isLoading] = useState<boolean>(true)

  useEffect(() => {
    isLoading(true)
    isLoading(false)
  }, [])

  return (
    <>
      {!loading && (
        <Dialog open={props.open} fullScreen sx={[m(props.m ?? 20)]}>
          <DialogTitle component="div">
            <Typography variant="h4" sx={Bold}>
              {props.title}
            </Typography>
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Box>
              <Box sx={[mt(2), mb(4)]}>
                <Box component="span" sx={[ml(4), mr(4), mt(0.5)]}>
                  {props.msg}
                </Box>
              </Box>

              {_.every([
                !_.isEmpty(props.headers),
                !_.isEmpty(props.bodies),
              ]) && (
                <CustomTable
                  height={25}
                  w={props.w}
                  headers={props.headers}
                  bodies={props.bodies}
                  pageSize={_.size(props.bodies)}
                />
              )}
            </Box>
          </DialogContent>

          <Divider sx={mb(2)} />

          <DialogActions sx={[mr(2), mb(2)]}>
            <Box sx={FormThreeButtons}>
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                sx={minW(180)}
                onClick={props.close}
              >
                {t('common.button.cancel')}
              </Button>
              <Button
                size="large"
                variant="outlined"
                sx={[
                  minW(180),
                  ButtonColor(common.white, setting.toastErrorColor),
                ]}
                onClick={props.ng}
              >
                {props.buttonTitle}
              </Button>
              <Button
                size="large"
                variant="outlined"
                sx={[
                  minW(180),
                  ButtonColor(common.white, setting.toastSuccessColor),
                ]}
                onClick={props.ok}
              >
                {props.buttonTitle2}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default SubmitModal
