import React, { FC, useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import rrulePlugin from '@fullcalendar/rrule'
import { Box } from '@mui/material'
import {
  CursorPointer,
  CustomTableContainer,
  M0Auto,
  h,
  mt,
  w,
} from '@/styles/index'
import NextHead from '@/components/common/Header'
import jaLocale from '@fullcalendar/core/locales/ja'
import { formatDateToHHMM, LITTLE_DURING } from '@/hooks/common'
import _ from 'lodash'
import {
  CalendarModel,
  SelectTitlesModel,
  ScheduleType,
  Schedule,
  SettingModel,
} from '@/types/index'
import {
  CreateScheduleCSR,
  DeleteSchedulesCSR,
  GetOwnTeamCSR,
  RolesCSR,
  SchedulesCSR,
  UpdateScheduleCSR,
  UserListScheduleTypeSSR,
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
} from '@/api/model/request'
import CalendarModal from '@/components/management/modal/CalendarModal'
import { changeSetting } from '@/hooks/store'
import { GetServerSideProps } from 'next'
import { EventInput } from '@fullcalendar/core/index.js'
import { Operation } from '@/enum/common'
import {
  GetTeamResponse,
  SearchUserByCompanyResponse,
} from '@/api/model/response'

type Props = {
  isError: boolean
  scheduleList: ScheduleType[]
}

const Schedules: FC<Props> = ({ isError, scheduleList }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})

  const [events, setEvents] = useState<EventInput[]>([])
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [model, setModel] = useState<CalendarModel>({} as CalendarModel)
  const [calendars, setCalendars] = useState<Schedule[]>([])
  const [team, setTeam] = useState<GetTeamResponse>(null)

  const [open, isOpen] = useState<boolean>(false)
  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)

  const processing = useRef<boolean>(false)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      if (res && res.data) {
        setRoles(res.data.map as { [key: string]: boolean })
      } else {
        throw new Error('Roles data not found')
      }

      // API: チーム取得
      const res2 = await GetOwnTeamCSR({
        user_hash_key: user.hashKey,
      } as GetOwnTeamRequest)

      if (res2 && res2.data && res2.data.team) {
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
      } else {
        throw new Error('Team data not found')
      }
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

  const search = async () => {
    isLoading(true)

    try {
      // API スケジュール一覧
      const res = await SchedulesCSR({
        user_hash_key: user.hashKey,
      } as SearchScheduleRequest)

      // data プロパティのチェック
      if (!res || !res.data) {
        throw new Error('Schedule data not found')
      }

      const list: Schedule[] = []
      const list2: EventInput[] = []

      for (const item of res.data.list || []) {
        list.push({
          hashKey: item.hash_key,
          users: _.map(item.users, (user) => ({
            key: user.hash_key,
            title: user.name,
            subTitle: user.email,
          })),
          interviewFlg: item.interview_flg,
          start: new Date(item.start),
          end: new Date(item.end),
          title: item.title,
          freqId: Number(item.freq_id),
          freq: item.freq_name,
        })

        const start = formatDateToHHMM(new Date(item.start))
        const end = formatDateToHHMM(new Date(item.end))

        if (_.isEmpty(item.freq_name)) {
          list2.push({
            id: item.hash_key,
            title: `${start}~${end} ${item.title}`,
            start: new Date(item.start),
            allDay: true,
            color: setting.color,
          })
        } else if (_.isEqual(item.freq_name, ScheduleTypes.Daily)) {
          list2.push({
            id: item.hash_key,
            title: `${start}~${end} ${item.title}`,
            start: new Date(item.start),
            allDay: true,
            color: setting.color,
            rrule: {
              freq: ScheduleTypes.Daily,
              interval: 1,
              dtstart: new Date(item.start),
            },
          })
        }
        // 他の freq_name の処理
      }

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
        toast(t('features.user.schedule.schedule') + t('common.toast.create'), {
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
        toast(t('features.user.schedule.schedule') + t('common.toast.edit'), {
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
        toast(t('features.user.schedule.schedule') + t('common.toast.delete'), {
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

  useEffect(() => {
    const initialize = async () => {
      try {
        if (isError) {
          router.push(RouterPath.Error)
          return
        }

        if (init) await inits()

        await search()
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
        !isError,
        !loading,
        roles[Operation.ManagementScheduleRead],
      ]) && (
        <>
          <Box sx={[w(90), M0Auto, CustomTableContainer(80), mt(12)]}>
            <FullCalendar
              plugins={[dayGridPlugin, rrulePlugin]}
              initialDate={currentDate}
              locale={jaLocale}
              initialView="dayGridMonth"
              events={events}
              dayCellContent={(e) => {
                return (
                  <Box
                    className="day-cell-content"
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

                if (_.isEqual(obj.interviewFlg, InterviewerStatus.Interview))
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
                await deleteSchedule(id)
                await search()
              }}
              submit={async (m: CalendarModel) => {
                // 編集
                if (!_.isEmpty(m.id)) {
                  await updateSchedule(m)
                  await search()
                  return
                }

                // 登録
                await createSchedule(m)
                await search()
              }}
            ></CalendarModal>
          )}
        </>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  let isError = false
  const scheduleList: ScheduleType[] = []

  try {
    // API スケジュール登録種別一覧
    const res = await UserListScheduleTypeSSR()
    if (res && res.data) {
      scheduleList.push(
        ..._.map(res.data.list, (item) => ({
          value: String(item.id),
          name: item[`name_${locale}`],
          freqName: item.freq_name,
        })),
      )
    } else {
      throw new Error('Failed to fetch schedule list')
    }
  } catch (error) {
    console.error('Error fetching schedule types:', error)
    isError = true
  }

  return {
    props: {
      scheduleList,
      isError,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Schedules
