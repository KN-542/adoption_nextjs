import {
  RolesRequest,
  GetManuscriptRequest,
  SearchTeamByCompanyRequest,
  UpdateManuscriptRequest,
} from '@/api/model/request'
import {
  SearchTeamByCompanyResponse,
  GetManuscriptResponse,
  SiteListResponse,
} from '@/api/model/response'
import {
  RolesCSR,
  GetManuscriptCSR,
  SearchTeamByCompanyCSR,
  ApplicantSitesCSR,
  UpdateManuscriptCSR,
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
import { LITTLE_DURING } from '@/hooks/common'

type Props = {
  isError: boolean
  id: string
}

type Inputs = {
  content: string
}

const ManuscriptEdit: FC<Props> = ({ isError, id }) => {
  const router = useRouter()
  const t = useTranslations()

  // store
  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  // 原稿
  const [manuscript, setManuscript] = useState<GetManuscriptResponse>(null)

  // チーム
  const [initTeams, setInitTeams] = useState<SearchTeamByCompanyResponse[]>([])
  const [teams, setTeams] = useState<SearchTeamByCompanyResponse[]>([])
  const [selectedTeams, setSelectedTeams] = useState<
    SearchTeamByCompanyResponse[]
  >([])

  // サイト
  const [initSites, setInitSites] = useState<SelectTitlesModel[]>([])
  const [sites, setSites] = useState<SelectTitlesModel[]>([])
  const [selectedSites, setSelectedSites] = useState<SelectTitlesModel[]>([])

  // ロールチェック
  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})

  // 状態
  const [init, isInit] = useState<boolean>(true)
  const [loading, isLoading] = useState<boolean>(true)
  const processing = useRef<boolean>(false)

  // 初期化処理定義
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

      // API サイト一覧
      const list2: SelectTitlesModel[] = []
      const res3 = await ApplicantSitesCSR()
      _.forEach(res3.data.list, (item) => {
        list2.push({
          key: item.hash_key,
          title: item.site_name,
          subTitle: '',
        } as SelectTitlesModel)
      })
      setInitSites(list2)

      // API: 原稿取得
      const res4 = await GetManuscriptCSR({
        user_hash_key: user.hashKey,
        hash_key: decodeURIComponent(id),
      } as GetManuscriptRequest)

      setManuscript({
        hashKey: res4.data.hash_key,
        content: res4.data.content,
        sites: _.map(res4.data.sites, (site) => {
          return {
            hashKey: site.hash_key,
            name: site.site_name,
          } as SiteListResponse
        }),
        teams: _.map(res4.data.teams, (team) => {
          return {
            hashKey: team.hash_key,
            name: team.name,
            sub: team.sub,
          } as SearchTeamByCompanyResponse
        }),
      } as GetManuscriptResponse)

      // 表示初期値
      setValue('content', res4.data.content)

      // 設定済みのサイト
      setSelectedSites(
        _.map(res4.data.sites, (site) => {
          return {
            key: site.hash_key,
            title: site.site_name,
            subTitle: '',
          } as SelectTitlesModel
        }),
      )
      // 選択可能なサイト
      setInitSites(
        _.filter(
          list2,
          (item) =>
            !_.includes(
              _.map(res4.data.sites, (site) => {
                return site.hash_key
              }),
              item.key,
            ),
        ),
      )

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
            ? RouterPath.Management + RouterPath.Manuscript
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
            ? RouterPath.Management + RouterPath.Manuscript
            : routerPath,
        )
      }
    } finally {
      isInit(false)
    }
  }

  // バリデーション
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

    // API: 原稿更新
    await UpdateManuscriptCSR({
      user_hash_key: user.hashKey,
      hash_key: manuscript.hashKey,
      content: d.content,
      sites: _.map(sites, (s) => s.key),
      teams: _.map(teams, (t) => t.hashKey),
    } as UpdateManuscriptRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [
              t(`features.manuscript.index`) + t(`common.toast.edit`),
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
          toast(t(`common.api.code.manuscriptUpdate.${code}`), {
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
              ? RouterPath.Management + RouterPath.Manuscript
              : routerPath,
          )
        }
      })
      .finally(() => {
        processing.current = false
      })
  }

  const formInit = () => {
    setValue('content', manuscript.content)
    setTeams([])
    setSites([])
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
              {/* 内容 */}
              <FormLabel>
                {t('features.manuscript.header.content') + '*'}
              </FormLabel>
              <TextField
                value={watch('content')}
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

              {/* 使用可能チーム */}
              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.manuscript.header.team')}
              </FormLabel>
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

              {/* 使用可能サイト */}
              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.manuscript.header.site')}
              </FormLabel>
              <DropDownList
                list={_.map(sites, (r) => {
                  return {
                    key: r.key,
                    title: r.title,
                    subTitle: '',
                  } as SelectTitlesModel
                })}
                initList={_.map(initSites, (r) => {
                  return {
                    key: r.key,
                    title: r.title,
                    subTitle: '',
                  } as SelectTitlesModel
                })}
                sx={[w(50)]}
                onChange={(value) => {
                  const list: SelectTitlesModel[] = _.map(value, (v) => {
                    return {
                      key: v.key,
                      title: v.title,
                      subTitle: '',
                    } as SelectTitlesModel
                  })
                  setSites(list)
                }}
              ></DropDownList>

              {/* 設定済みのチーム */}
              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.manuscript.header.seletedTeams')}
              </FormLabel>
              <List>
                {_.map(selectedTeams, (team, i) => {
                  return <ListItem key={i}>{'・' + team.name}</ListItem>
                })}
              </List>

              {/* 設定済みのサイト */}
              <FormLabel sx={[mt(6), mb(1.5)]}>
                {t('features.manuscript.header.selectedSites')}
              </FormLabel>
              <List>
                {_.map(selectedSites, (role, i) => {
                  return <ListItem key={i}>{'・' + role.title}</ListItem>
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
                    router.push(RouterPath.Management + RouterPath.Manuscript)
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
                  {t('features.manuscript.edit')}
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

export default ManuscriptEdit
