import { RootState } from '@/hooks/store/store'
import {
  Bold,
  ButtonColor,
  Color,
  Column,
  DisplayFlex,
  FormModalMenu,
  FormTwoButtons,
  mb,
  minW,
  ml,
  ModalResponsive,
  mr,
  mt,
  w,
} from '@/styles/index'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  ListItem,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  createFilterOptions,
} from '@mui/material'
import { common, grey } from '@mui/material/colors'
import { useTranslations } from 'next-intl'
import { useSelector } from 'react-redux'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import {
  every,
  filter,
  find,
  includes,
  isEmpty,
  isEqual,
  map,
  trim,
} from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import ErrorHandler from '@/components/common/ErrorHandler'
import { ValidationType } from '@/enum/validation'
import { FormValidation, FormValidationValue } from '@/hooks/validation'
import { Time15 } from '@/hooks/common'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { CalendarModel, SelectTitlesModel, ScheduleType } from '@/types/index'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

type Props = {
  open: boolean
  model?: CalendarModel
  users: SelectTitlesModel[]
  radios?: ScheduleType[]
  isEdit: boolean
  close: () => void
  delete: (id: string, date: Date) => void
  submit: (model: CalendarModel) => void
}

type Inputs = {
  date: Dayjs
  title: string
  start: string
  end: string
  type: string
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

const formValidationValue: FormValidationValue = {
  title: {
    max: 30,
  },
}

const CalendarModal = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [options, _] = useState<SelectTitlesModel[]>(props.users)
  const [selectedOptions, setSelectedOptions] = useState<SelectTitlesModel[]>(
    filter(props.users, (option) =>
      includes(
        map(props.model.users, (item) => {
          return item.key
        }),
        option.key,
      ),
    ),
  )
  const [loading, isLoading] = useState(true)

  const formValidation: FormValidation = {
    date: [
      {
        type: ValidationType.Required,
        message:
          t('features.user.schedule.modal.date') +
          t('common.validate.required'),
      },
    ],
    title: [
      {
        type: ValidationType.Required,
        message:
          t('features.user.schedule.modal.title') +
          t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.user.schedule.modal.title') +
          t('common.validate.is') +
          String(formValidationValue.title.max) +
          t('common.validate.maxLength'),
      },
    ],
    start: [
      {
        type: ValidationType.Required,
        message:
          t('features.user.schedule.modal.start') +
          t('common.validate.required'),
      },
    ],
    end: [
      {
        type: ValidationType.Required,
        message:
          t('features.user.schedule.modal.end') + t('common.validate.required'),
      },
    ],
    type: [
      {
        type: ValidationType.Required,
        message:
          t('features.user.schedule.modal.type') +
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
      toast(t('features.user.schedule.modal.msgStartEnd'), {
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

    if (isEmpty(selectedOptions)) {
      toast(t('features.user.schedule.modal.msgNoExistUser'), {
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
      id: props.isEdit ? props.model.id : '',
      date: new Date(d.date.year(), d.date.month(), d.date.date()),
      start: d.start,
      end: d.end,
      title: d.title,
      users: selectedOptions,
      type: find(props.radios, (radio) => isEqual(radio.value, d.type)),
    } as CalendarModel)

    setSelectedOptions([])

    props.close()
  }

  useEffect(() => {
    isLoading(true)
    setValue('date', dayjs(props.model.date))
    setValue('title', props.model.title ?? '')
    setValue('start', props.model.start ?? time15Start[0])
    setValue('end', props.model.end ?? time15[0])
    setValue('type', props.model.type?.value ?? props.radios[0].value)
    isLoading(false)
  }, [props.model])

  return (
    <>
      {!loading && (
        <Dialog
          open={props.open}
          fullScreen
          sx={ModalResponsive}
          component="form"
          onSubmit={handleSubmit(submit)}
        >
          <DialogTitle component="div">
            <Typography variant="h4" sx={Bold}>
              {t(
                `common.title.modal.schedule.${
                  props.isEdit ? 'edit' : 'create'
                }`,
              )}
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
                        {t('features.user.schedule.modal.date')}
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
                      onChange={(value: Dayjs | null) =>
                        setValue('date', value)
                      }
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
                        {t('features.user.schedule.modal.start')}
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
                        {t('features.user.schedule.modal.end')}
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
                <Box sx={[DisplayFlex, w(90)]}>
                  <Box>
                    <Box sx={[mb(1)]}>
                      <Box component="span" sx={[ml(4), mr(16), mt(0.5), Bold]}>
                        {t('features.user.schedule.modal.title')}
                      </Box>
                    </Box>
                    <TextField
                      margin="none"
                      sx={[ml(4), mr(16), w(100)]}
                      {...register('title', {
                        required: true,
                        maxLength: formValidationValue.title.max,
                        setValueAs: (value) => trim(value),
                      })}
                      aria-invalid={errors.title ? 'true' : 'false'}
                    />
                    <Box sx={[ml(4), mr(4)]}>
                      <ErrorHandler
                        validations={formValidation.title}
                        type={errors.title?.type}
                      ></ErrorHandler>
                    </Box>
                  </Box>
                </Box>
                <Box sx={[DisplayFlex, w(90)]}>
                  <Box>
                    <Box sx={[mb(1)]}>
                      <Box component="span" sx={[ml(4), mr(4), mt(0.5), Bold]}>
                        {t('features.user.schedule.modal.user')}
                      </Box>
                    </Box>
                    <Autocomplete
                      multiple
                      sx={[ml(4), mr(4), w(100)]}
                      options={filter(
                        options,
                        (option) =>
                          !includes(
                            map(selectedOptions, (item) => {
                              return item.key
                            }),
                            option.key,
                          ),
                      )}
                      getOptionLabel={(option) => option.title}
                      renderOption={(props, option) => (
                        <ListItem {...props} sx={[w(100)]}>
                          <AccountCircleIcon fontSize="large" sx={mr(2)} />
                          <Box sx={[Column, w(100)]}>
                            <Box sx={w(100)}>{option.title}</Box>
                            {!isEmpty(option.subTitle) && (
                              <Box
                                sx={[
                                  w(100),
                                  ml(0.25),
                                  Color(grey[500]),
                                  { fontSize: 12 },
                                ]}
                              >
                                {option.subTitle}
                              </Box>
                            )}
                          </Box>
                        </ListItem>
                      )}
                      filterOptions={createFilterOptions({
                        matchFrom: 'any',
                        stringify: (option) =>
                          `${option.title} ${option.subTitle}`,
                      })}
                      value={selectedOptions}
                      onChange={(_e, value) => setSelectedOptions(value)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option.title}
                            {...getTagProps({ index })}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={[mr(4), w(100), minW(500), Color(setting.color)]}
                        />
                      )}
                    />
                  </Box>
                </Box>
                <Box sx={[DisplayFlex, w(90)]}>
                  <Box>
                    <Box sx={[mb(1)]}>
                      <Box component="span" sx={[ml(4), mr(4), mt(0.5), Bold]}>
                        {t('features.user.schedule.modal.type')}
                      </Box>
                    </Box>
                    <RadioGroup
                      aria-invalid={errors.type ? 'true' : 'false'}
                      row
                      aria-label="position"
                      name="type"
                      value={watch('type') || ''}
                      className="form-radio"
                      sx={[ml(4), mr(4), mt(0.5), w(100)]}
                    >
                      {map(props.radios, (item, idx) => {
                        return (
                          <FormControlLabel
                            key={idx}
                            color={setting.color}
                            value={item.value}
                            checked={isEqual(item.value, watch('type'))}
                            control={
                              <Radio
                                {...register('type', {
                                  required: true,
                                })}
                                style={{ color: setting.color }}
                                value={item.value}
                              />
                            }
                            label={item.name}
                          />
                        )
                      })}
                    </RadioGroup>
                    <Box sx={[ml(4), mr(4)]}>
                      <ErrorHandler
                        validations={formValidation.role}
                        type={errors.type?.type}
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
                onClick={() => {
                  setSelectedOptions([])
                  props.close()
                }}
              >
                {t('common.button.cancel')}
              </Button>
              {every([props.isEdit, !isEmpty(props.model.id)]) && (
                <Button
                  size="large"
                  variant="outlined"
                  sx={[
                    minW(180),
                    ButtonColor(common.white, setting.toastErrorColor),
                  ]}
                  onClick={async () => {
                    await props.delete(props.model.id, props.model.date)
                    setSelectedOptions([])
                    props.close()
                  }}
                >
                  {t(`common.title.modal.schedule.delete`)}
                </Button>
              )}
              <Button
                size="large"
                type="submit"
                variant="outlined"
                sx={[minW(180), ButtonColor(common.white, setting.color)]}
              >
                <CalendarMonthIcon sx={mr(0.25)}></CalendarMonthIcon>
                {t(
                  `common.title.modal.schedule.${
                    props.isEdit ? 'edit' : 'create'
                  }`,
                )}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default CalendarModal
