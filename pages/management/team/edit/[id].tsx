import {
  RolesRequest,
  GetTeamRequest,
  UpdateTeamRequest,
  SearchUserByCompanyRequest,
} from '@/api/model/request'
import {
  GetTeamResponse,
  SearchUserByCompanyResponse,
} from '@/api/model/response'
import {
  GetTeamCSR,
  RolesCSR,
  UpdateTeamCSR,
  SearchUserByCompanyCSR,
} from '@/api/repository'
import NextHead from '@/components/common/Header'
import { Operation } from '@/enum/common'
import { RouterPath } from '@/enum/router'
import { changeSetting } from '@/hooks/store'
import store, { RootState } from '@/hooks/store/store'
import { SelectTitlesModel, SettingModel } from '@/types/index'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { GetStaticPaths, GetServerSideProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { ValidationType } from '@/enum/validation'
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

type Props = {
  isError: boolean
  id: string
}

type Inputs = {
  name: string
}

const TeamEdit: FC<Props> = ({ isError, id }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [initUsers, setInitUsers] = useState<SearchUserByCompanyResponse[]>([])
  const [users, setUsers] = useState<SearchUserByCompanyResponse[]>([])
  const [selectedUsers, setSelectedUsers] = useState<
    SearchUserByCompanyResponse[]
  >([])
  const [team, setTeam] = useState<GetTeamResponse>(null)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [init, isInit] = useState<boolean>(true)
  const [loading, isLoading] = useState<boolean>(true)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      if (
        _.some([
          !res.data.map[Operation.ManagementTeamEdit],
          !res.data.map[Operation.ManagementTeamDetailRead],
        ])
      ) {
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

      // API: チーム取得
      const res3 = await GetTeamCSR({
        user_hash_key: user.hashKey,
        hash_key: decodeURIComponent(id),
      } as GetTeamRequest)

      setTeam({
        hashKey: res3.data.hash_key,
        name: res3.data.name,
        users: _.map(res3.data.users, (user) => {
          return {
            hashKey: user.hash_key,
            name: user.name,
            email: user.email,
          } as SearchUserByCompanyResponse
        }),
      } as GetTeamResponse)

      setValue('name', res3.data.name)

      setSelectedUsers(
        _.map(res3.data.users, (user) => {
          return {
            hashKey: user.hash_key,
            name: user.name,
            email: user.email,
          } as SearchUserByCompanyResponse
        }),
      )
      setInitUsers(
        _.filter(
          list,
          (item) =>
            !_.includes(
              _.map(res3.data.users, (user) => {
                return user.hash_key
              }),
              item.hashKey,
            ),
        ),
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
            ? RouterPath.Management + RouterPath.Team
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
            ? RouterPath.Management + RouterPath.Team
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>()

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    // API: チーム更新
    await UpdateTeamCSR({
      user_hash_key: user.hashKey,
      hash_key: team.hashKey,
      name: d.name,
      users: _.map(users, (u) => {
        return u.hashKey
      }),
    } as UpdateTeamRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [t(`features.team.index`) + t(`common.toast.edit`)],
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
              ? RouterPath.Management + RouterPath.Team
              : routerPath,
          )
        }
      })
  }

  const formInit = () => {
    setValue('name', team.name)
    setUsers([])
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
              <FormLabel>{t('features.team.header.name') + '*'}</FormLabel>
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
                  const list: SearchUserByCompanyResponse[] = []
                  for (const l of value) {
                    list.push({
                      hashKey: l.key,
                      name: l.title,
                      email: l.subTitle,
                    } as SearchUserByCompanyResponse)
                  }
                  setUsers(list)
                }}
              ></DropDownList>

              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.team.header.selectedUsers')}
              </FormLabel>
              <List>
                {_.map(selectedUsers, (user) => {
                  return <ListItem>{'・' + user.name}</ListItem>
                })}
              </List>

              <Box sx={[FormThreeButtons, mt(8)]}>
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
                >
                  <EditNoteIcon sx={mr(0.25)} />
                  {t('features.team.edit')}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      )}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // 空配列を返す。全てのパスは初回アクセス時に生成される。
    fallback: 'blocking',
  }
}

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
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

export default TeamEdit
