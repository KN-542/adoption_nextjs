import NextHead from '@/components/common/Header'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useTranslations } from 'next-intl'
import {
  Box,
  Button,
  CssBaseline,
  TextField,
  FormLabel,
  Dialog,
  DialogTitle,
  Typography,
  DialogContent,
  Divider,
  DialogActions,
} from '@mui/material'
import {
  ColumnMt4,
  FormButtons,
  DialogContentMain,
  M0Auto,
  mr,
  w,
  mt,
  minW,
  ButtonColor,
  Bold,
  ColorRed,
  mb,
} from '@/styles/index'
import ErrorHandler from '@/components/common/ErrorHandler'
import { common } from '@material-ui/core/colors'
import store, { RootState } from '@/hooks/store/store'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import _ from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { Pattern, ValidationType } from '@/enum/validation'
import { RouterPath } from '@/enum/router'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import {
  RolesCSR,
  CreateUserCSR,
  SearchRoleByCompanyCSR,
  SearchTeamByCompanyCSR,
} from '@/api/repository'
import {
  CreateUserRequest,
  RolesRequest,
  SearchRoleByCompanyRequest,
  SearchTeamByCompanyRequest,
} from '@/api/model/request'
import { FC, useEffect, useState } from 'react'
import { Contents, SelectTitlesModel, SettingModel } from '@/types/index'
import Content from '@/components/common/Content'
import { GetServerSideProps } from 'next'
import { Operation } from '@/enum/common'
import { changeSetting } from '@/hooks/store'
import {
  SearchRoleByCompanyResponse,
  SearchTeamByCompanyResponse,
} from '@/api/model/response'
import DropDownList from '@/components/common/DropDownList'

type Props = {
  isError: boolean
  locale: string
}

type Inputs = {
  name: string
  email: string
}

