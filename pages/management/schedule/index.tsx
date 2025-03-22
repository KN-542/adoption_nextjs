import React, { FC, useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import rrulePlugin from '@fullcalendar/rrule'
import {
  Box,
  Checkbox,
  DialogContent,
  Divider,
  FormControlLabel,
  FormLabel,
} from '@mui/material'
import {
  Color,
  ColumnMt0,
  CursorPointer,
  CustomTableContainer,
  DialogContentSettingNone,
  M0Auto,
  ScheduleSelectedUsers,
  SpaceBetween,
  h,
  mb,
  minW,
  ml,
  mr,
  mt,
  w,
} from '@/styles/index'
import NextHead from '@/components/common/Header'
import jaLocale from '@fullcalendar/core/locales/ja'
import {
  formatDateToHHMM,
  getDayOfYear,
  LITTLE_DURING,
  WEEKENDS,
} from '@/hooks/common'
import _ from 'lodash'
import {
  CalendarModel,
  SelectTitlesModel,
  ScheduleType,
  Schedule,
  SettingModel,
  UserModel,
} from '@/types/index'
import {
  CreateScheduleCSR,
  DeleteSchedulesCSR,
  GetOwnTeamCSR,
  RolesCSR,
  SchedulesCSR,
  SearchUserByCompanyCSR,
  UpdateScheduleCSR,
  UserListScheduleTypeCSR,
} from '@/api/repository'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import store, { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { RouterPath } from '@/enum/router'
import { toast } from 'react-toastify'
import { common } from '@mui/material/colors'
import ClearIcon from '@mui/icons-material/Clear'
import { InterviewerStatus, ScheduleTypes } from '@/enum/user'
import {
  RolesRequest,
  GetOwnTeamRequest,
  SearchScheduleRequest,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  DeleteScheduleRequest,
  SearchUserByCompanyRequest,
} from '@/api/model/request'
import CalendarModal from '@/components/management/modal/CalendarModal'
import {
  changeSetting,
  scheduleInitialDate,
  scheduleInitialView,
  scheduleIsInterview,
  scheduleSearchUsers,
} from '@/hooks/store'
import { GetServerSideProps } from 'next'
import { EventInput } from '@fullcalendar/core/index.js'
import { Operation } from '@/enum/common'
import {
  GetTeamResponse,
  SearchUserByCompanyResponse,
} from '@/api/model/response'
import { CalendarHeaderTool, InterviewFlg, TimeZone } from '@/enum/schedule'
import DropDownList from '@/components/common/DropDownList'
import Spinner from '@/components/common/modal/Spinner'

type Props = {
  locale: string
}

const Schedules: FC<Props> = ({ locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const schedule = useSelector((state: RootState) => state.schedule)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})

  const [scheduleList, setScheduleList] = useState<ScheduleType[]>([])
  const [events, setEvents] = useState<EventInput[]>([])
  const [currentDate, setCurrentDate] = useState<Date>(schedule.initialDate)
  const [currentView, setCurrentView] = useState<string>(schedule.initialView)
  const [model, setModel] = useState<CalendarModel>({} as CalendarModel)
  const [calendars, setCalendars] = useState<Schedule[]>([])
  const [users, setUsers] = useState<SearchUserByCompanyResponse[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserModel[]>([])
  const [team, setTeam] = useState<GetTeamResponse>(null)
  const calendarRef = useRef(null)

  const [open, isOpen] = useState<boolean>(false)
  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)
  const [onlyInterview, isOnlyInterview] = useState<boolean>(
    schedule.isOnlyInterview,
  )
  const [spinner, isSpinner] = useState<boolean>(false)

  const processing = useRef<boolean>(false)

  const inits = async () => {
    try {
      // API スケジュール登録種別一覧
      const tempList0: ScheduleType[] = []
      const res0 = await UserListScheduleTypeCSR()
      tempList0.push(
        ..._.map(res0.data.list, (item) => ({
          value: String(item.id),
          name: item[`name_${locale}`],
          freqName: item.freq_name,
        })),
      )
      setScheduleList(tempList0)

      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)
      setRoles(res.data.map as { [key: string]: boolean })

      // API: チーム取得
      const res2 = await GetOwnTeamCSR({
        user_hash_key: user.hashKey,
      } as GetOwnTeamRequest)

      setTeam({
        hashKey: res2.data.team.hash_key,
        name: res2.data.team.name,
        users: _.map(res2.data.team.users, (user) => {
          return {
            hashKey: user.hash_key,
            name: user.name,
            email: user.email,
          } as SearchUserByCompanyResponse
        }),
      } as GetTeamResponse)

      // API: ユーザー検索_同一企業
      const res3 = await SearchUserByCompanyCSR({
        hash_key: user.hashKey,
      } as SearchUserByCompanyRequest)

      const tempList3 = _.map(res3.data.list, (u) => {
        return {
          hashKey: u.hash_key,
          name: u.name,
          email: u.email,
        } as SearchUserByCompanyResponse
      })

      setUsers(tempList3)

      const resList: UserModel[] = []
      for (const u of schedule.users) {
        if (
          _.findIndex(tempList3, (item) =>
            _.every([
              _.isEqual(u.hashKey, item.hashKey),
              _.isEqual(u.name, item.name),
              _.isEqual(u.email, item.email),
            ]),
          ) > -1
        ) {
          resList.push(u)
        }
      }

      store.dispatch(scheduleSearchUsers(resList))
      setSelectedUsers(resList)
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

  const search = async (
    grid: string,
    models: UserModel[],
    checked?: boolean,
  ) => {
    const l = _.map(
      _.filter(models, (mm) => mm.checked),
      (m) => m.hashKey,
    )
    if (_.isEmpty(l)) {
      setCalendars([])
      setEvents([])
      return
    }

    isSpinner(true)
    isLoading(true)

    try {
      // API スケジュール一覧
      const res = await SchedulesCSR({
        user_hash_key: user.hashKey,
        users: l,
        interview_flg: checked ? InterviewFlg.Interview : null,
      } as SearchScheduleRequest)

      const list: Schedule[] = []
      const list2: EventInput[] = []

      _.forEach(l, (h, idx) => {
        const array = _.filter(
          res.data.list || [],
          (item) =>
            _.findIndex(
              _.map(item.users, (u) => {
                return u.hash_key as string
              }),
              (hh) => _.isEqual(h, hh),
            ) > -1,
        )

        for (const item of array) {
          const startUTC = new Date(item.start)
          const endUTC = new Date(item.end)
          const startTZ = new Date(startUTC.getTime() + TimeZone.JST)
          const endTZ = new Date(endUTC.getTime() + TimeZone.JST)
          const start = formatDateToHHMM(new Date(item.start))
          const end = formatDateToHHMM(new Date(item.end))

          const durationMs = endUTC.getTime() - startUTC.getTime()
          const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
          const durationMinutes = Math.floor(
            (durationMs % (1000 * 60 * 60)) / (1000 * 60),
          )
          const duration = `${String(durationHours).padStart(2, '0')}:${String(
            durationMinutes,
          ).padStart(2, '0')}`

          list.push({
            hashKey: item.hash_key,
            users: _.map(item.users, (user) => ({
              key: user.hash_key,
              title: user.name,
              subTitle: user.email,
            })),
            interviewFlg: item.interview_flg,
            start: startUTC,
            end: endUTC,
            title: item.title,
            freqId: Number(item.freq_id),
            freq: item.freq_name,
          })

          if (
            _.some([
              _.isEqual(grid, CalendarHeaderTool.Day),
              _.isEqual(grid, CalendarHeaderTool.Week),
            ])
          ) {
            if (_.isEmpty(item.freq_name)) {
              list2.push({
                id: item.hash_key,
                title: item.title,
                start: startUTC,
                end: endUTC,
                allDay: false,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Daily)) {
              list2.push({
                id: item.hash_key,
                title: item.title,
                start: startTZ,
                end: endTZ,
                allDay: false,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Daily,
                  interval: 1,
                  dtstart: startTZ,
                },
                duration: duration, // 持続時間を明示的に指定
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Weekly)) {
              list2.push({
                id: item.hash_key,
                title: item.title,
                start: startTZ,
                allDay: false,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Weekly,
                  interval: 1,
                  byweekday: WEEKENDS[startTZ.getDay()],
                  dtstart: startTZ,
                },
                duration: duration,
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Monthly)) {
              list2.push({
                id: item.hash_key,
                title: item.title,
                start: startTZ,
                allDay: false,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Monthly,
                  interval: 1,
                  bymonthday: startTZ.getDate(),
                  dtstart: startTZ,
                },
                duration: duration,
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Yearly)) {
              list2.push({
                id: item.hash_key,
                title: item.title,
                start: startTZ,
                allDay: false,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Yearly,
                  interval: 1,
                  byyearday: getDayOfYear(startTZ),
                  dtstart: startTZ,
                },
                duration: duration,
              })
            }
          } else {
            if (_.isEmpty(item.freq_name)) {
              list2.push({
                id: item.hash_key,
                title: `${start}~${end} ${item.title}`,
                start: startTZ,
                allDay: true,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Daily)) {
              list2.push({
                id: item.hash_key,
                title: `${start}~${end} ${item.title}`,
                start: startTZ,
                allDay: true,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Daily,
                  interval: 1,
                  dtstart: startTZ,
                },
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Weekly)) {
              list2.push({
                id: item.hash_key,
                title: `${start}~${end} ${item.title}`,
                start: startTZ,
                allDay: true,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Weekly,
                  interval: 1,
                  byweekday: WEEKENDS[startTZ.getDay()],
                  dtstart: startTZ,
                },
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Monthly)) {
              list2.push({
                id: item.hash_key,
                title: `${start}~${end} ${item.title}`,
                start: startTZ,
                allDay: true,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Monthly,
                  interval: 1,
                  bymonthday: startTZ.getDate(),
                  dtstart: startTZ,
                },
              })
            } else if (_.isEqual(item.freq_name, ScheduleTypes.Yearly)) {
              list2.push({
                id: item.hash_key,
                title: `${start}~${end} ${item.title}`,
                start: startTZ,
                allDay: true,
                color:
                  setting.calendarColors[idx % _.size(setting.calendarColors)],
                rrule: {
                  freq: ScheduleTypes.Yearly,
                  interval: 1,
                  byyearday: getDayOfYear(startTZ),
                  dtstart: startTZ,
                },
              })
            }
          }
        }
      })

      setCalendars(list)
      setEvents(list2)
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
      isSpinner(false)
      isLoading(false)
    }
  }

  const createSchedule = async (m: CalendarModel) => {
    if (processing.current) return
    processing.current = true

    const start = new Date(
      m.date.getFullYear(),
      m.date.getMonth(),
      m.date.getDate(),
      Number(m.start.split(':')[0]),
      Number(m.start.split(':')[1]),
    ).toISOString()
    const end = new Date(
      m.date.getFullYear(),
      m.date.getMonth(),
      m.date.getDate(),
      Number(m.end.split(':')[0]),
      Number(m.end.split(':')[1]),
    ).toISOString()

    // API スケジュール登録
    await CreateScheduleCSR({
      user_hash_key: user.hashKey,
      users: _.map(m.users, (item) => {
        return item.key
      }),
      freq_id: Number(m.type.value),
      interview_flg: InterviewerStatus.None,
      start: start,
      end: end,
      title: m.title,
    } as CreateScheduleRequest)
      .then(() => {
        toast(t('features.schedule.index') + t('common.toast.create'), {
          style: {
            backgroundColor: setting.toastSuccessColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })

        setCurrentDate(m.date)
        setTimeout(() => {
          processing.current = false
        }, LITTLE_DURING)
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
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
  }

  const updateSchedule = async (m: CalendarModel) => {
    if (processing.current) return
    processing.current = true

    const start = new Date(
      m.date.getFullYear(),
      m.date.getMonth(),
      m.date.getDate(),
      Number(m.start.split(':')[0]),
      Number(m.start.split(':')[1]),
    ).toISOString()
    const end = new Date(
      m.date.getFullYear(),
      m.date.getMonth(),
      m.date.getDate(),
      Number(m.end.split(':')[0]),
      Number(m.end.split(':')[1]),
    ).toISOString()

    // API スケジュール更新
    await UpdateScheduleCSR({
      user_hash_key: user.hashKey,
      hash_key: m.id,
      users: _.map(m.users, (item) => {
        return item.key
      }),
      freq_id: Number(m.type.value),
      interview_flg: InterviewerStatus.None,
      start: start,
      end: end,
      title: m.title,
    } as UpdateScheduleRequest)
      .then(() => {
        toast(t('features.schedule.schedule') + t('common.toast.edit'), {
          style: {
            backgroundColor: setting.toastSuccessColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })

        setCurrentDate(m.date)
        setTimeout(() => {
          processing.current = false
        }, LITTLE_DURING)
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
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
  }

  const deleteSchedule = async (id: string) => {
    if (processing.current) return
    processing.current = true

    // API カレンダー削除
    await DeleteSchedulesCSR({
      user_hash_key: user.hashKey,
      hash_key: id,
    } as DeleteScheduleRequest)
      .then(() => {
        toast(t('features.schedule.schedule') + t('common.toast.delete'), {
          style: {
            backgroundColor: setting.toastSuccessColor,
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
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
  }

  const applyTool = async (tool: string) => {
    isSpinner(true)

    const calendarApi = calendarRef.current.getApi()
    calendarApi.changeView(tool)

    store.dispatch(scheduleInitialView(tool))
    setCurrentView(tool)

    await search(tool, selectedUsers, onlyInterview)

    isSpinner(false)
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        if (init) await inits()
        await search(
          schedule.initialView,
          schedule.users,
          schedule.isOnlyInterview,
        )
      } finally {
        isLoading(false)
      }
    }

    initialize()
  }, [])

  const applyCustomButton = () => {
    for (const item of [
      ..._.map(schedule.headers, (h) => {
        return h.custom
      }),
      'customInsert',
    ]) {
      const customButton = document.querySelector(
        `.fc-${item}-button`,
      ) as HTMLElement
      customButton.style.backgroundColor = setting.color
      customButton.style.color = common.white
      customButton.style.borderColor = common.white
    }
  }

  return (
    <>
      <NextHead />
      {_.every([!loading, roles[Operation.ManagementScheduleRead]]) && (
        <>
          {spinner && <Spinner />}
          <Box sx={mt(12)}>
            <Box sx={[SpaceBetween, w(96), M0Auto]}>
              <DialogContent
                sx={[DialogContentSettingNone, w(20), mr(2), h(100)]}
              >
                <Box sx={ColumnMt0}>
                  <FormLabel sx={[mb(1)]}>
                    {t('features.schedule.users')}
                  </FormLabel>
                  <DropDownList
                    list={[]}
                    initList={_.map(
                      _.filter(users, (u) =>
                        _.isEqual(
                          _.findIndex(selectedUsers, (uu) =>
                            _.isEqual(uu.hashKey, u.hashKey),
                          ),
                          -1,
                        ),
                      ),
                      (u) => {
                        return {
                          key: u.hashKey,
                          title: u.name,
                          subTitle: u.email,
                        } as SelectTitlesModel
                      },
                    )}
                    sx={w(100)}
                    textSx={[minW(100), Color(setting.color)]}
                    onChange={async (value) => {
                      isSpinner(true)

                      const newUsers = [
                        ...selectedUsers,
                        {
                          hashKey: value[0].key,
                          name: value[0].title,
                          email: value[0].subTitle,
                          checked: true,
                        } as UserModel,
                      ]
                      setSelectedUsers(newUsers)
                      store.dispatch(scheduleSearchUsers(newUsers))

                      await search(currentView, newUsers, onlyInterview)
                      isSpinner(false)
                    }}
                  />

                  <FormLabel sx={[mt(4), mb(1)]}></FormLabel>
                  <Box sx={ScheduleSelectedUsers}>
                    {_.map(selectedUsers, (u, idx) => {
                      return (
                        <Box key={idx}>
                          <FormControlLabel
                            color={
                              setting.calendarColors[
                                idx % _.size(setting.calendarColors)
                              ]
                            }
                            checked={u.checked}
                            sx={[w(90), mr(0)]}
                            control={
                              <Checkbox
                                style={Color(
                                  setting.calendarColors[
                                    idx % _.size(setting.calendarColors)
                                  ],
                                )}
                                checked={u.checked}
                                onClick={async () => {
                                  isSpinner(true)

                                  const newUsers = _.cloneDeep(selectedUsers)
                                  newUsers[idx].checked = !newUsers[idx].checked

                                  const sortedUsers = newUsers.sort((a, b) => {
                                    if (_.isEqual(a.checked, b.checked))
                                      return 0
                                    return a.checked ? -1 : 1
                                  })

                                  setSelectedUsers(sortedUsers)
                                  store.dispatch(
                                    scheduleSearchUsers(sortedUsers),
                                  )

                                  await search(
                                    currentView,
                                    sortedUsers,
                                    onlyInterview,
                                  )

                                  isSpinner(false)
                                }}
                              />
                            }
                            label={u.name}
                          />
                          <ClearIcon
                            sx={CursorPointer}
                            onClick={async () => {
                              isSpinner(true)

                              const newUsers: UserModel[] = []
                              for (const o of selectedUsers) {
                                if (!_.isEqual(o.hashKey, u.hashKey)) {
                                  newUsers.push(o)
                                }
                              }

                              setSelectedUsers(newUsers)
                              store.dispatch(scheduleSearchUsers(newUsers))

                              await search(currentView, newUsers, onlyInterview)
                              isSpinner(false)
                            }}
                          />
                        </Box>
                      )
                    })}
                  </Box>

                  <Divider sx={[mt(5), mb(1)]} />

                  <FormControlLabel
                    color={setting.color}
                    checked={onlyInterview}
                    sx={[w(90), mr(0)]}
                    control={
                      <Checkbox
                        style={Color(setting.color)}
                        checked={onlyInterview}
                        onClick={async () => {
                          isSpinner(true)

                          const flg = !onlyInterview

                          isOnlyInterview(flg)
                          store.dispatch(scheduleIsInterview(flg))

                          await search(currentView, selectedUsers, flg)
                          isSpinner(false)
                        }}
                      />
                    }
                    label={t('features.schedule.onlyInterview')}
                  />
                </Box>
              </DialogContent>

              <Box sx={[w(80), CustomTableContainer(90), ml(2)]}>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, rrulePlugin]}
                  initialDate={currentDate}
                  locale={jaLocale}
                  initialView={currentView}
                  headerToolbar={{
                    left: `${_.map(
                      _.filter(schedule.headers, (hh) => hh.isLeft),
                      (h) => {
                        return h.custom
                      },
                    ).join(',')},customInsert`,
                    center: 'title',
                    right: _.map(
                      _.filter(schedule.headers, (hh) => !hh.isLeft),
                      (h) => {
                        return h.custom
                      },
                    ).join(','),
                  }}
                  customButtons={{
                    customInsert: {
                      text: t('features.schedule.header.insert'),
                      click: () => {
                        setModel({
                          id: null,
                          date: new Date(),
                          start: null,
                          end: null,
                          title: null,
                          users: [],
                          type: null,
                        } as CalendarModel)
                        isOpen(true)
                      },
                    },
                    customToday: {
                      text: t('features.schedule.header.today'),
                      click: () => {
                        const calendarApi = calendarRef.current?.getApi()
                        calendarApi?.today()
                        const newDate = calendarApi?.getDate()
                        setCurrentDate(newDate)
                        store.dispatch(scheduleInitialDate(newDate))
                      },
                    },
                    customTimeGridDay: {
                      text: t('features.schedule.header.day'),
                      click: () => applyTool(CalendarHeaderTool.Day),
                    },
                    customTimeGridWeek: {
                      text: t('features.schedule.header.week'),
                      click: () => applyTool(CalendarHeaderTool.Week),
                    },
                    customDayGridMonth: {
                      text: t('features.schedule.header.month'),
                      click: () => applyTool(CalendarHeaderTool.Month),
                    },
                    customDayGridYear: {
                      text: t('features.schedule.header.year'),
                      click: () => applyTool(CalendarHeaderTool.Year),
                    },
                    customPrev: {
                      text: '<',
                      click: () => {
                        const calendarApi = calendarRef.current?.getApi()
                        calendarApi?.prev()
                        const newDate = calendarApi?.getDate()
                        store.dispatch(scheduleInitialDate(newDate))
                        setCurrentDate(newDate)
                      },
                    },
                    customNext: {
                      text: '>',
                      click: () => {
                        const calendarApi = calendarRef.current?.getApi()
                        calendarApi?.next()
                        const newDate = calendarApi?.getDate()
                        store.dispatch(scheduleInitialDate(newDate))
                        setCurrentDate(newDate)
                      },
                    },
                  }}
                  ref={calendarRef}
                  events={events}
                  datesSet={() => applyCustomButton()}
                  viewHeight={100}
                  dayCellContent={(e) => {
                    return (
                      <Box
                        onClick={() => {
                          const today = new Date()
                          if (
                            _.some([
                              e.date.getFullYear() < today.getFullYear(),
                              _.every([
                                _.isEqual(
                                  e.date.getFullYear(),
                                  today.getFullYear(),
                                ),
                                e.date.getMonth() < today.getMonth(),
                              ]),
                              _.every([
                                _.isEqual(
                                  e.date.getFullYear(),
                                  today.getFullYear(),
                                ),
                                _.isEqual(e.date.getMonth(), today.getMonth()),
                                e.date.getDate() < today.getDate(),
                              ]),
                            ])
                          )
                            return

                          setModel({
                            id: null,
                            date: e.date,
                            start: null,
                            end: null,
                            title: null,
                            users: [],
                            type: null,
                          } as CalendarModel)
                          isOpen(true)
                        }}
                        sx={[h(100), CursorPointer]}
                      >
                        {e.dayNumberText}
                      </Box>
                    )
                  }}
                  contentHeight={667}
                  key={events.length}
                  eventClick={(info) => {
                    const obj = _.find(calendars, (c) =>
                      _.isEqual(c.hashKey, info.event.id),
                    )
                    if (_.isEmpty(obj)) {
                      router.push(RouterPath.Error)
                      return
                    }

                    if (
                      _.isEqual(obj.interviewFlg, InterviewerStatus.Interview)
                    )
                      return

                    setModel({
                      id: info.event.id,
                      date: new Date(obj.start),
                      start: formatDateToHHMM(new Date(obj.start)),
                      end: formatDateToHHMM(new Date(obj.end)),
                      title: obj.title,
                      users: obj.users,
                      type: { value: String(obj.freqId) } as ScheduleType,
                    } as CalendarModel)
                    isOpen(true)
                  }}
                />
              </Box>
            </Box>
          </Box>

          {open && (
            <CalendarModal
              open={open}
              model={
                {
                  id: model.id,
                  date: model.date,
                  start: model.start,
                  end: model.end,
                  title: model.title,
                  users: model.users,
                  type: model.type,
                } as CalendarModel
              }
              users={_.map(team.users, (user) => {
                return {
                  key: user.hashKey,
                  title: user.name,
                  subTitle: user.email,
                } as SelectTitlesModel
              })}
              radios={scheduleList}
              isEdit={!_.isEmpty(model.start)}
              close={() => isOpen(false)}
              delete={async (id: string) => {
                isSpinner(true)

                await deleteSchedule(id)
                await search(currentView, selectedUsers, onlyInterview)

                isSpinner(false)
              }}
              submit={async (m: CalendarModel) => {
                isSpinner(true)

                // 編集
                if (!_.isEmpty(m.id)) {
                  await updateSchedule(m)
                  await search(currentView, selectedUsers, onlyInterview)

                  isSpinner(false)
                  return
                }

                // 登録
                await createSchedule(m)
                await search(currentView, selectedUsers, onlyInterview)

                isSpinner(false)
              }}
            ></CalendarModal>
          )}
        </>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      locale,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Schedules
