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
import NextHead from '@/components/Header'
import jaLocale from '@fullcalendar/core/locales/ja'
import { formatDate } from '@/hooks/common'
import CalendarModal from '@/components/modal/CalendarModal'
import { every, forEach, isEmpty, isEqual, map, some } from 'lodash'
import {
  CalendarInputsModel,
  CalendarTitlesModel,
  UserGroupTableBody,
  UsersTableBody,
} from '@/types/management'
import { SearchUserGroupCSR, UserListCSR } from '@/api/repository'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { RouterPath } from '@/enum/router'
import { APICommonCode } from '@/enum/apiError'
import { toast } from 'react-toastify'
import { common } from '@mui/material/colors'
import ClearIcon from '@mui/icons-material/Clear'

const UserCalendar = ({ isError, locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.management.setting)

  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [clickedDate, setClickedDate] = useState<Date>(null)
  const [users, setUsers] = useState<(UsersTableBody | UserGroupTableBody)[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)

  const search = async () => {
    setIsLoading(true)
    // API ユーザー一覧
    const list: (UsersTableBody | UserGroupTableBody)[] = []
    await UserListCSR()
      .then(async (res) => {
        forEach(res.data.users, (u, _) => {
          list.push({
            hashKey: u.hash_key,
            name: u.name,
            mail: u.email,
          } as UsersTableBody)
        })

        // API ユーザーグループ一覧
        await SearchUserGroupCSR()
          .then((res2) => {
            forEach(res2.data.user_groups, (u, _) => {
              list.push({
                hashKey: u.hash_key,
                name: u.name,
                mail: '',
              } as UserGroupTableBody)
            })
            setUsers(list)
            setIsLoading(false)
          })
          .catch((error) => {
            if (
              every([500 <= error.response.status, error.response.status < 600])
            ) {
              router.push(RouterPath.ManagementError)
              return
            }

            if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
              toast(t(`common.api.code.${error.response.data.code}`), {
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
      })
      .catch((error) => {
        if (
          every([500 <= error.response.status, error.response.status < 600])
        ) {
          router.push(RouterPath.ManagementError)
          return
        }

        if (isEqual(error.response.data.code, APICommonCode.BadRequest)) {
          toast(t(`common.api.code.${error.response.data.code}`), {
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

  const handleAddEvent = () => {
    // const newEvent = {
    //   id: Date.now().toString(),
    //   title: eventTitle,
    //   start: new Date(),
    //   allDay: false,
    // }
    // ここで繰り返しルールを設定
    // const newEvent = {
    //   id: Date.now().toString(),
    //   title: eventTitle,
    //   rrule: {
    //     freq: 'weekly',
    //     interval: 1,
    //     byweekday: ['th'], // ここを適切な曜日に変更
    //     dtstart: formatDate(new Date()),
    //   },
    //   duration: '01:00', // 1時間のイベント
    // }
    // setEvents((currentEvents) => [...currentEvents, newEvent])
  }

  const calendarSetting = async (m: CalendarInputsModel) => {
    const list = [...events]
    for (const item of m.titles) {
      list.push({
        id: 'TODO', // TODO API後に
        title: `${m.start}~${m.end}\n${item.title}`,
        start: m.date,
        allDay: true,
      })
    }

    setEvents(list)
    setOpen(false)
    setCurrentDate(m.date)
  }

  useEffect(() => {
    if (isError) router.push(RouterPath.ManagementError)
    search()
  }, [])

  return (
    <>
      <NextHead></NextHead>
      {every([!isError, !isLoading]) && (
        <>
          <Box sx={[w(90), M0Auto, CustomTableContainer(80), mt(12)]}>
            <FullCalendar
              plugins={[dayGridPlugin, rrulePlugin]}
              initialEvents={[]}
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
                        some([
                          e.date.getFullYear() < today.getFullYear(),
                          every([
                            isEqual(e.date.getFullYear(), today.getFullYear()),
                            e.date.getMonth() < today.getMonth(),
                          ]),
                          every([
                            isEqual(e.date.getFullYear(), today.getFullYear()),
                            isEqual(e.date.getMonth(), today.getMonth()),
                            e.date.getDate() < today.getDate(),
                          ]),
                        ])
                      )
                        return
                      setClickedDate(e.date)
                      setOpen(true)
                    }}
                    sx={[h(100), CursorPointer]}
                  >
                    {e.dayNumberText}
                  </Box>
                )
              }}
              contentHeight={667}
              key={events.length}
              eventClick={(eventInfo) => {
                console.log('Title:', eventInfo.event.title)
                console.log('Start:', eventInfo.event.start.toISOString())
                if (eventInfo.event.end) {
                  console.log('End:', eventInfo.event.end.toISOString())
                } else {
                  console.log('End: Not specified')
                }

                setEvents([])
              }}
            />
          </Box>
          <CalendarModal
            open={open}
            model={{ date: clickedDate } as CalendarInputsModel}
            titles={map(users, (user) => {
              return {
                key: user.hashKey,
                title: user.name,
                subTitle: user.mail,
              } as CalendarTitlesModel
            })}
            close={() => setOpen(false)}
            submit={calendarSetting}
          ></CalendarModal>
        </>
      )}
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  let isError = false

  return {
    props: {
      api: {},
      isError,
      locale,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default UserCalendar
