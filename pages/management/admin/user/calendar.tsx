import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import rrulePlugin from '@fullcalendar/rrule'
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material'
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
import { every, some } from 'lodash'
import { CalendarInputsModel } from '@/types/management'

const UserCalendar = () => {
  const [events, setEvents] = useState([])
  const [open, setOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [clickedDate, setClickedDate] = useState<Date>(null)
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')

  const handleAddEvent = () => {
    if (!eventTitle || !clickedDate || !eventStartTime || !eventEndTime) {
      alert('Event title, date, or time is missing')
      return
    }

    // const newEvent = {
    //   id: Date.now().toString(),
    //   title: eventTitle,
    //   start: new Date(),
    //   allDay: false,
    // }
    // ここで繰り返しルールを設定
    const newEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      rrule: {
        freq: 'weekly',
        interval: 1,
        byweekday: ['th'], // ここを適切な曜日に変更
        dtstart: formatDate(new Date()),
      },
      duration: '01:00', // 1時間のイベント
    }

    setEvents((currentEvents) => [...currentEvents, newEvent])
  }

  const calendarSetting = async (model: CalendarInputsModel) => {
    const list = [...events]
    for (const item of model.titles) {
      list.push({
        id: Date.now().toString(), // TODO API後に
        title: `${model.start} ~ ${model.end}\n${item}`,
        start: model.date,
        allDay: true,
      })
    }

    setEvents(list)
  }

  return (
    <>
      <NextHead></NextHead>
      <Box sx={[w(90), M0Auto, CustomTableContainer(80), mt(12)]}>
        <FullCalendar
          plugins={[dayGridPlugin, rrulePlugin]}
          initialEvents={[]}
          locale={jaLocale}
          initialView="dayGridMonth"
          events={events}
          dayCellContent={(e) => {
            console.log(e)
            return (
              <Box
                className="day-cell-content"
                onClick={() => {
                  const today = new Date()
                  if (
                    some([
                      e.date.getFullYear() < today.getFullYear(),
                      e.date.getMonth() < today.getMonth(),
                      e.date.getDate() < today.getDate(),
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
        close={() => setOpen(false)}
        submit={calendarSetting}
      ></CalendarModal>
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
