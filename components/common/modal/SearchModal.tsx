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
  Autocomplete,
  ListItem,
  Chip,
  createFilterOptions,
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
  Color,
  Column,
} from '@/styles/index'
import { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { SearchForm, SelectTitlesModel } from '@/types/index'
import { common, grey } from '@mui/material/colors'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

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
              <Box
                sx={[
                  FormModalMenu,
                  mt(_.size(props.searchObj.selectList) > 0 ? 4 : 0),
                ]}
              >
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
                      <Autocomplete
                        multiple
                        sx={[ml(4), mr(4), w(100)]}
                        options={_.filter(
                          item.items,
                          (option) =>
                            !_.includes(
                              _.map(item.selectedItems, (s) => {
                                return s.key
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
                              {!_.isEmpty(option.subTitle) && (
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
                        value={item.selectedItems}
                        onChange={(_e, value) =>
                          props.changeSearchObjByAutoComp(index, value)
                        }
                        renderTags={(value, getTagProps) =>
                          _.map(value, (option, index) => (
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
                            sx={[
                              mr(4),
                              w(100),
                              minW(500),
                              Color(setting.color),
                            ]}
                          />
                        )}
                      />
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
