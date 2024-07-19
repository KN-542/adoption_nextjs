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
  TableMenuButtons,
  ButtonColorInverse,
  Color,
  DisplayFlex,
  FlexStart,
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
  ListStatusEventByTeamResponse,
  ListStatusEventResponse,
} from '@/api/model/response'
import {
  ApplicantStatusListRequest,
  RolesRequest,
  StatusEventsByTeamRequest,
  UpdateStatusRequest,
} from '@/api/model/request'
import {
  ApplicantStatusListCSR,
  ListStatusEventSSG,
  RolesCSR,
  StatusEventsByTeamCSR,
  UpdateStatusCSR,
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
import DeleteIcon from '@mui/icons-material/Delete'
import CopyAllIcon from '@mui/icons-material/CopyAll'

type Props = {
  isError: boolean
  locale: string
  eventsSSG: ListStatusEventResponse[]
}

const SettingTeamStatus: FC<Props> = ({ isError, locale, eventsSSG }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [statusList, setStatusList] = useState<ApplicantStatusListResponse[]>(
    [],
  )
  const [newStatusList, setNewStatusList] = useState<string[]>([''])
  const [oldEvents, setOldEvents] = useState<ListStatusEventByTeamResponse[]>(
    [],
  )
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

      // API: ステータスイベント取得
      const res2 = await StatusEventsByTeamCSR({
        user_hash_key: user.hashKey,
      } as StatusEventsByTeamRequest)

      const list2: ListStatusEventByTeamResponse[] = []
      _.forEach(res2.data.list, (item, index) => {
        list2.push({
          no: Number(index) + 1,
          desc: item[`desc_${locale}`],
          name: item.status_name,
        })
      })
      setOldEvents(list2)
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

  const update = async () => {
    // バリデーション
    if (
      _.size(_.filter(newStatusList, (s) => !_.isEmpty(s.trim()))) <
      _.size(newStatusList)
    ) {
      toast(t('features.setting.team.sub.status.validate'), {
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
      _.size(_.filter(statusList, (s) => !_.isEmpty(s.selectedStatus))) <
      _.size(statusList)
    ) {
      toast(t('features.setting.team.sub.status.validate2'), {
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

    // API: ステータス変更
    await UpdateStatusCSR({
      user_hash_key: user.hashKey,
      status: newStatusList,
      association: _.map(statusList, (item) => {
        return {
          before_hash: item.hashKey,
          after_index: item.selectedStatusID,
        }
      }),
      events: _.map(
        _.filter(events, (item) => !_.isEmpty(item.selectedStatus)),
        (item) => {
          return {
            event_hash: item.hashKey,
            status: item.selectedStatusID,
          }
        },
      ),
    } as UpdateStatusRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [t('common.toast.update_0')],
          } as SettingModel),
        )

        router.push(RouterPath.Management + RouterPath.Back)
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
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
  }

  useEffect(() => {
    // トースト
    if (loading) {
      if (!_.isEmpty(setting.errorMsg)) {
        setTimeout(() => {
          for (const msg of setting.errorMsg) {
            toast(msg, {
              style: {
                backgroundColor: setting.toastErrorColor,
                color: common.white,
                width: 630,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
          }
        }, 0.1 * 1000)

        store.dispatch(
          changeSetting({
            errorMsg: [],
          } as SettingModel),
        )
      }

      if (!_.isEmpty(setting.successMsg)) {
        setTimeout(() => {
          for (const msg of setting.successMsg) {
            toast(msg, {
              style: {
                backgroundColor: setting.toastSuccessColor,
                color: common.white,
                width: 630,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
          }
        }, 0.1 * 1000)

        store.dispatch(
          changeSetting({
            successMsg: [],
          } as SettingModel),
        )
      }
    }

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
                  <Box sx={[TableMenuButtons, mt(1)]}>
                    <Button
                      variant="contained"
                      sx={[
                        mr(10),
                        minW(100),
                        ButtonColorInverse(common.white, setting.color),
                      ]}
                      onClick={update}
                    >
                      {t('common.button.update')}
                    </Button>
                  </Box>

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
                      {t('features.setting.team.sub.status.oldEvent')}
                    </FormLabel>
                    <List>
                      {_.map(oldEvents, (c, index) => {
                        return (
                          <ListItem
                            key={index}
                            sx={[ml(2), MenuDisp(common.black)]}
                          >
                            <Box sx={[minW(400)]}>{'・' + c.desc}</Box>
                            <ArrowRightAltIcon sx={mr(1)} />
                            <Box>{c.name}</Box>
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
                    {_.map(newStatusList, (str, index) => {
                      return (
                        <Box key={index} sx={DisplayFlex}>
                          <TextField
                            key={index}
                            margin="normal"
                            sx={[ml(2), w(50)]}
                            value={str}
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
                          <Button
                            disabled={_.every([
                              _.isEqual(index, 0),
                              _.isEqual(_.size(newStatusList), 1),
                            ])}
                            sx={[ml(1), Color(setting.toastErrorColor)]}
                            variant="text"
                            onClick={() => {
                              setNewStatusList(
                                _.filter(
                                  newStatusList,
                                  (n) => !_.isEqual(n, str),
                                ),
                              )
                              setStatusList(
                                _.map(statusList, (s) => {
                                  return {
                                    hashKey: s.hashKey,
                                    name: s.name,
                                  } as ApplicantStatusListResponse
                                }),
                              )
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        </Box>
                      )
                    })}
                    <Button
                      variant="text"
                      sx={[
                        minW(100),
                        maxW(100),
                        ButtonColor(setting.color, common.white),
                        FlexStart,
                      ]}
                      onClick={() => setNewStatusList([...newStatusList, ''])}
                    >
                      <AddIcon />
                      {t('common.button.add')}
                    </Button>
                    <Button
                      variant="text"
                      sx={[
                        minW(300),
                        maxW(300),
                        ButtonColor(setting.color, common.white),
                        FlexStart,
                      ]}
                      onClick={() => {
                        const list = _.map(statusList, (item) => {
                          return item.name
                        })

                        setNewStatusList(list)

                        setStatusList(
                          _.map(statusList, (s, idx) => {
                            return {
                              hashKey: s.hashKey,
                              name: s.name,
                              selectedStatusID: Number(idx),
                              selectedStatus: list[Number(idx)],
                            } as ApplicantStatusListResponse
                          }),
                        )
                      }}
                    >
                      <CopyAllIcon />
                      {t('features.setting.team.sub.status.same')}
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
                                  _.filter(
                                    newStatusList,
                                    (s) => !_.isEmpty(s.trim()),
                                  ),
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
                                  _.filter(
                                    newStatusList,
                                    (s) => !_.isEmpty(s.trim()),
                                  ),
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
      locale,
      eventsSSG,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default SettingTeamStatus
