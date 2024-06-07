import React, { useEffect, useRef, useState } from 'react'
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  IconButton,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Copyright from '@/components/common/Copyright'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { useTranslations } from 'next-intl'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Pattern, ValidationType } from '@/enum/validation'
import ErrorHandler from '@/components/common/ErrorHandler'
import _ from 'lodash'
import {
  LogoutCSR,
  MFACSR,
  MFACreateCSR,
  PasswordChangeCSR,
  LoginCSR,
} from '@/api/repository'
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
import { mgChangeSetting, signOut, userModel } from '@/hooks/store'
import { SettingModel, UserModel } from '@/types/common/index'
import { RouterPath } from '@/enum/router'
import NextHead from '@/components/common/Header'
import {
  LoginRequest,
  LogoutRequest,
  MFACreateRequest,
  MFARequest,
  PasswordChangeRequest,
} from '@/api/model/request'
import {
  APICommonCode,
  APILoginCode,
  APIMFACode,
  APISessionCheckCode,
} from '@/enum/apiError'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { common } from '@mui/material/colors'
import ClearIcon from '@mui/icons-material/Clear'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import PasswordChange from '@/components/common/modal/PasswordChange'
import { Inputs as InputsPassword } from '@/components/common/modal/PasswordChange'
import MFA from '@/components/common/modal/MFA'

type Inputs = {
  email: string
  password: string
}

