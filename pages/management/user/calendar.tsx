import React, { useEffect, useState } from 'react'
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
import { WEEKENDS, formatDateToHHMM, getDayOfYear } from '@/hooks/common'
import _ from 'lodash'
import {
  CalendarModel,
  SelectTitlesModel,
  UserGroupTableBody,
  ScheduleType,
  UsersTableBody,
  Schedule,
} from '@/types/common/index'
import {
  CreateSchedulesCSR,
  DeleteSchedulesCSR,
  SchedulesCSR,
  SearchUserGroupCSR,
  UserSearchCSR,
  UserListScheduleTypeSSG,
} from '@/api/repository'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { RouterPath } from '@/enum/router'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import { common } from '@mui/material/colors'
import ClearIcon from '@mui/icons-material/Clear'
import { InterviewerStatus, ScheduleTypes } from '@/enum/user'
import { SchedulesRequest, HashKeyRequest } from '@/api/model/request'
import CalendarModal from '@/components/management/modal/CalendarModal'

const UserCalendar = ({ isError, api }) => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [open, isOpen] = useState(false)
  const [model, setModel] = useState<CalendarModel>({} as CalendarModel)
  const [users, setUsers] = useState<(UsersTableBody | UserGroupTableBody)[]>(
    [],
  )
  const [calendars, setCalendars] = useState<Schedule[]>([])
  const [loading, isLoading] = useState(true)

  const search = async () => {
    isLoading(true)
    const list: (UsersTableBody | UserGroupTableBody)[] = []
    const list2: Schedule[] = []
    const tempList = []

    try {
      // API ユーザー一覧
      const res = await UserSearchCSR()
      res.data.users.forEach((u) => {
        list.push({
          hashKey: u.hash_key,
          name: u.name,
          email: u.email,
        } as UsersTableBody)
      })

      // API ユーザーグループ一覧
      const res2 = await SearchUserGroupCSR()
      res2.data.user_groups.forEach((u) => {
        list.push({
          hashKey: u.hash_key,
          name: u.name,
          email: '',
        } as UserGroupTableBody)
      })

      // API スケジュール一覧
      const res3 = await SchedulesCSR()
      for (const item of res3.data.list) {
        list2.push({
          hashKey: item.hash_key,
          userHashKeys: item.user_hash_keys.split(','),
          interviewFlg: item.interview_flg,
          start: new Date(item.start),
          end: new Date(item.end),
          title: item.title,
          freqId: Number(item.freq_id),
          freq: item.freq,
        } as Schedule)

        const start = formatDateToHHMM(new Date(item.start))
        const end = formatDateToHHMM(new Date(item.end))

        if (_.isEmpty(item.freq)) {
          tempList.push({
            id: item.hash_key,
            title: `${start}~${end} ${item.title}`,
            start: new Date(item.start),
            allDay: true,
            color: setting.color,
          })
        } else if (_.isEqual(item.freq, ScheduleTypes.Daily)) {
          tempList.push({
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
        } else if (_.isEqual(item.freq, ScheduleTypes.Weekly)) {
          tempList.push({
            id: item.hash_key,
            title: `${start}~${end} ${item.title}`,
            start: new Date(item.start),
            allDay: true,
            color: setting.color,
            rrule: {
              freq: ScheduleTypes.Weekly,
              interval: 1,
              byweekday: WEEKENDS[new Date(item.start).getDay()],
              dtstart: new Date(item.start),
            },
          })
        } else if (_.isEqual(item.freq, ScheduleTypes.Monthly)) {
          tempList.push({
            id: item.hash_key,
            title: `${start}~${end} ${item.title}`,
            start: new Date(item.start),
            allDay: true,
            color: setting.color,
            rrule: {
              freq: ScheduleTypes.Monthly,
              interval: 1,
              bymonthday: new Date(item.start).getDate(),
              dtstart: new Date(item.start),
            },
          })
        } else if (_.isEqual(item.freq, ScheduleTypes.Yearly)) {
          tempList.push({
            id: item.hash_key,
            title: `${start}~${end} ${item.title}`,
            start: new Date(item.start),
            allDay: true,
            color: setting.color,
            rrule: {
              freq: ScheduleTypes.Yearly,
              interval: 1,
              byyearday: getDayOfYear(new Date(item.start)),
              dtstart: new Date(item.start),
            },
          })
        }
      }
      setUsers(list)
      setCalendars(list2)
      setEvents(tempList)
    } catch (error) {
      if (error.response) {
        if (500 <= error.response?.status && error.response?.status < 600) {
          router.push(RouterPath.Error)
          return
        }

        if (_.isEqual(error.response?.data.code, APICommonCode.BadRequest)) {
          toast(t(`common.api.code.${error.response?.data.code}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
        }
      }
    } finally {
      isLoading(false)
    }
  }

  const calendarSetting = async (m: CalendarModel) => {
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
    await CreateSchedulesCSR({
      user_hash_keys: _.map(m.users, (item) => {
        return item.key
      }).join(','),
      freq_id: Number(m.type.value),
      interview_flg: InterviewerStatus.None,
      start: start,
      end: end,
      title: m.title,
    } as SchedulesRequest)
      .then(() => {
        toast(t('features.user.calendar.calendar') + t('common.toast.create'), {
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
      })
      .catch((error) => {
        if (
          _.every([500 <= error.response?.status, error.response?.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        if (_.isEqual(error.response?.data.code, APICommonCode.BadRequest)) {
          toast(t(`common.api.code.${error.response?.data.code}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
        }
      })
  }

  const deleteSchedule = async (id: string, date: Date) => {
    // API カレンダー削除
    await DeleteSchedulesCSR({ hash_key: id } as HashKeyRequest)
      .then(() => {
        toast(t('features.user.calendar.calendar') + t('common.toast.delete'), {
          style: {
            backgroundColor: setting.toastSuccessColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })

        setCurrentDate(date)
      })
      .catch((error) => {
        if (
          _.every([500 <= error.response?.status, error.response?.status < 600])
        ) {
          router.push(RouterPath.Error)
          return
        }

        if (_.isEqual(error.response?.data.code, APICommonCode.BadRequest)) {
          toast(t(`common.api.code.${error.response?.data.code}`), {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 500,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          })
        }
      })
  }

  useEffect(() => {
    if (isError) router.push(RouterPath.Error)
    search()
  }, [])

  return (
    <>
      <NextHead></NextHead>
      {_.every([!isError, !loading]) && (
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
                  users: _.map(obj.userHashKeys, (hash) => {
                    return {
                      key: hash,
                    } as SelectTitlesModel
                  }),
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
              users={_.map(users, (user) => {
                return {
                  key: user.hashKey,
                  title: user.name,
                  subTitle: user.email,
                } as SelectTitlesModel
              })}
              radios={api.scheduleList}
              isEdit={!_.isEmpty(model.start)}
              close={() => isOpen(false)}
              delete={async (id: string, date: Date) => {
                await deleteSchedule(id, date)
                await search()
              }}
              submit={async (m: CalendarModel) => {
                // TODO 絶対に編集用APIを作ること！(面倒なので一旦こうしてる)
                // 削除 → 登録にするとしても、1つのAPIで同一トランザクションにて処理したい
                if (!_.isEmpty(m.id)) await deleteSchedule(m.id, m.date)
                await calendarSetting(m)
                await search()
              }}
            ></CalendarModal>
          )}
        </>
      )}
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  let isError = false

  // API スケジュール登録種別一覧
  const scheduleList: ScheduleType[] = []
  await UserListScheduleTypeSSG().then((res) => {
    for (const item of res.data.list) {
      scheduleList.push({
        value: String(item.id),
        name: item[`name_${locale}`],
        freq: item.freq,
      } as ScheduleType)
    }
  })

  return {
    props: {
      api: {
        scheduleList: scheduleList,
      },
      isError,
      locale,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default UserCalendar
