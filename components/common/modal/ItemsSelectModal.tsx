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
} from '@mui/material'
import { useTranslations } from 'next-intl'
import _ from 'lodash'
import {
  Bold,
  ButtonColor,
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
import { common } from '@mui/material/colors'
import { RootState } from '@/hooks/store/store'
import { Body, SelectTitlesModel, TableHeader } from '@/types/index'
import DropDownList from '../DropDownList'
import CustomTable from '../Table'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'

type Props = {
  open: boolean
  single?: boolean
  items: SelectTitlesModel[]
  headers?: TableHeader[]
  bodies?: Record<string, Body>[]
  selectedItems: string[]
  title: string
  subTitle: string
  buttonTitle: string
  msg: string
  icon?: JSX.Element
  w?: number
  m?: number
  submit: (s: string[] | string) => void
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
    if (_.isEmpty(selectedOptions)) {
      toast(props.subTitle + t('common.validate.requiredList'), {
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

    if (!_.isEqual(_.size(selectedOptions), 1)) {
      try {
        await props.submit(
          _.map(selectedOptions, (s) => {
            return s.key
          }),
        )

        setSelectedOptions([])

        props.close()
      } catch (_) {
        return
      }
    } else {
      try {
        await props.submit(selectedOptions[0].key)

        setSelectedOptions([])

        props.close()
      } catch (_) {
        return
      }
    }
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
        <Dialog open={props.open} fullScreen sx={[m(props.m ?? 20)]}>
          <DialogTitle component="div">
            <Typography variant="h4" sx={Bold}>
              {props.title}
            </Typography>
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Box>
              <Box sx={[mt(2), mb(4)]}>
                <Box component="span" sx={[ml(4), mr(4), mt(0.5)]}>
                  {props.msg}
                </Box>
              </Box>

              {_.every([
                !_.isEmpty(props.headers),
                !_.isEmpty(props.bodies),
              ]) && (
                <CustomTable
                  height={25}
                  w={props.w}
                  headers={props.headers}
                  bodies={props.bodies}
                  pageSize={_.size(props.bodies)}
                />
              )}

              <Box sx={FormModalMenu}>
                <Box sx={[DisplayFlex, w(90)]}>
                  <Box>
                    <Box sx={[mt(8), mb(1)]}>
                      <Box component="span" sx={[ml(4), mr(4), mt(0.5), Bold]}>
                        {props.subTitle}
                      </Box>
                    </Box>

                    <DropDownList
                      list={selectedOptions}
                      initList={options}
                      sx={[ml(4), mr(4), w(100)]}
                      icon={props.icon}
                      onChange={(value) =>
                        setSelectedOptions(
                          props.single ? [value.at(-1)] : value,
                        )
                      }
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
