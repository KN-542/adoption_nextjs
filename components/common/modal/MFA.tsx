import { RootState } from '@/hooks/store/store'
import {
  ButtonColor,
  M0Auto,
  SpaceEvenly,
  TextCenter,
  ml,
  ModalResponsive,
  mr,
  mt,
} from '@/styles/index'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material'
import { common } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { useSelector } from 'react-redux'
import _ from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import ErrorHandler from '@/components/common/ErrorHandler'
import { Pattern, ValidationType } from '@/enum/validation'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { SettingModel } from '@/types/common/index'

type Props = {
  open: boolean
  back: () => void
  reSend: () => void
  submit: (s: string) => void
}

type Inputs = {
  mfa: string
}

const MFA = (props: Props) => {
  const t = useTranslations()

  const setting: SettingModel = useSelector((state: RootState) => state.setting)

  const formValidationValue: FormValidationValue = {
    mfa: {
      min: 6,
      max: 6,
      pattern: new RegExp(Pattern.HalfNum),
    },
  }

  const formValidation: FormValidation = {
    mfa: [
      {
        type: ValidationType.Required,
        message: t('features.login.mfa') + t('common.validate.required'),
      },
      {
        type: ValidationType.Pattern,
        message: t('common.validate.halfNum'),
      },
      {
        type: ValidationType.MinLength,
        message:
          String(formValidationValue.mfa.min) + t('common.validate.length'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          String(formValidationValue.mfa.max) + t('common.validate.length'),
      },
    ],
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>()

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    await props.submit(d.mfa)
    if (!props.open) reset()
  }

  return (
    <Dialog
      open={props.open}
      maxWidth="xl"
      PaperProps={{ sx: ModalResponsive }}
    >
      <DialogContent>
        <Typography variant="h6" sx={[mt(8), mr(8), ml(8), TextCenter]}>
          <Box>{t('features.login.mfaMsg1')}</Box>
          <Box>{t('features.login.mfaMsg2')}</Box>
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(submit)}
          noValidate
          sx={[mr(8), ml(8), mt(6)]}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('features.login.mfa')}
            autoFocus
            {...register('mfa', {
              required: true,
              minLength: formValidationValue.mfa.min,
              maxLength: formValidationValue.mfa.max,
              pattern: formValidationValue.mfa.pattern,
              setValueAs: (value) => _.trim(value),
            })}
            aria-invalid={errors.mfa ? 'true' : 'false'}
          />
          <ErrorHandler
            validations={formValidation.mfa}
            type={errors.mfa?.type}
          ></ErrorHandler>

          <Box sx={[SpaceEvenly, M0Auto, mt(6)]}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                reset()
                props.back()
              }}
            >
              {t('common.button.back')}
            </Button>
            <Button
              variant="contained"
              sx={ButtonColor(common.white, setting.color)}
              onClick={async () => {
                reset()
                await props.reSend()
              }}
            >
              {t('common.button.reSend')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={ButtonColor(common.white, setting.color)}
            >
              {t('common.button.auth')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default MFA
