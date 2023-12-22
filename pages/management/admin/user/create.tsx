import NextHead from '@/components/Header'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useTranslations } from 'next-intl'
import {
  Box,
  Button,
  CssBaseline,
  DialogContent,
  TextField,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material'
import {
  FormBox,
  FormButtons,
  DialogContentMain,
  M0Auto,
  mr,
  w,
  mt,
  minW,
  ButtonColor,
} from '@/styles/index'
import ErrorHandler from '@/components/ErrorHandler'
import { common } from '@material-ui/core/colors'
import { RootState } from '@/hooks/store/store'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import _, { filter, keys, map, min, size, trim } from 'lodash'
import { Role, dispRole } from '@/enum/user'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { Pattern, ValidationType } from '@/enum/validation'
import { RouterPath } from '@/enum/router'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { UserCreateCSR, UserRoleListSSG } from '@/api/repository'
import { UserCreateRequest } from '@/api/model/management'
import UserCreateModal from '@/components/modal/UserCreateModal'
import { useEffect, useState } from 'react'
import { Contents } from '@/types/management'

const UserCreate = ({ roleList, isError }) => {
  const router = useRouter()
  const t = useTranslations()

  const [open, setOpen] = useState(false)
  const [userData, setUserData] = useState([])

  const setting = useSelector((state: RootState) => state.management.setting)

  useEffect(() => {
    if (isError) router.push(RouterPath.ManagementError)
  }, [])

  type Inputs = {
    name: string
    mail: string
    role: string
  }
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>()

  const formValidationValue: FormValidationValue = {
    name: {
      max: 30,
    },
    mail: {
      max: 50,
      pattern: new RegExp(Pattern.Mail),
    },
    role: {},
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
    name: [
      {
        type: ValidationType.Required,
        message:
          t('management.features.user.header.name') +
          t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('management.features.user.header.name') +
          t('common.validate.is') +
          String(formValidationValue.name.min) +
          t('common.validate.minLength') +
          String(formValidationValue.name.max) +
          t('common.validate.maxLength'),
      },
    ],
    role: [
      {
        type: ValidationType.Required,
        message:
          t('management.features.user.header.role') +
          t('common.validate.requiredRadio'),
      },
    ],
  }

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    await UserCreateCSR({
      name: d.name,
      email: d.mail,
      role_id: Number(d.role),
    } as UserCreateRequest)
      .then((res) => {
        // モーダルへ
        setUserData([
          {
            key: t('management.features.user.header.mail'),
            element: <>{res.data.email}</>,
          },
          {
            key: t('management.features.user.header.password'),
            element: <>{res.data.init_password}</>,
          },
        ] as Contents[])
        setOpen(true)
        toast(t('management.features.user.user') + t('common.toast.create'), {
          style: {
            backgroundColor: setting.toastSuccessColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })
      })
      .catch(() => {
        router.push(RouterPath.ManagementError)
      })
  }

  return (
    <>
      <NextHead></NextHead>
      <DialogContent sx={[DialogContentMain, mt(15)]}>
        <Box sx={[M0Auto, w(90)]}>
          <CssBaseline />
          <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            noValidate
            sx={FormBox}
          >
            <FormLabel>
              {t('management.features.user.header.name') + '*'}
            </FormLabel>
            <TextField
              margin="normal"
              required
              style={w(100)}
              {...register('name', {
                required: true,
                maxLength: formValidationValue.name.max,
                setValueAs: (value) => trim(value),
              })}
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            <ErrorHandler
              validations={formValidation.name}
              type={errors.name?.type}
            ></ErrorHandler>

            <FormLabel sx={mt(6)}>
              {t('management.features.user.header.mail') + '*'}
            </FormLabel>
            <TextField
              margin="normal"
              required
              style={w(100)}
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
            <FormLabel sx={mt(6)}>
              {t('management.features.user.header.role') + '*'}
            </FormLabel>
            <RadioGroup
              aria-invalid={errors.role ? 'true' : 'false'}
              row
              aria-label="position"
              name="role"
              value={watch('role') || ''}
              className="form-radio"
              style={w(100)}
            >
              {map(roleList, (item) => {
                return (
                  <FormControlLabel
                    key={item.id}
                    color={setting.color}
                    value={item.id}
                    control={
                      <Radio
                        {...register('role', {
                          required: true,
                        })}
                        style={{ color: setting.color }}
                        value={item.id}
                      />
                    }
                    label={t(dispRole(Number(item.id)))}
                  />
                )
              })}
            </RadioGroup>
            <ErrorHandler
              validations={formValidation.role}
              type={errors.role?.type}
            ></ErrorHandler>
            <Box sx={FormButtons}>
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                sx={minW(180)}
                onClick={() => router.push(RouterPath.ManagementUser)}
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
                {t('management.features.user.create')}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <UserCreateModal
        open={open}
        data={userData}
        closeModal={() => router.push(RouterPath.ManagementUser)}
      ></UserCreateModal>
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  let isError = false
  const roleList = []
  await UserRoleListSSG()
    .then((res) => {
      for (const r of res.data.roles) {
        roleList.push({
          id: r.id,
          name: r[`name_${locale}`],
        })
      }
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      roleList,
      isError,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default UserCreate
