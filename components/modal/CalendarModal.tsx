import { RootState } from '@/hooks/store/store'
import {
  Bold,
  ButtonColor,
  DisplayFlex,
  FormModalMenu,
  FormTwoButtons,
  mb,
  minW,
  ml,
  modalResponsive,
  mr,
  mt,
  w,
} from '@/styles/index'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { common } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { useSelector } from 'react-redux'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect } from 'react'
import { filter, map } from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import ErrorHandler from '@/components/ErrorHandler'
import { ValidationType } from '@/enum/validation'
import { FormValidation } from '@/hooks/validation'
import { Time15 } from '@/hooks/common'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { CalendarInputsModel } from '@/types/management'

type Props = {
  open: boolean
  model?: CalendarInputsModel
  close: () => void
  submit: (model: CalendarInputsModel) => void
}

type Inputs = {
  date: Dayjs
  start: string
  end: string
  titles: string[]
}

const time15: string[] = Time15()
const time15Start: string[] = filter(
  time15,
  (item) => Number(item.split(':')[0]) < 24,
)

const timeCheck = (time: string, targetTime: string): boolean => {
  const targetHour = Number(targetTime.split(':')[0])
  const targetMinute = Number(targetTime.split(':')[1])
  const hour = Number(time.split(':')[0])
  const minute = Number(time.split(':')[1])
  if (hour < targetHour) return false
  if (hour > targetHour) return true
  return minute > targetMinute
}

const CalendarModal = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.management.setting)

  const formValidation: FormValidation = {
    date: [
      {
        type: ValidationType.Required,
        message:
          t('management.features.user.calendar.modal.date') +
          t('common.validate.required'),
      },
    ],
    start: [
      {
        type: ValidationType.Required,
        message:
          t('management.features.user.calendar.modal.start') +
          t('common.validate.required'),
      },
    ],
    end: [
      {
        type: ValidationType.Required,
        message:
          t('management.features.user.calendar.modal.start') +
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
    if (timeCheck(d.start, d.end)) {
      toast(t('management.features.user.calendar.modal.msgStartEnd'), {
        style: {
          backgroundColor: setting.toastErrorColor,
          color: common.white,
          width: 600,
        },
        position: 'bottom-left',
        hideProgressBar: true,
        closeButton: () => <ClearIcon />,
      })
      return
    }

    await props.submit({
      date: new Date(d.date.year(), d.date.month(), d.date.date()),
      start: d.start,
      end: d.end,
      titles: d.titles,
    } as CalendarInputsModel)
  }

  useEffect(() => {
    setValue('date', dayjs(props.model.date))
    setValue('start', time15Start[0])
    setValue('end', time15[0])
    setValue('titles', ['まみむめも企画室', '鬼人事部']) // TODO
  }, [props.model.date])

  return (
    <Dialog
      open={props.open}
      fullScreen
      sx={modalResponsive}
      component="form"
      onSubmit={handleSubmit(submit)}
    >
      <DialogTitle component="div">
        <Typography variant="h4" sx={Bold}>
          {t('common.title.modal.calendar')}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box>
          <Box sx={FormModalMenu}>
            <Box sx={[DisplayFlex, w(90)]}>
              <Box>
                <Box sx={[mb(1)]}>
                  <Box component="span" sx={[ml(4), mr(4), mt(0.5), Bold]}>
                    {t('management.features.user.calendar.modal.date')}
                  </Box>
                </Box>
                <DateTimePicker
                  value={watch('date')}
                  {...register('date', {
                    required: true,
                  })}
                  aria-invalid={errors.date ? 'true' : 'false'}
                  sx={[ml(4), mr(4)]}
                  format="YYYY/MM/DD"
                  ampm={false}
                  skipDisabled
                  views={['year', 'month', 'day']}
                  disablePast
                  onChange={(value: Dayjs | null) => setValue('date', value)}
                />
                <Box sx={[ml(4), mr(4)]}>
                  <ErrorHandler
                    validations={formValidation.date}
                    type={errors.date?.type}
                  ></ErrorHandler>
                </Box>
              </Box>
              <Box>
                <Box sx={[mb(1)]}>
                  <Box component="span" sx={[ml(4), mr(16), mt(0.5), Bold]}>
                    {t('management.features.user.calendar.modal.start')}
                  </Box>
                </Box>
                <Select
                  value={watch('start')}
                  {...register('start', {
                    required: true,
                  })}
                  aria-invalid={errors.start ? 'true' : 'false'}
                  sx={[ml(4), mr(16), w(80)]}
                  onChange={(e) => setValue('start', e.target.value)}
                >
                  {map(time15Start, (time, index) => (
                    <MenuItem key={index} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
                <Box sx={[ml(4), mr(4)]}>
                  <ErrorHandler
                    validations={formValidation.start}
                    type={errors.start?.type}
                  ></ErrorHandler>
                </Box>
              </Box>
              <Box>
                <Box sx={[mb(1)]}>
                  <Box component="span" sx={[ml(4), mr(16), mt(0.5), Bold]}>
                    {t('management.features.user.calendar.modal.end')}
                  </Box>
                </Box>
                <Select
                  value={watch('end')}
                  {...register('end', {
                    required: true,
                  })}
                  aria-invalid={errors.end ? 'true' : 'false'}
                  sx={[ml(4), mr(16), w(80)]}
                  onChange={(e) => setValue('end', e.target.value)}
                >
                  {map(time15, (time, index) => (
                    <MenuItem key={index} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
                <Box sx={[ml(4), mr(4)]}>
                  <ErrorHandler
                    validations={formValidation.end}
                    type={errors.end?.type}
                  ></ErrorHandler>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <Divider sx={mb(2)} />

      <DialogActions sx={[mr(2), mb(2)]}>
        <Box sx={FormTwoButtons}>
          <Button
            size="large"
            variant="outlined"
            color="inherit"
            sx={minW(180)}
            onClick={props.close}
          >
            {t('common.button.cancel')}
          </Button>
          <Button
            size="large"
            type="submit"
            variant="outlined"
            sx={[minW(180), ButtonColor(common.white, setting.color)]}
            onClick={async () => {
              props.close()
            }}
          >
            <CalendarMonthIcon sx={mr(0.25)}></CalendarMonthIcon>
            {t('management.features.user.calendar.modal.create')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default CalendarModal