const UserCreate: FC<Props> = ({ isError, locale: _locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [open, isOpen] = useState(false)
  const [userData, setUserData] = useState<Contents[]>([])

  const [initTeams, setInitTeams] = useState<SearchTeamByCompanyResponse[]>([])
  const [teams, setTeams] = useState<SearchTeamByCompanyResponse[]>([])

  const [initRoles, setInitRoles] = useState<SearchRoleByCompanyResponse[]>([])
  const [rolesModel, setRolesModel] = useState<SearchRoleByCompanyResponse[]>(
    [],
  )

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [init, isInit] = useState<boolean>(true)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      if (!res.data.map[Operation.ManagementUserCreate]) {
        store.dispatch(
          changeSetting({
            errorMsg: [t(`common.api.header.403`)],
          } as SettingModel),
        )
        router.push(RouterPath.Management + RouterPath.User)
      }

      // API: チーム検索_同一企業
      const res2 = await SearchTeamByCompanyCSR({
        hash_key: user.hashKey,
      } as SearchTeamByCompanyRequest)

      const list: SearchTeamByCompanyResponse[] = []
      _.forEach(res2.data.list, (u) => {
        list.push({
          hashKey: u.hash_key,
          name: u.name,
          sub: '',
        } as SearchTeamByCompanyResponse)
      })
      setInitTeams(list)

      // API: ロール検索_同一企業
      const res3 = await SearchRoleByCompanyCSR({
        user_hash_key: user.hashKey,
      } as SearchRoleByCompanyRequest)

      const list2: SearchRoleByCompanyResponse[] = []
      _.forEach(res3.data.list, (u) => {
        list2.push({
          hashKey: u.hash_key,
          name: u.name,
        } as SearchRoleByCompanyResponse)
      })
      setInitRoles(list2)
    } catch ({ isServerError, routerPath, toastMsg, storeMsg }) {
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
            ? RouterPath.Management + RouterPath.User
            : routerPath,
        )
      }
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>()

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
    name: [
      {
        type: ValidationType.Required,
        message: t('features.user.header.name') + t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.user.header.name') +
          t('common.validate.is') +
          String(formValidationValue.name.min) +
          t('common.validate.minLength') +
          String(formValidationValue.name.max) +
          t('common.validate.maxLength'),
      },
    ],
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
  }

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    if (_.isEmpty(teams)) {
      toast(
        t('features.user.header.team') + t('common.validate.requiredList'),
        {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        },
      )
      return
    }
    if (_.isEmpty(rolesModel)) {
      toast(
        t('features.user.header.role') + t('common.validate.requiredList'),
        {
          style: {
            backgroundColor: setting.toastErrorColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        },
      )
      return
    }

    // API: ユーザー登録
    await CreateUserCSR({
      hash_key: user.hashKey,
      name: d.name,
      email: d.email,
      teams: _.map(teams, (t) => {
        return t.hashKey
      }),
      role_hash_key: rolesModel[0].hashKey,
    } as CreateUserRequest)
      .then((res) => {
        // モーダルへ
        setUserData([
          {
            key: t('features.user.header.email'),
            element: res.data.email,
            mask: {
              disp: false,
              show: false,
            },
          },
          {
            key: t('features.user.header.password'),
            element: res.data.init_password,
            mask: {
              disp: true,
              show: false,
            },
          },
        ] as Contents[])

        isOpen(true)

        toast(t('features.user.index') + t('common.toast.create'), {
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
      .catch(({ isServerError, routerPath, toastMsg, storeMsg, code }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (code) {
          toast(t('common.api.code.createUserDupl'), {
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
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        if (isError) {
          router.push(RouterPath.Error)
          return
        }

        if (init) await inits()
      } finally {
        isInit(false)
      }
    }

    initialize()
  }, [])

  return (
    <>
      <NextHead />
      {_.every([!init, roles[Operation.ManagementUserCreate]]) && (
        <DialogContent sx={[DialogContentMain, w(90), mt(15)]}>
          <Box sx={[M0Auto, w(90)]}>
            <CssBaseline />
            <Box
              component="form"
              onSubmit={handleSubmit(submit)}
              noValidate
              sx={ColumnMt4}
            >
              <FormLabel>{t('features.user.header.name') + '*'}</FormLabel>
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
                {t('features.user.header.email') + '*'}
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

              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.user.header.team') + '*'}
              </FormLabel>

              <DropDownList
                list={_.map(teams, (u) => {
                  return {
                    key: u.hashKey,
                    title: u.name,
                    subTitle: '',
                  } as SelectTitlesModel
                })}
                initList={_.map(initTeams, (u) => {
                  return {
                    key: u.hashKey,
                    title: u.name,
                    subTitle: '',
                  } as SelectTitlesModel
                })}
                sx={[w(50)]}
                onChange={(value) => {
                  setTeams(
                    _.map(value, (v) => {
                      return {
                        hashKey: v.key,
                        name: v.title,
                        sub: '',
                      } as SearchTeamByCompanyResponse
                    }),
                  )
                }}
              ></DropDownList>

              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.user.header.role') + '*'}
              </FormLabel>
              <DropDownList
                list={_.map(rolesModel, (u) => {
                  return {
                    key: u.hashKey,
                    title: u.name,
                    subTitle: '',
                  } as SelectTitlesModel
                })}
                initList={_.map(initRoles, (u) => {
                  return {
                    key: u.hashKey,
                    title: u.name,
                    subTitle: '',
                  } as SelectTitlesModel
                })}
                sx={[w(50)]}
                onChange={(value) => {
                  if (_.size(value) > 1) return
                  setRolesModel(
                    _.map(value, (v) => {
                      return {
                        hashKey: v.key,
                        name: v.title,
                        sub: '',
                      } as SearchRoleByCompanyResponse
                    }),
                  )
                }}
              ></DropDownList>

              <Box sx={FormButtons}>
                <Button
                  size="large"
                  variant="outlined"
                  color="inherit"
                  sx={minW(180)}
                  onClick={() =>
                    router.push(RouterPath.Management + RouterPath.User)
                  }
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
                  {t('features.user.create')}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      )}

      {open && (
        <Dialog open={open} fullWidth maxWidth="xl">
          <DialogTitle component="div">
            <Typography variant="h4" sx={Bold}>
              {t('common.title.modal.createUser')}
            </Typography>
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Typography variant="h6">{t('features.user.createMsg')}</Typography>
            <Typography variant="h6">
              {t('features.user.createMsg2')}
            </Typography>
            <Typography variant="h6">
              {
                '※TODO メール送信での通知およびCSVダウンロードを作成する想定です。'
              }
            </Typography>
            <Typography variant="h6" sx={[mt(4), ColorRed]}>
              {t('features.user.createMsg3')}
            </Typography>
            <Content data={userData} mt={5}></Content>
          </DialogContent>

          <Divider sx={mb(2)} />

          <DialogActions sx={[mr(2), mb(2)]}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() =>
                router.push(RouterPath.Management + RouterPath.User)
              }
            >
              {t('features.user.backList')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
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

export default UserCreate
