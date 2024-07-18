import NextHead from '@/components/common/Header'
import {
  M0Auto,
  minW,
  mt,
  w,
  DialogContentSetting,
  ml,
  SpaceBetween,
  ColorRed,
  Bold,
  ColumnMt4,
  Padding,
  MenuDisp,
  mb,
  maxW,
  ButtonColor,
  mr,
} from '@/styles/index'
import {
  Box,
  Button,
  DialogContent,
  FormLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import _ from 'lodash'
import { GetStaticProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import SettingMenu from '@/components/common/SettingMenu'
import store, { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import {
  ApplicantStatusListResponse,
  ListStatusEventResponse,
} from '@/api/model/response'
import { ApplicantStatusListRequest, RolesRequest } from '@/api/model/request'
import {
  ApplicantStatusListCSR,
  ListStatusEventSSG,
  RolesCSR,
} from '@/api/repository'
import { HttpStatusCode } from 'axios'
import { toast } from 'react-toastify'
import { common } from '@mui/material/colors'
import { changeSetting } from '@/hooks/store'
import { SettingModel } from '@/types/index'
import { RouterPath } from '@/enum/router'
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import { Operation } from '@/enum/common'

type Props = {
  isError: boolean
  eventsSSG: ListStatusEventResponse[]
}

const SettingTeamStatus: FC<Props> = ({ isError, eventsSSG }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [statusList, setStatusList] = useState<ApplicantStatusListResponse[]>(
    [],
  )
  const [newStatusList, setNewStatusList] = useState<string[]>([''])
  const [events, setEvents] = useState<ListStatusEventResponse[]>(eventsSSG)

  const [noContent, isNoContent] = useState<boolean>(false)
  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      // API: 応募者ステータス一覧取得
      const list: ApplicantStatusListResponse[] = []
      const tempList = await ApplicantStatusListCSR({
        user_hash_key: user.hashKey,
      } as ApplicantStatusListRequest)

      if (_.isEqual(res.data.code, HttpStatusCode.NoContent)) {
        isNoContent(true)
        return
      }

      _.forEach(tempList.data.list, (item) => {
        list.push({
          hashKey: item.hash_key,
          name: item.status_name,
        } as ApplicantStatusListResponse)
      })
      setStatusList(list)
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
        router.push(_.isEmpty(routerPath) ? RouterPath.Management : routerPath)
      }
    } finally {
      isInit(false)
    }
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
  }, [router.pathname])

  return (
    <>
      <NextHead />
      <Box sx={mt(18)}>
        <Box sx={[SpaceBetween, w(90), M0Auto]}>
          <SettingMenu />
          {_.every([
            !isError,
            !loading,
            roles[Operation.ManagementSettingTeam],
          ]) && (
            <DialogContent sx={[DialogContentSetting, w(90), ml(3)]}>
              {noContent && (
                <Box sx={[w(100), M0Auto]}>{t('common.api.noContent')}</Box>
              )}
              {!noContent && (
                <>
                  <Box sx={[w(100), M0Auto, ColorRed, Bold]}>
                    {t('features.setting.attention')}
                  </Box>

                  <Box sx={ColumnMt4}>
                    <FormLabel sx={[mt(2), mb(1)]}>
                      {t('features.setting.team.sub.status.old')}
                    </FormLabel>
                    <List>
                      {_.map(statusList, (c, index) => {
                        return (
                          <ListItem
                            key={index}
                            sx={[ml(2), Padding(0), MenuDisp(common.black)]}
                          >
                            {'・'}
                            {c.name}
                          </ListItem>
                        )
                      })}
                    </List>

                    <FormLabel sx={[mt(6), mb(1)]}>
                      {t('features.setting.team.sub.status.new') + '*'}
                    </FormLabel>
                    <Box sx={[ml(2), ColorRed, Bold]}>
                      {t('features.setting.team.sub.status.attention')}
                    </Box>
                    {_.map(newStatusList, (_a, index) => {
                      return (
                        <TextField
                          key={index}
                          margin="normal"
                          sx={[ml(2), w(50)]}
                          onChange={(e) => {
                            setNewStatusList(
                              _.map(newStatusList, (s, i) => {
                                if (_.isEqual(i, index)) {
                                  return e.target.value
                                }
                                return s
                              }),
                            )
                          }}
                        />
                      )
                    })}
                    <Button
                      variant="text"
                      sx={[
                        minW(100),
                        maxW(100),
                        ButtonColor(setting.color, common.white),
                        {
                          justifyContent: 'flex-start',
                        },
                      ]}
                      onClick={() => setNewStatusList([...newStatusList, ''])}
                    >
                      <AddIcon />
                      {t('common.button.add')}
                    </Button>

                    <FormLabel sx={[mt(6), mb(1)]}>
                      {t('features.setting.team.sub.status.association') + '*'}
                    </FormLabel>
                    <Box sx={[ml(2), Bold]}>
                      {t('features.setting.team.sub.status.msg')}
                    </Box>
                    <List>
                      {_.map(statusList, (c, index) => {
                        return (
                          <ListItem
                            key={index}
                            sx={[ml(2), MenuDisp(common.black)]}
                          >
                            <Box sx={[minW(250)]}>{'・' + c.name}</Box>
                            <ArrowRightAltIcon sx={mr(5)} />
                            <Select
                              disabled={
                                _.size(
                                  _.filter(newStatusList, (s) => !_.isEmpty(s)),
                                ) < _.size(newStatusList)
                              }
                              value={c.selectedStatusID ?? ''}
                              sx={minW(200)}
                              onChange={(e) => {
                                setStatusList(
                                  _.map(statusList, (s, idx) => {
                                    if (_.isEqual(idx, index)) {
                                      return {
                                        hashKey: s.hashKey,
                                        name: s.name,
                                        selectedStatusID: Number(
                                          e.target.value,
                                        ),
                                        selectedStatus:
                                          newStatusList[Number(e.target.value)],
                                      } as ApplicantStatusListResponse
                                    }

                                    return s
                                  }),
                                )
                              }}
                            >
                              {_.map(newStatusList, (s, index2) => {
                                return (
                                  <MenuItem key={index2} value={index2}>
                                    {s}
                                  </MenuItem>
                                )
                              })}
                            </Select>
                          </ListItem>
                        )
                      })}
                    </List>

                    <FormLabel sx={[mt(6), mb(1)]}>
                      {t('features.setting.team.sub.status.event')}
                    </FormLabel>
                    <List>
                      {_.map(events, (c, index) => {
                        return (
                          <ListItem
                            key={index}
                            sx={[ml(2), MenuDisp(common.black)]}
                          >
                            <Box sx={[minW(400)]}>{'・' + c.desc}</Box>
                            <ArrowRightAltIcon sx={mr(1)} />
                            <Select
                              disabled={
                                _.size(
                                  _.filter(newStatusList, (s) => !_.isEmpty(s)),
                                ) < _.size(newStatusList)
                              }
                              value={c.selectedStatusID ?? ''}
                              sx={minW(200)}
                              onChange={(e) => {
                                setEvents(
                                  _.map(events, (s, idx) => {
                                    if (_.isEqual(idx, index)) {
                                      return {
                                        no: s.no,
                                        hashKey: s.hashKey,
                                        desc: s.desc,
                                        selectedStatusID: Number(
                                          e.target.value,
                                        ),
                                        selectedStatus:
                                          newStatusList[Number(e.target.value)],
                                      } as ListStatusEventResponse
                                    }

                                    return s
                                  }),
                                )
                              }}
                            >
                              {_.map(newStatusList, (s, index2) => {
                                return (
                                  <MenuItem key={index2} value={index2}>
                                    {s}
                                  </MenuItem>
                                )
                              })}
                            </Select>
                          </ListItem>
                        )
                      })}
                    </List>

                    <FormLabel sx={[mt(6), mb(1)]}>
                      {t('features.setting.team.sub.status.flg') + '*'}
                    </FormLabel>
                  </Box>
                </>
              )}
            </DialogContent>
          )}
        </Box>
      </Box>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let isError = false

  // API: ステータスイベントマスタ一覧
  const eventsSSG: ListStatusEventResponse[] = []
  await ListStatusEventSSG()
    .then((res) => {
      _.forEach(res.data.list, (item, index) => {
        eventsSSG.push({
          no: Number(index) + 1,
          hashKey: item.hash_key,
          desc: item[`desc_${locale}`],
        })
      })
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      isError,
      eventsSSG,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default SettingTeamStatus
