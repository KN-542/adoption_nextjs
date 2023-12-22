import React, { useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Copyright from '@/components/Copyright'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { useTranslations } from 'next-intl'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Pattern, ValidationType } from '@/enum/validation'
import ErrorHandler from '@/components/ErrorHandler'
import { every, isEmpty, isEqual, trim } from 'lodash'
import { loginCSR } from '@/api/repository'
import { useRouter } from 'next/router'
import {
  LoginMain,
  minW,
  mt,
  mb,
  SecondaryMain,
  m,
  ButtonColor,
} from '@/styles/index'
import store, { RootState } from '@/hooks/store/store'
import { mgChangeSetting, mgSignOut, mgUserSignIn } from '@/hooks/store'
import { SettingModel, UserModel } from '@/types/management'
import { RouterPath } from '@/enum/router'
import NextHead from '@/components/Header'
import { LoginRequest } from '@/api/model/management'
import { APICommonCode, APILoginCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { common } from '@mui/material/colors'
import ClearIcon from '@mui/icons-material/Clear'
import { MFAStatus, PasswordChangeStatus } from '@/enum/login'

type Inputs = {
  mail: string
  password: string
}

const Login = () => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.management.setting)

  useEffect(() => {
    if (!isEmpty(setting.errorMsg)) {
      setTimeout(() => {
        toast(setting.errorMsg, {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 630,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })
      }, 0.1 * 1000)

      store.dispatch(
        mgChangeSetting({
          errorMsg: '',
        } as SettingModel),
      )
      store.dispatch(mgSignOut())
    }
  }, [])

  const [_dataCSR, setDataCSR] = useState('')

  const formValidationValue: FormValidationValue = {
    mail: {
      max: 30,
      pattern: new RegExp(Pattern.Mail),
    },
    password: {
      min: 8,
      max: 16,
      pattern: new RegExp(Pattern.HalfAlphaNum),
    },
  }

  const formValidation: FormValidation = {
    mail: [
      {
        type: ValidationType.Required,
        message:
          t('management.features.login.mail') + t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('management.features.login.mail') +
          t('common.validate.is') +
          String(formValidationValue.mail.max) +
          t('common.validate.maxLength'),
      },
      {
        type: ValidationType.Pattern,
        message: t('common.validate.pattern.mail'),
      },
    ],
    password: [
      {
        type: ValidationType.Required,
        message:
          t('management.features.login.password') +
          t('common.validate.required'),
      },
      {
        type: ValidationType.MinLength,
        message:
          t('management.features.login.password') +
          t('common.validate.is') +
          String(formValidationValue.password.min) +
          t('common.validate.minLength') +
          String(formValidationValue.password.max) +
          t('common.validate.maxLength'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('management.features.login.password') +
          t('common.validate.is') +
          String(formValidationValue.password.min) +
          t('common.validate.minLength') +
          String(formValidationValue.password.max) +
          t('common.validate.maxLength'),
      },
      {
        type: ValidationType.Pattern,
        message:
          t('management.features.login.password') +
          t('common.validate.is') +
          t('common.validate.halfAlphaNum'),
      },
    ],
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    // API ログイン
    await loginCSR({
      email: d.mail,
      password: d.password,
    } as LoginRequest)
      .then((res) => {
        store.dispatch(
          mgUserSignIn({
            hashKey: res.data.hash_key,
            name: res.data.name,
            mail: d.mail,
            role: res.data.role_id,
          } as UserModel),
        )

        if (isEqual(res.data.mfa, MFAStatus.UnAuthenticated)) {
          router.push(RouterPath.ManagementLoginMFA)
          return
        }

        isEqual(res.data.password_change, PasswordChangeStatus.UnRequired)
          ? router.push(RouterPath.ManagementApplicant)
          : router.push(RouterPath.ManagementLoginPasswordChange)
      })
      .catch((error) => {
        let msg = ''

        if (error.response.data.code > 0) {
          if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
            msg = t(`common.api.code.${error.response.data.code}`)
          } else if (isEqual(error.response.data.code, APILoginCode.LoinAuth)) {
            msg = t(`common.api.code.login${error.response.data.code}`)
          }

          toast(msg, {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
          return
        }

        if (
          every([500 <= error.response.status, error.response.status < 600])
        ) {
          router.push(RouterPath.ManagementError)
        }
      })
  }

  return (
    <>
      <NextHead></NextHead>
      <Container component="main" maxWidth="xs" sx={mt(30)}>
        <CssBaseline />
        <Box sx={LoginMain}>
          <Avatar sx={[m(1), SecondaryMain]}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t('management.features.login.top')}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            noValidate
            sx={mt(1)}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('management.features.login.mail')}
              autoFocus
              sx={minW(396)}
              {...register('mail', {
                required: true,
                maxLength: formValidationValue.mail.max,
                pattern: formValidationValue.mail.pattern,
                setValueAs: (value) => trim(value),
              })}
              aria-invalid={errors.mail ? 'true' : 'false'}
            />
            <ErrorHandler
              validations={formValidation.mail}
              type={errors.mail?.type}
            ></ErrorHandler>
            <TextField
              margin="normal"
              type="password"
              required
              fullWidth
              label={t('management.features.login.password')}
              autoComplete="current-password"
              sx={minW(396)}
              {...register('password', {
                required: true,
                minLength: formValidationValue.password.min,
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={[mt(3), mb(1), ButtonColor(common.white, setting.color)]}
            >
              {t('management.features.login.login')}
            </Button>
          </Box>
        </Box>
        <Copyright sx={[mt(8), mb(4)]} />
      </Container>
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Login