const Login = () => {
  const router = useRouter()
  const t = useTranslations()

  const setting: SettingModel = useSelector((state: RootState) => state.setting)
  const user: UserModel = useSelector((state: RootState) => state.user)

  const [hash, setHash] = useState<string>('')
  const [open, isOpen] = useState<boolean>(false)
  const [openPasswordChange, isOpenPasswordChange] = useState<boolean>(false)
  const [loading, isLoading] = useState<boolean>(true)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [path, setPath] = useState<string>('')
  const submitButtonRef = useRef(null)

  const formValidationValue: FormValidationValue = {
    email: {
      max: 50,
      pattern: new RegExp(Pattern.Email),
    },
    password: {
      min: 8,
      max: 16,
      pattern: new RegExp(Pattern.HalfAlphaNum),
    },
  }

  const formValidation: FormValidation = {
    email: [
      {
        type: ValidationType.Required,
        message: t('features.login.email') + t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.login.email') +
          t('common.validate.is') +
          String(formValidationValue.email.max) +
          t('common.validate.maxLength'),
      },
      {
        type: ValidationType.Pattern,
        message: t('common.validate.pattern.email'),
      },
    ],
    password: [
      {
        type: ValidationType.Required,
        message: t('features.login.password') + t('common.validate.required'),
      },
      {
        type: ValidationType.MinLength,
        message:
          t('features.login.password') +
          t('common.validate.is') +
          String(formValidationValue.password.min) +
          t('common.validate.minLength') +
          String(formValidationValue.password.max) +
          t('common.validate.maxLength'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.login.password') +
          t('common.validate.is') +
          String(formValidationValue.password.min) +
          t('common.validate.minLength') +
          String(formValidationValue.password.max) +
          t('common.validate.maxLength'),
      },
      {
        type: ValidationType.Pattern,
        message:
          t('features.login.password') +
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
    await LoginCSR({
      email: d.email,
      password: d.password,
    } as LoginRequest)
      .then(async (res) => {
        setHash(String(res.data.hash_key))
        // API MFAコード生成
        await MFACreateCSR({
          hash_key: String(res.data.hash_key),
        } as MFACreateRequest)
          .then(() => {
            store.dispatch(
              userModel({
                hashKey: res.data.hash_key,
                name: res.data.name,
                email: d.email,
              } as UserModel),
            )
            isOpen(true)
          })
          .catch((error) => {
            if (
              _.every([
                500 <= error.response?.status,
                error.response?.status < 600,
              ])
            ) {
              router.push(RouterPath.Error)
              return
            }

            let msg = ''
            if (
              _.isEqual(error.response?.data.code, APICommonCode.BadRequest)
            ) {
              msg = t(`common.api.code.${error.response?.data.code}`)
            } else if (
              _.isEqual(
                error.response?.data.code,
                APISessionCheckCode.LoginRequired,
              )
            ) {
              msg = t(`common.api.code.expired${error.response?.data.code}`)
            }

            store.dispatch(
              mgChangeSetting({
                errorMsg: msg,
              } as SettingModel),
            )
          })
      })
      .catch((error) => {
        let msg = ''

        if (error.response?.data.code > 0) {
          if (_.isEqual(error.response?.data.code, APICommonCode.BadRequest)) {
            msg = t(`common.api.code.${error.response?.data.code}`)
          } else if (
            _.isEqual(error.response?.data.code, APILoginCode.LoinAuth)
          ) {
            msg = t(`common.api.code.login${error.response?.data.code}`)
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
          _.every([500 <= error.response?.status, error.response?.status < 600])
        ) {
          router.push(RouterPath.Error)
        }
      })
  }

  const reSend = async () => {
    isOpen(false)
    setTimeout(async () => {
      await submitButtonRef.current.click()
    }, 0.25 * 1000)
  }

  const reset = async () => {
    if (_.isEmpty(user.hashKey)) return
    // API ログアウト
    await LogoutCSR({
      hash_key: user.hashKey,
    } as LogoutRequest)
      .then(() => {
        store.dispatch(signOut())
      })
      .catch((error) => {
        if (
          _.every([500 <= error.response?.status, error.response?.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }
      })
  }

  const mfaSubmit = async (mfa: string) => {
    // API MFA
    await MFACSR({
      hash_key: hash,
      code: mfa,
    } as MFARequest)
      .then((res) => {
        isOpen(false)

        store.dispatch(
          userModel({
            path: `/${String(res.data.path)}`,
          } as UserModel),
        )

        if (Boolean(res.data.is_password_change)) {
          setPath(String(res.data.path))
          isOpenPasswordChange(true)
          return
        }

        _.isEqual(`/${String(res.data.path)}`, RouterPath.Admin)
          ? router.push(RouterPath.Admin + RouterPath.Home)
          : router.push(RouterPath.Management + RouterPath.Home)
      })
      .catch(async (error) => {
        if (
          _.every([500 <= error.response?.status, error.response?.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        let msg = ''
        if (_.isEqual(error.response?.data.code, APICommonCode.BadRequest)) {
          msg = t(`common.api.code.${error.response?.data.code}`)
        } else {
          msg = t(`common.api.code.mfa${error.response?.data.code}`)
        }

        toast(msg, {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 600,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })

        if (_.isEqual(error.response?.data.code, APIMFACode.Expired)) {
          setTimeout(async () => {
            await submitButtonRef.current.click()
          }, 0.25 * 1000)
        }
      })
  }

  const passwordChangeSubmit = async (obj: InputsPassword) => {
    // API パスワード変更
    await PasswordChangeCSR({
      hash_key: hash,
      password: obj.newPassword,
      init_password: obj.password,
    } as PasswordChangeRequest)
      .then(() => {
        _.isEqual(`/${path}`, RouterPath.Admin)
          ? router.push(RouterPath.Admin + RouterPath.Home)
          : router.push(RouterPath.Management + RouterPath.Home)
      })
      .catch((error) => {
        if (
          _.every([500 <= error.response?.status, error.response?.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        let msg = ''
        if (_.isEqual(error.response?.data.code, APICommonCode.BadRequest)) {
          msg = t(`common.api.code.${error.response?.data.code}`)
        } else {
          msg = t(`common.api.code.passwordChange${error.response?.data.code}`)
        }

        toast(msg, {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 600,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })
      })
  }

  useEffect(() => {
    if (loading) {
      // トースト
      if (!_.isEmpty(setting.errorMsg)) {
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
        store.dispatch(signOut())
      }

      // ログアウト
      reset()
    }
    isLoading(false)
  })

  return (
    <>
      <NextHead></NextHead>
      {!loading && (
        <>
          <Container component="main" maxWidth="xs" sx={mt(30)}>
            <CssBaseline />
            <Box sx={LoginMain}>
              <Avatar sx={[m(1), SecondaryMain]}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h4">
                {t('features.login.top')}
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
                  label={t('features.login.email')}
                  autoFocus
                  sx={minW(396)}
                  {...register('email', {
                    required: true,
                    maxLength: formValidationValue.email.max,
                    pattern: formValidationValue.email.pattern,
                    setValueAs: (value) => _.trim(value),
                  })}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                <ErrorHandler
                  validations={formValidation.email}
                  type={errors.email?.type}
                ></ErrorHandler>
                <TextField
                  margin="normal"
                  type={showPassword ? 'text' : 'password'}
                  required
                  fullWidth
                  label={t('features.login.password')}
                  autoComplete="current-password"
                  sx={minW(396)}
                  {...register('password', {
                    required: true,
                    minLength: formValidationValue.password.min,
                    maxLength: formValidationValue.password.max,
                    pattern: formValidationValue.password.pattern,
                    setValueAs: (value) => _.trim(value),
                  })}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />
                <ErrorHandler
                  validations={formValidation.password}
                  type={errors.password?.type}
                ></ErrorHandler>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  ref={submitButtonRef}
                  sx={[mt(3), mb(1), ButtonColor(common.white, setting.color)]}
                >
                  {t('features.login.login')}
                </Button>
              </Box>
            </Box>
            <Copyright sx={[mt(8), mb(4)]} />
          </Container>

          <MFA
            open={open}
            back={() => {
              isOpen(false)
              reset()
            }}
            reSend={reSend}
            submit={mfaSubmit}
          />

          <PasswordChange
            open={openPasswordChange}
            mustChange={true}
            back={() => {
              isOpenPasswordChange(false)
              reset()
            }}
            submit={passwordChangeSubmit}
          />
        </>
      )}
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Login
