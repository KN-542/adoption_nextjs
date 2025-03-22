import {
  RolesRequest,
  GetUserRequest,
  SearchRoleByCompanyRequest,
  SearchTeamByCompanyRequest,
  UpdateUserRequest,
} from '@/api/model/request'
import {
  GetUserResponse,
  SearchTeamByCompanyResponse,
  SearchRoleByCompanyResponse,
} from '@/api/model/response'
import {
  GetUserCSR,
  RolesCSR,
  SearchRoleByCompanyCSR,
  SearchTeamByCompanyCSR,
  UpdateUserCSR,
} from '@/api/repository'
import NextHead from '@/components/common/Header'
import { Operation } from '@/enum/common'
import { RouterPath } from '@/enum/router'
import { changeSetting } from '@/hooks/store'
import store, { RootState } from '@/hooks/store/store'
import { SelectTitlesModel, SettingModel } from '@/types/index'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { GetServerSideProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { Pattern, ValidationType } from '@/enum/validation'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  Box,
  Button,
  CssBaseline,
  DialogContent,
  FormLabel,
  List,
  ListItem,
  TextField,
} from '@mui/material'
import {
  ButtonColor,
  ColumnMt4,
  DialogContentMain,
  FormThreeButtons,
  M0Auto,
  mb,
  minW,
  mr,
  mt,
  w,
} from '@/styles/index'
import ErrorHandler from '@/components/common/ErrorHandler'
import DropDownList from '@/components/common/DropDownList'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { LITTLE_DURING } from '@/hooks/common'

type Props = {
  isError: boolean
  id: string
}

type Inputs = {
  name: string
  email: string
}

