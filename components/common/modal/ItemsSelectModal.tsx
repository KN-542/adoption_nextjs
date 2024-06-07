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
  Autocomplete,
  ListItem,
  TextField,
  Chip,
  createFilterOptions,
} from '@mui/material'
import { useTranslations } from 'next-intl'
import _ from 'lodash'
import {
  Bold,
  ButtonColor,
  Color,
  Column,
  DisplayFlex,
  FormModalMenu,
  FormTwoButtons,
  m,
  mb,
  minW,
  ml,
  mr,
  mt,
  w,
} from '@/styles/index'
import { useSelector } from 'react-redux'
import { common, grey } from '@mui/material/colors'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { RootState } from '@/hooks/store/store'
import { SelectTitlesModel } from '@/types/common/index'

type Props = {
  open: boolean
  items: SelectTitlesModel[]
  selectedItems: string[]
  title: string
  subTitle: string
  buttonTitle: string
  submit: (s: string[]) => void
  close: () => void
}

const ItemsSelectModal = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)

  const [loading, isLoading] = useState(true)

  const [options, setOptions] = useState<SelectTitlesModel[]>([])
  const [selectedOptions, setSelectedOptions] = useState<SelectTitlesModel[]>(
    [],
  )

  const submit = async () => {
    await props.submit(
      _.map(selectedOptions, (s) => {
        return s.key
      }),
    )

    setSelectedOptions([])

    props.close()
  }

  useEffect(() => {
    isLoading(true)
    setOptions(props.items)
    setSelectedOptions(
      _.filter(props.items, (option) =>
        _.includes(props.selectedItems, option.key),
      ),
    )
    isLoading(false)
  }, [props.selectedItems, props.items])

  return (
    <>
      {!loading && (
        <Dialog open={props.open} fullScreen sx={m(30)}>
          <DialogTitle component="div">
            <Typography variant="h4" sx={Bold}>
              {props.title}
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
                        {props.subTitle}
                      </Box>
                    </Box>
                    <Autocomplete
                      multiple
                      sx={[ml(4), mr(4), w(100)]}
                      options={_.filter(
                        options,
                        (option) =>
                          !_.includes(
                            _.map(selectedOptions, (item) => {
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
                      value={selectedOptions}
                      onChange={(_e, value) => setSelectedOptions(value)}
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
                          sx={[mr(4), w(100), minW(500), Color(setting.color)]}
                        />
                      )}
                    />
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
              <Button
                size="large"
                type="submit"
                variant="outlined"
                sx={[minW(180), ButtonColor(common.white, setting.color)]}
                onClick={submit}
              >
                {props.buttonTitle}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default ItemsSelectModal
