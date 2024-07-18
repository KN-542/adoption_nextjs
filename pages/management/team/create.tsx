import {
  RolesRequest,
  CreateTeamRequest,
  SearchUserByCompanyRequest,
} from '@/api/model/request'
import {
  CreateTeamCSR,
  RolesCSR,
  SearchUserByCompanyCSR,
} from '@/api/repository'
import { Operation } from '@/enum/common'
import { RouterPath } from '@/enum/router'
import { changeSetting } from '@/hooks/store'
import store, { RootState } from '@/hooks/store/store'
import { SelectTitlesModel, SettingModel } from '@/types/index'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { ValidationType } from '@/enum/validation'
import { SubmitHandler, useForm } from 'react-hook-form'
import NextHead from '@/components/common/Header'
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
  mb,
  minW,
  mr,
  mt,
  w,
} from '@/styles/index'
import ErrorHandler from '@/components/common/ErrorHandler'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { SearchUserByCompanyResponse } from '@/api/model/response'
import DropDownList from '@/components/common/DropDownList'
import { GetStaticProps } from 'next'

type Props = {
  isError: boolean
  locale: string
}

type Inputs = {
  name: string
}

const TeamCreate: FC<Props> = ({ isError, locale: _locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [initUsers, setInitUsers] = useState<SearchUserByCompanyResponse[]>([])
  const [users, setUsers] = useState<SearchUserByCompanyResponse[]>([])

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [init, isInit] = useState<boolean>(true)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      if (!res.data.map[Operation.ManagementTeamCreate]) {
        store.dispatch(
          changeSetting({
            errorMsg: [t(`common.api.header.403`)],
          } as SettingModel),
        )
        router.push(RouterPath.Management + RouterPath.Team)
      }

      // API: ユーザー検索_同一企業
      const res2 = await SearchUserByCompanyCSR({
        hash_key: user.hashKey,
      } as SearchUserByCompanyRequest)

      const list: SearchUserByCompanyResponse[] = []
      _.forEach(res2.data.list, (u) => {
        list.push({
          hashKey: u.hash_key,
          name: u.name,
          email: u.email,
        } as SearchUserByCompanyResponse)
      })
      setInitUsers(list)
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
            ? RouterPath.Management + RouterPath.Team
            : routerPath,
        )
      }
    }
  }

  const formValidationValue: FormValidationValue = {
    name: {
      max: 50,
    },
  }

  const formValidation: FormValidation = {
    name: [
      {
        type: ValidationType.Required,
        message: t('features.team.header.name') + t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.team.header.name') +
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
    if (_.isEmpty(users)) {
      toast(
        t('features.team.header.users') + t('common.validate.requiredList'),
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

    // API: チーム登録
    await CreateTeamCSR({
      user_hash_key: user.hashKey,
      name: d.name,
      users: _.map(users, (u) => {
        return u.hashKey
      }),
    } as CreateTeamRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [t(`features.team.index`) + t(`common.toast.create`)],
          } as SettingModel),
        )

        router.push(RouterPath.Management + RouterPath.Team)
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
      {_.every([!init, roles[Operation.ManagementTeamCreate]]) && (
        <DialogContent sx={[DialogContentMain, w(90), mt(15)]}>
          <Box sx={[M0Auto, w(90)]}>
            <CssBaseline />
            <Box
              component="form"
              onSubmit={handleSubmit(submit)}
              noValidate
              sx={ColumnMt4}
            >
              <FormLabel>{t('features.team.header.name') + '*'}</FormLabel>
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

              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.team.header.users') + '*'}
              </FormLabel>
              <DropDownList
                list={_.map(users, (u) => {
                  return {
                    key: u.hashKey,
                    title: u.name,
                    subTitle: u.email,
                  } as SelectTitlesModel
                })}
                initList={_.map(initUsers, (u) => {
                  return {
                    key: u.hashKey,
                    title: u.name,
                    subTitle: u.email,
                  } as SelectTitlesModel
                })}
                sx={[w(50)]}
                onChange={(value) => {
                  setUsers(
                    _.map(value, (v) => {
                      return {
                        hashKey: v.key,
                        name: v.title,
                        email: v.subTitle,
                      } as SearchUserByCompanyResponse
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
                    router.push(RouterPath.Management + RouterPath.Team)
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
                  {t('features.team.create')}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      )}
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
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

export default TeamCreate