const UserEdit: FC<Props> = ({ isError, id }) => {
  const router = useRouter()
  const t = useTranslations()

  // store
  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  // チーム
  const [initTeams, setInitTeams] = useState<SearchTeamByCompanyResponse[]>([])
  const [teams, setTeams] = useState<SearchTeamByCompanyResponse[]>([])
  const [selectedTeams, setSelectedTeams] = useState<
    SearchTeamByCompanyResponse[]
  >([])

  // ロール
  const [initRolesModel, setInitRolesModel] = useState<
    SearchRoleByCompanyResponse[]
  >([])
  const [rolesModel, setRolesModel] = useState<SearchRoleByCompanyResponse[]>(
    [],
  )
  const [selectedRoles, setSelectedRoles] = useState<
    SearchRoleByCompanyResponse[]
  >([])

  // ロールチェック
  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})

  // ユーザー
  const [users, setUsers] = useState<GetUserResponse>(null)

  // 状態
  const [init, isInit] = useState<boolean>(true)
  const [loading, isLoading] = useState<boolean>(true)
  const processing = useRef<boolean>(false)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      if (
        _.some([
          !res.data.map[Operation.ManagementUserEdit],
          !res.data.map[Operation.ManagementUserDetailRead],
        ])
      ) {
        store.dispatch(
          changeSetting({
            errorMsg: [t(`common.api.header.403`)],
          } as SettingModel),
        )
        router.push(RouterPath.Management + RouterPath.Team)
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
          sub: u.sub,
        } as SearchTeamByCompanyResponse)
      })

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

      // API: ユーザー取得
      const res4 = await GetUserCSR({
        user_hash_key: user.hashKey,
        hash_key: decodeURIComponent(id),
      } as GetUserRequest)

      setUsers({
        hashKey: res4.data.hash_key,
        name: res4.data.name,
        email: res4.data.email,
        teams: _.map(res4.data.teams, (team) => {
          return {
            hashKey: team.hash_key,
            name: team.name,
            sub: team.sub,
          } as SearchTeamByCompanyResponse
        }),
      } as GetUserResponse)

      // 表示初期値
      setValue('name', res4.data.name)
      setValue('email', res4.data.email)

      // 所属済みのチーム
      setSelectedTeams(
        _.map(res4.data.teams, (team) => {
          return {
            hashKey: team.hash_key,
            name: team.name,
            sub: team.sub,
          } as SearchTeamByCompanyResponse
        }),
      )
      // 選択可能なチーム
      setInitTeams(
        _.filter(
          list,
          (item) =>
            !_.includes(
              _.map(res4.data.teams, (team) => {
                return team.hash_key
              }),
              item.hashKey,
            ),
        ),
      )

      // 現在のロール
      setSelectedRoles([
        {
          hashKey: res4.data.Role.hash_key,
          name: res4.data.Role.name,
        } as SearchRoleByCompanyResponse,
      ])

      // 選択可能なロール （現在のロールを除く）
      setInitRolesModel(
        _.filter(list2, (item) => res4.data.Role.hash_key !== item.hashKey),
      )
    } catch ({ isServerError, routerPath, toastMsg, storeMsg }) {
      if (isServerError) {
        router.push(routerPath)
        return
      }

      if (!_.isEmpty(toastMsg)) {
        const msg = t(toastMsg)
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
    } finally {
      isInit(false)
    }
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>()

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    if (processing.current) return
    processing.current = true

    // API: ユーザー更新
    await UpdateUserCSR({
      user_hash_key: user.hashKey,
      hash_key: decodeURIComponent(id),
      name: d.name,
      email: d.email,
      teams: _.map(teams, (t) => t.hashKey),
    } as UpdateUserRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [t(`features.user.index`) + t(`common.toast.edit`)],
          } as SettingModel),
        )
        router.push(RouterPath.Management + RouterPath.User)
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg, code }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (code) {
          toast(t(`common.api.code.userUpdate.${code}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })

          setTimeout(() => {
            processing.current = false
          }, LITTLE_DURING)
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

          setTimeout(() => {
            processing.current = false
          }, LITTLE_DURING)
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
      })
      .finally(() => {
        processing.current = false
      })
  }

  const formInit = () => {
    setValue('name', users.name)
    setValue('email', users.email)
    setTeams([])
    setRolesModel([])
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
        isLoading(false)
      }
    }
    initialize()
  }, [])

  return (
    <>
      {/* ヘッダー */}
      <NextHead />
      {_.every([
        !init,
        !loading,
        roles[Operation.ManagementTeamEdit],
        roles[Operation.ManagementTeamDetailRead],
      ]) && (
        <DialogContent sx={[DialogContentMain, w(90), mt(15)]}>
          <Box sx={[M0Auto, w(90)]}>
            <CssBaseline />
            <Box
              component="form"
              onSubmit={handleSubmit(submit)}
              noValidate
              sx={ColumnMt4}
            >
              {/* ユーザー名 */}
              <FormLabel>{t('features.user.header.name') + '*'}</FormLabel>
              <TextField
                value={watch('name')}
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

              {/* メールアドレス */}
              <FormLabel>{t('features.user.header.email') + '*'}</FormLabel>
              <TextField
                value={watch('email')}
                margin="normal"
                required
                style={w(100)}
                {...register('email', {
                  required: true,
                  maxLength: formValidationValue.email.max,
                  setValueAs: (value) => _.trim(value),
                })}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              <ErrorHandler
                validations={formValidation.email}
                type={errors.email?.type}
              ></ErrorHandler>

              {/* 所属チーム */}
              <FormLabel>{t('features.user.header.team')}</FormLabel>
              <DropDownList
                list={_.map(teams, (team) => {
                  return {
                    key: team.hashKey,
                    title: team.name,
                    subTitle: team.sub,
                  } as SelectTitlesModel
                })}
                initList={_.map(initTeams, (team) => {
                  return {
                    key: team.hashKey,
                    title: team.name,
                    subTitle: team.sub,
                  } as SelectTitlesModel
                })}
                sx={[w(50)]}
                onChange={(value) => {
                  const list: SearchTeamByCompanyResponse[] = []
                  for (const l of value) {
                    list.push({
                      hashKey: l.key,
                      name: l.title,
                      sub: l.subTitle,
                    } as SearchTeamByCompanyResponse)
                  }
                  setTeams(list)
                }}
              ></DropDownList>

              {/* ロール */}
              <FormLabel>{t('features.user.header.role')}</FormLabel>
              <DropDownList
                list={_.map(rolesModel, (r) => {
                  return {
                    key: r.hashKey,
                    title: r.name,
                    subTitle: '',
                  } as SelectTitlesModel
                })}
                initList={_.map(initRolesModel, (r) => {
                  return {
                    key: r.hashKey,
                    title: r.name,
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

              {/* 所属済みチーム */}
              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.user.header.selectedTeams')}
              </FormLabel>
              <List>
                {_.map(selectedTeams, (team, i) => {
                  return <ListItem key={i}>{'・' + team.name}</ListItem>
                })}
              </List>

              {/* 所属済みロール */}
              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.user.header.selectedRoles')}
              </FormLabel>
              <List>
                {_.map(selectedRoles, (role, i) => {
                  return <ListItem key={i}>{'・' + role.name}</ListItem>
                })}
              </List>

              {/* ボタン */}
              <Box sx={[FormThreeButtons, mt(8)]}>
                <Button
                  tabIndex={-1}
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
                  tabIndex={-1}
                  size="large"
                  variant="outlined"
                  color="inherit"
                  sx={[
                    minW(180),
                    ButtonColor(common.white, setting.toastErrorColor),
                  ]}
                  onClick={formInit}
                >
                  {t('common.button.init')}
                </Button>
                <Button
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={[minW(180), ButtonColor(common.white, setting.color)]}
                  onClick={handleSubmit(submit)}
                >
                  <EditNoteIcon sx={mr(0.25)} />
                  {t('features.user.edit')}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  locale,
}) => {
  let isError: boolean = false

  return {
    props: {
      isError,
      locale,
      id: params?.id,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default UserEdit
