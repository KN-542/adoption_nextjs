import {
  Box,
  Button,
  CssBaseline,
  DialogContent,
  TextField,
  FormLabel,
  Typography,
} from '@mui/material'
import {
  ButtonColor,
  DialogContentMain,
  FormBox,
  FormButtons,
  M0Auto,
  minW,
  mt,
  w,
} from '@/styles/index'
import { useTranslations } from 'next-intl'
import { trim } from 'lodash'
import ErrorHandler from '@/components/ErrorHandler'
import { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { Pattern, ValidationType } from '@/enum/validation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { common } from '@mui/material/colors'

export type InputsPassword = {
  password: string
  newPassword: string
  newPasswordConfirm: string
}

type Props = {
  msg?: string
  buttonMsg: string
  buttonFunc: () => void
  asyncFunc: (inputs: InputsPassword) => void
}

const PasswordChangeContent = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.management.setting)

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
    formState: { errors },
  } = useForm<InputsPassword>()

  const submit: SubmitHandler<InputsPassword> = async (
    inputs: InputsPassword,
  ) => {
    await props.asyncFunc(inputs)
  }

  return (
    <>
      <DialogContent sx={[DialogContentMain, mt(15)]}>
        <Typography variant="h6" sx={mt(4)}>
          {props.msg}
        </Typography>

        <Box sx={[M0Auto, w(100)]}>
          <CssBaseline />
          <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            noValidate
            sx={FormBox}
          >
            <FormLabel>
              {t('management.features.login.currentPassword') + '*'}
            </FormLabel>
            <TextField
              margin="normal"
              type="password"
              required
              style={w(90)}
              {...register('password', {
                required: true,
                maxLength: formValidationValue.password.max,
                pattern: formValidationValue.password.pattern,
                setValueAs: (value) => trim(value),
              })}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            <ErrorHandler
              validations={formValidation.password}
              type={errors.password?.type}
            ></ErrorHandler>

            <FormLabel sx={mt(6)}>
              {t('management.features.login.newPassword') + '*'}
            </FormLabel>
            <TextField
              margin="normal"
              type="password"
              required
              style={w(90)}
              {...register('newPassword', {
                required: true,
                maxLength: formValidationValue.newPassword.max,
                pattern: formValidationValue.newPassword.pattern,
                setValueAs: (value) => trim(value),
              })}
              aria-invalid={errors.newPassword ? 'true' : 'false'}
            />
            <ErrorHandler
              validations={formValidation.newPassword}
              type={errors.newPassword?.type}
            ></ErrorHandler>

            <FormLabel sx={mt(6)}>
              {t('management.features.login.newPasswordConfirm') + '*'}
            </FormLabel>
            <TextField
              margin="normal"
              type="password"
              required
              style={w(90)}
              {...register('newPasswordConfirm', {
                required: true,
                maxLength: formValidationValue.newPasswordConfirm.max,
                pattern: formValidationValue.newPasswordConfirm.pattern,
                setValueAs: (value) => trim(value),
              })}
              aria-invalid={errors.newPasswordConfirm ? 'true' : 'false'}
            />
            <ErrorHandler
              validations={formValidation.newPasswordConfirm}
              type={errors.newPasswordConfirm?.type}
            ></ErrorHandler>

            <Box sx={FormButtons}>
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                sx={minW(180)}
                onClick={props.buttonFunc}
              >
                {t(`common.button.${props.buttonMsg}`)}
              </Button>
              <Button
                size="large"
                type="submit"
                variant="contained"
                sx={[minW(180), ButtonColor(common.white, setting.color)]}
              >
                {t('management.features.login.passwordButton')}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </>
  )
}

export default PasswordChangeContent
