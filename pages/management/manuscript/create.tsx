import {
  CreateManuscriptRequest,
  RolesRequest,
  SearchTeamByCompanyRequest,
} from '@/api/model/request'
import { SearchTeamByCompanyResponse } from '@/api/model/response'
import {
  ApplicantSitesSSG,
  CreateManuscriptCSR,
  RolesCSR,
  SearchTeamByCompanyCSR,
} from '@/api/repository'
import { Operation } from '@/enum/common'
import { RouterPath } from '@/enum/router'
import { changeSetting } from '@/hooks/store'
import store, { RootState } from '@/hooks/store/store'
import { SelectTitlesModel, SettingModel } from '@/types/index'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { GetStaticProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
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
import { FormValidation } from '@/hooks/validation'
import { ValidationType } from '@/enum/validation'
import DropDownList from '@/components/common/DropDownList'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

type Props = {
  isError: boolean
  locale: string
  sitesSSG: SelectTitlesModel[]
}

type Inputs = {
  content: string
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let isError: boolean = false

  // API サイト一覧
  const sites: SelectTitlesModel[] = []
  await ApplicantSitesSSG()
    .then((res) => {
      _.forEach(res.data.list, (item) => {
        sites.push({
          key: item.hash_key,
          title: item.site_name,
          subTitle: '',
        } as SelectTitlesModel)
      })
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      isError,
      locale,
      sitesSSG: sites,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

const ManuscriptCreate: FC<Props> = ({
  isError,
  locale: _locale,
  sitesSSG,
}) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [init, isInit] = useState<boolean>(true)

  const [initTeams, setInitTeams] = useState<SearchTeamByCompanyResponse[]>([])
  const [teams, setTeams] = useState<SearchTeamByCompanyResponse[]>([])
  const [initSites, setInitSites] = useState<SelectTitlesModel[]>(sitesSSG)
  const [sites, setSites] = useState<SelectTitlesModel[]>([])

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
        router.push(RouterPath.Management + RouterPath.Manuscript)
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
            ? RouterPath.Management + RouterPath.Manuscript
            : routerPath,
        )
      }
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const formValidation: FormValidation = {
    content: [
      {
        type: ValidationType.Required,
        message:
          t('features.manuscript.header.content') +
          t('common.validate.required'),
      },
    ],
  }

  const submit: SubmitHandler<Inputs> = async (d: Inputs) => {
    if (_.isEmpty(teams)) {
      toast(
        t('features.manuscript.header.team') +
          t('common.validate.requiredList'),
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
    if (_.isEmpty(sites)) {
      toast(
        t('features.manuscript.header.site') +
          t('common.validate.requiredList'),
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

    // API: 原稿登録
    await CreateManuscriptCSR({
      user_hash_key: user.hashKey,
      // 内容
      content: d.content,
      // 使用可能チーム
      teams: _.map(teams, (t) => {
        return t.hashKey
      }),
      // 使用可能サイト
      sites: _.map(sites, (s) => {
        return s.key
      }),
    } as CreateManuscriptRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [
              t(`features.manuscript.index`) + t(`common.toast.create`),
            ],
          } as SettingModel),
        )

        router.push(RouterPath.Management + RouterPath.Manuscript)
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg, code }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (code) {
          toast(t('common.api.code.createManuscriptDupl'), {
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
      {_.every([!init, roles[Operation.ManagementManuscriptCreate]]) && (
        <DialogContent sx={[DialogContentMain, w(90), mt(15)]}>
          <Box sx={[M0Auto, w(90)]}>
            <CssBaseline />
            <Box
              component="form"
              onSubmit={handleSubmit(submit)}
              noValidate
              sx={ColumnMt4}
            >
              <FormLabel>
                {t('features.manuscript.header.content') + '*'}
              </FormLabel>
              <TextField
                margin="normal"
                required
                style={w(100)}
                {...register('content', {
                  required: true,
                  setValueAs: (value) => _.trim(value),
                })}
                aria-invalid={errors.content ? 'true' : 'false'}
              />
              <ErrorHandler
                validations={formValidation.content}
                type={errors.content?.type}
              ></ErrorHandler>

              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.manuscript.header.team') + '*'}
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
                        sub: v.subTitle,
                      } as SearchTeamByCompanyResponse
                    }),
                  )
                }}
              ></DropDownList>

              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.manuscript.header.site') + '*'}
              </FormLabel>
              <DropDownList
                list={sites}
                initList={initSites}
                sx={[w(50)]}
                onChange={(value) => setSites(value)}
              ></DropDownList>

              <Box sx={FormButtons}>
                <Button
                  size="large"
                  variant="outlined"
                  color="inherit"
                  sx={minW(180)}
                  onClick={() =>
                    router.push(RouterPath.Management + RouterPath.Manuscript)
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
                  {t('features.manuscript.create')}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      )}
    </>
  )
}

export default ManuscriptCreate
