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
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { common } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { isEqual, trim } from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import ErrorHandler from '@/components/common/ErrorHandler'
import { Pattern, ValidationType } from '@/enum/validation'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { SettingModel } from '@/types/management'

type Props = {
  open: boolean
  mustChange: boolean
  back: () => void
  submit: (d: Inputs) => void
}

export type Inputs = {
  password: string
  newPassword: string
  newPasswordConfirm: string
}

const PasswordChange = (props: Props) => {
  const t = useTranslations()

  const setting: SettingModel = useSelector((state: RootState) => state.setting)

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] =
    useState<boolean>(false)

  const validate = {
    min: 8,
    max: 16,
    pattern: new RegExp(Pattern.HalfAlphaNum),
  }
  const formValidationValue: FormValidationValue = {
    password: validate,
    newPassword: validate,
    newPasswordConfirm: validate,
  }

  const validateType = [
    {
      type: ValidationType.Required,
      message: t('common.validate.required2'),
    },
    {
      type: ValidationType.MinLength,
      message:
        String(formValidationValue.password.min) +
        t('common.validate.minLength') +
        String(formValidationValue.password.max) +
        t('common.validate.maxLength'),
    },
    {
      type: ValidationType.MaxLength,
      message:
        String(formValidationValue.password.min) +
        t('common.validate.minLength') +
        String(formValidationValue.password.max) +
        t('common.validate.maxLength'),
    },
    {
      type: ValidationType.Pattern,
      message: t('common.validate.halfAlphaNum'),
    },
  ]
  const formValidation: FormValidation = {
    password: validateType,
    newPassword: validateType,
    newPasswordConfirm: validateType,
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>()

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    if (!isEqual(d.newPassword, d.newPasswordConfirm)) {
      toast(t('features.login.newPasswordMsg'), {
        style: {
          backgroundColor: setting.toastErrorColor,
          color: common.white,
          width: 600,
        },
        position: 'bottom-left',
        hideProgressBar: true,
        closeButton: () => <ClearIcon />,
      })
      return
    }

    if (isEqual(d.newPassword, d.password)) {
      toast(t('features.login.newPasswordMsg2'), {
        style: {
          backgroundColor: setting.toastErrorColor,
          color: common.white,
          width: 600,
        },
        position: 'bottom-left',
        hideProgressBar: true,
        closeButton: () => <ClearIcon />,
      })
      return
    }

    await props.submit(d)
    if (!props.open) reset()
  }

  return (
    <Dialog
      open={props.open}
      maxWidth="xl"
      PaperProps={{ sx: ModalResponsive }}
    >
      <DialogContent>
        {props.mustChange && (
          <Typography variant="h6" sx={[mt(8), mr(8), ml(8), TextCenter]}>
            <Box>{t('features.login.passwordChangeMsg')}</Box>
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(submit)}
          noValidate
          sx={[mr(8), ml(8), mt(props.mustChange ? 6 : 8)]}
        >
          <TextField
            margin="normal"
            type={showPassword ? 'text' : 'password'}
            required
            fullWidth
            label={t('features.login.currentPassword')}
            autoFocus
            {...register('password', {
              required: true,
              minLength: formValidationValue.password.min,
              maxLength: formValidationValue.password.max,
              pattern: formValidationValue.password.pattern,
              setValueAs: (value) => trim(value),
            })}
            aria-invalid={errors.password ? 'true' : 'false'}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          <ErrorHandler
            validations={formValidation.password}
            type={errors.password?.type}
          ></ErrorHandler>
          <TextField
            margin="normal"
            type={showNewPassword ? 'text' : 'password'}
            required
            fullWidth
            label={t('features.login.newPassword')}
            {...register('newPassword', {
              required: true,
              minLength: formValidationValue.newPassword.min,
              maxLength: formValidationValue.newPassword.max,
              pattern: formValidationValue.newPassword.pattern,
              setValueAs: (value) => trim(value),
            })}
            aria-invalid={errors.newPassword ? 'true' : 'false'}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
          />
          <ErrorHandler
            validations={formValidation.newPassword}
            type={errors.newPassword?.type}
          ></ErrorHandler>
          <TextField
            margin="normal"
            type={showNewPasswordConfirm ? 'text' : 'password'}
            required
            fullWidth
            label={t('features.login.newPasswordConfirm')}
            {...register('newPasswordConfirm', {
              required: true,
              minLength: formValidationValue.newPasswordConfirm.min,
              maxLength: formValidationValue.newPasswordConfirm.max,
              pattern: formValidationValue.newPasswordConfirm.pattern,
              setValueAs: (value) => trim(value),
            })}
            aria-invalid={errors.newPasswordConfirm ? 'true' : 'false'}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() =>
                    setShowNewPasswordConfirm(!showNewPasswordConfirm)
                  }
                  edge="end"
                >
                  {showNewPasswordConfirm ? (
                    <VisibilityOffIcon />
                  ) : (
                    <VisibilityIcon />
                  )}
                </IconButton>
              ),
            }}
          />
          <ErrorHandler
            validations={formValidation.newPasswordConfirm}
            type={errors.newPasswordConfirm?.type}
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
              type="submit"
              variant="contained"
              sx={ButtonColor(common.white, setting.color)}
            >
              {t('features.login.passwordButton')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default PasswordChange
