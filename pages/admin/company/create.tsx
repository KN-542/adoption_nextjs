import { CreateCompanyRequest, RolesRequest } from '@/api/model/request'
import { CreateCompanyCSR, RolesCSR } from '@/api/repository'
import NextHead from '@/components/common/Header'
import { RouterPath } from '@/enum/router'
import store, { RootState } from '@/hooks/store/store'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { Pattern, ValidationType } from '@/enum/validation'
import {
  Box,
  Button,
  CssBaseline,
  DialogContent,
  FormLabel,
  TextField,
} from '@mui/material'
import {
  ButtonColor,
  ColumnMt4,
  DialogContentMain,
  FormButtons,
  M0Auto,
  minW,
  mr,
  mt,
  w,
} from '@/styles/index'
import ErrorHandler from '@/components/common/ErrorHandler'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { Operation } from '@/enum/common'
import { changeSetting } from '@/hooks/store'
import { SettingModel } from '@/types/index'
import { GetServerSideProps } from 'next'

type Props = {
  isError: boolean
}

type Inputs = {
  name: string
  email: string
}

const CompanyCreate: FC<Props> = ({ isError }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [init, isInit] = useState<boolean>(true)

  const processing = useRef<boolean>(false)

  const inits = async () => {
    // API 使用可能ロール一覧
    await RolesCSR({
      hash_key: user.hashKey,
    } as RolesRequest)
      .then((res) => {
        setRoles(res.data.map as { [key: string]: boolean })

        if (!res.data.map[Operation.AdminCompanyCreate]) {
          store.dispatch(
            changeSetting({
              errorMsg: [t(`common.api.header.403`)],
            } as SettingModel),
          )
          router.push(RouterPath.Admin + RouterPath.Company)
        }
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
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

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath)
              ? RouterPath.Admin + RouterPath.Company
              : routerPath,
          )
        }
      })
      .finally(() => {
        isInit(false)
      })
  }

  const formValidationValue: FormValidationValue = {
    name: {
      max: 50,
    },
    email: {
      max: 50,
      pattern: new RegExp(Pattern.Email),
    },
  }

  const formValidation: FormValidation = {
    email: [
      {
        type: ValidationType.Required,
        message:
          t('features.company.form.email') + t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.company.form.email') +
          t('common.validate.is') +
          String(formValidationValue.email.max) +
          t('common.validate.maxLength'),
      },
      {
        type: ValidationType.Pattern,
        message: t('common.validate.pattern.email'),
      },
    ],
    name: [
      {
        type: ValidationType.Required,
        message:
          t('features.company.header.name') + t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.company.header.name') +
          t('common.validate.is') +
          String(formValidationValue.name.max) +
          t('common.validate.maxLength'),
      },
    ],
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    if (processing.current) return
    processing.current = true

    if (!roles[Operation.AdminCompanyCreate]) {
      store.dispatch(
        changeSetting({
          errorMsg: [t(`common.api.header.403`)],
        } as SettingModel),
      )
      router.push(RouterPath.Admin + RouterPath.Company)
    }

    // API: 企業登録
    await CreateCompanyCSR({
      user_hash_key: user.hashKey,
      name: d.name.trim(),
      email: d.email.trim(),
    } as CreateCompanyRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [
              t(`features.company.index`) + t(`common.toast.create`),
              t(`features.company.representative`) + t(`common.toast.email`),
            ],
          } as SettingModel),
        )

        router.push(RouterPath.Admin + RouterPath.Company)
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg, code }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (code) {
          toast(t(`common.api.code.companyCreate.${String(code)}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })

          processing.current = false
          return
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })

          processing.current = false
          return
        }

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath)
              ? RouterPath.Admin + RouterPath.Company
              : routerPath,
          )
        }
      })
  }

  useEffect(() => {
    const initialize = async () => {
      if (isError) {
        router.push(RouterPath.Error)
        return
      }

      if (init) await inits()
    }

    initialize()
  }, [])

  return (
    <>
      <NextHead />
      <DialogContent sx={[DialogContentMain, w(90), mt(15)]}>
        <Box sx={[M0Auto, w(90)]}>
          <CssBaseline />
          <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            noValidate
            sx={ColumnMt4}
          >
            <FormLabel>{t('features.company.header.name') + '*'}</FormLabel>
            <TextField
              margin="normal"
              required
              style={w(100)}
              {...register('name', {
                required: true,
                maxLength: formValidationValue.name.max,
                setValueAs: (value) => _.trim(value),
              })}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            <ErrorHandler
              validations={formValidation.name}
              type={errors.name?.type}
            ></ErrorHandler>

            <FormLabel sx={mt(6)}>
              {t('features.company.form.email') + '*'}
            </FormLabel>
            <TextField
              margin="normal"
              required
              style={w(100)}
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

            <Box sx={FormButtons}>
              <Button
                tabIndex={-1}
                size="large"
                variant="outlined"
                color="inherit"
                sx={minW(180)}
                onClick={() => {
                  if (processing.current) return
                  processing.current = true

                  router.push(RouterPath.Admin + RouterPath.Company)
                }}
              >
                {t('common.button.cancel')}
              </Button>
              <Button
                size="large"
                type="submit"
                variant="contained"
                sx={[minW(180), ButtonColor(common.white, setting.color)]}
              >
                <AddCircleOutlineIcon sx={mr(0.25)} />
                {t('features.company.create')}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  let isError: boolean = false

  return {
    props: {
      isError,
      locale,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default CompanyCreate
