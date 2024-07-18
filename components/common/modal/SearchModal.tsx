import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Divider,
  Box,
  TextField,
} from '@mui/material'
import { useTranslations } from 'next-intl'
import _ from 'lodash'
import {
  Bold,
  ButtonColor,
  FormThreeButtons,
  FormModalMenu,
  SearchModalSelect,
  SearchModalSelectButtonColor,
  SpaceBetween,
  mb,
  minW,
  ml,
  ModalResponsive,
  mr,
  mt,
  w,
  DisplayFlex,
  FontSize,
} from '@/styles/index'
import { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { SearchForm, SelectTitlesModel } from '@/types/index'
import { common } from '@mui/material/colors'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import DropDownList from '../DropDownList'
import { DateTimePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'

type Props = {
  open: boolean
  closeModal: () => void
  searchObj: SearchForm
  changeSearchObjBySelect(
    i: number,
    i2: number,
    i3: number,
    b: boolean,
    k: string,
  ): void
  selectInit: (i: number) => void
  initInputs: () => void
  changeSearchObjByText(i: number, value: string): void
  changeSearchObjByAutoComp(i: number, values: SelectTitlesModel[]): void
  changeSearchObjByFromDates(index: number, from: Dayjs): void
  changeSearchObjByToDates(index: number, to: Dayjs): void
  submit: (i?: number) => void
  changePage: (i: number) => void
}

const SearchModal = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [loading, isLoading] = useState(true)

  useEffect(() => {
    isLoading(false)
  }, [props.searchObj])

  return (
    <>
      {!loading && (
        <Dialog open={props.open} fullScreen sx={ModalResponsive}>
          <DialogTitle component="div">
            <Typography variant="h4" sx={Bold}>
              {t('common.title.modal.search')}
            </Typography>
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Box>
              <Box sx={FormModalMenu}>
                {_.map(props.searchObj.selectList, (item, index) => {
                  return (
                    <Box key={index}>
                      <Box sx={SpaceBetween}>
                        <Box
                          component="span"
                          sx={[ml(4), mr(4), mt(0.5), Bold]}
                        >
                          {item.name}
                        </Box>
                        <Button
                          variant="text"
                          sx={[
                            ml(4),
                            mr(4),
                            ButtonColor(setting.color, common.white),
                          ]}
                          onClick={() => {
                            props.selectInit(index)
                          }}
                        >
                          {t('common.search.initSelected')}
                        </Button>
                      </Box>
                      <Box sx={SearchModalSelect}>
                        {_.map(item.list, (option, index2) => (
                          <Box key={index2}>
                            <Button
                              fullWidth
                              sx={SearchModalSelectButtonColor(
                                option.isSelected,
                                setting.color,
                                common.white,
                              )}
                              onClick={() => {
                                props.changeSearchObjBySelect(
                                  index,
                                  index2,
                                  option.id,
                                  item.isRadio,
                                  option.key,
                                )
                              }}
                            >
                              {option.value}
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )
                })}
              </Box>

              <Box
                sx={[
                  FormModalMenu,
                  mt(_.size(props.searchObj.selectList) > 0 ? 4 : 0),
                ]}
              >
                {_.map(props.searchObj.textForm, (item, index) => {
                  return (
                    <Box key={index} sx={w(40)}>
                      <Box sx={[SpaceBetween, w(100)]}>
                        <Box
                          component="span"
                          sx={[ml(4), mr(4), mt(0.5), Bold]}
                        >
                          {item.name}
                        </Box>
                      </Box>
                      <TextField
                        fullWidth
                        sx={[ml(4), mr(4)]}
                        value={item.value}
                        onChange={(e) =>
                          props.changeSearchObjByText(index, e.target.value)
                        }
                      ></TextField>
                    </Box>
                  )
                })}
              </Box>

              <Box sx={[FormModalMenu, mt(4)]}>
                {_.map(props.searchObj.autoCompForm, (item, index) => {
                  return (
                    <Box key={index} sx={w(40)}>
                      <Box sx={[SpaceBetween, w(100)]}>
                        <Box
                          component="span"
                          sx={[ml(4), mr(4), mt(0.5), Bold]}
                        >
                          {item.name}
                        </Box>
                      </Box>
                      <DropDownList
                        list={item.selectedItems}
                        initList={item.items}
                        sx={[ml(4), mr(4), w(100)]}
                        onChange={(value) =>
                          props.changeSearchObjByAutoComp(index, value)
                        }
                      />
                    </Box>
                  )
                })}
              </Box>

              <Box sx={[FormModalMenu, mt(4)]}>
                {_.map(props.searchObj.dates, (item, index) => {
                  return (
                    <Box key={index} sx={[w(40)]}>
                      <Box sx={[SpaceBetween, w(100)]}>
                        <Box
                          component="span"
                          sx={[ml(4), mr(4), mt(0.5), Bold]}
                        >
                          {item.name}
                        </Box>
                      </Box>
                      <Box sx={DisplayFlex}>
                        <DateTimePicker
                          value={dayjs(item.from)}
                          format={item.format}
                          views={item.views}
                          sx={[ml(4), mr(4), w(50)]}
                          ampm={false}
                          skipDisabled
                          onChange={(value: Dayjs | null) => {
                            props.changeSearchObjByFromDates(index, value)
                          }}
                          slots={{
                            textField: (params) => (
                              <TextField
                                {...params}
                                InputProps={{
                                  ...params.InputProps,
                                  readOnly: true,
                                }}
                                sx={[ml(4), mr(4), w(50)]}
                                error={false}
                              />
                            ),
                          }}
                        />
                        <Box sx={[ml(2), mr(2), FontSize(32)]}>{'~'}</Box>
                        <DateTimePicker
                          value={dayjs(item.to)}
                          format={item.format}
                          views={item.views}
                          sx={[ml(4), mr(4), w(50)]}
                          ampm={false}
                          skipDisabled
                          onChange={(value: Dayjs | null) => {
                            props.changeSearchObjByToDates(index, value)
                          }}
                          slots={{
                            textField: (params) => (
                              <TextField
                                {...params}
                                InputProps={{
                                  ...params.InputProps,
                                  readOnly: true,
                                }}
                                sx={[ml(4), mr(4), w(50)]}
                                error={false}
                              />
                            ),
                          }}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </DialogContent>

          <Divider sx={mb(2)} />

          <DialogActions sx={[mr(2), mb(2)]}>
            <Box sx={FormThreeButtons}>
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                sx={minW(180)}
                onClick={props.closeModal}
              >
                {t('common.button.cancel')}
              </Button>
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                sx={[
                  minW(180),
                  ButtonColor(common.white, setting.toastErrorColor),
                ]}
                onClick={props.initInputs}
              >
                {t('common.button.init')}
              </Button>
              <Button
                size="large"
                variant="outlined"
                sx={[minW(180), ButtonColor(common.white, setting.color)]}
                onClick={async () => {
                  if (!_.isEmpty(props.searchObj.dates)) {
                    for (const item of props.searchObj.dates) {
                      if (
                        _.some([
                          _.isEqual(
                            new Date(item.from).getTime(),
                            new Date(null).getTime(),
                          ),
                          _.isEqual(
                            new Date(item.to).getTime(),
                            new Date(null).getTime(),
                          ),
                        ])
                      )
                        continue

                      if (
                        new Date(item.to).getTime() <
                        new Date(item.from).getTime()
                      ) {
                        toast(
                          `${item.name}${t(
                            'common.validate.correlation.dates',
                          )}`,
                          {
                            style: {
                              backgroundColor: setting.toastErrorColor,
                              color: common.white,
                              width: 500,
                            },
                            position: 'bottom-left',
                            hideProgressBar: true,
                            closeButton: () => <ClearIcon />,
                          },
                        )
                        return
                      }
                    }
                  }

                  props.changePage(1)
                  await props.submit(1)
                  props.closeModal()
                }}
              >
                <ManageSearchIcon sx={mr(0.25)} />
                {t('common.button.search')}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default SearchModal
