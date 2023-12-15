import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Divider,
  Box,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { useTranslations } from 'next-intl'
import _, { map } from 'lodash'
import {
  Bold,
  ButtonColor,
  FormThreeButtons,
  SearchModalMenu,
  SearchModalSelect,
  SearchModalSelectButtonColor,
  mb,
  minW,
  ml,
  modalResponsive,
  mr,
} from '@/styles/index'
import { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { SearchForm } from '@/types/management'
import { common } from '@mui/material/colors'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'

type Props = {
  open: boolean
  closeModal: () => void
  searchObj: SearchForm
  changeSearchObjBySelect(i: number, i2: number, i3: number): void
  selectInit: () => void
  submit: () => void
}

const SearchModal = (props: Props) => {
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.management.setting)

  return (
    <Dialog open={props.open} fullScreen sx={modalResponsive}>
      <DialogTitle component="div">
        <Typography variant="h4" sx={Bold}>
          {t('common.title.modal.search')}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box>
          <Box sx={SearchModalMenu}>
            {map(props.searchObj.selectList, (item, index) => {
              return (
                <Box key={index}>
                  <Box component="span" sx={[ml(4), mr(4), mb(1), Bold]}>
                    {item.name}
                  </Box>
                  <Box sx={SearchModalSelect}>
                    {map(item.list, (option, index2) => (
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
            sx={[minW(180), ButtonColor(common.white, setting.toastErrorColor)]}
            onClick={props.selectInit}
          >
            {t('management.features.applicant.searchModal.initButton')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            sx={[minW(180), ButtonColor(common.white, setting.color)]}
            onClick={async () => {
              await props.submit()
              props.closeModal()
            }}
          >
            <ManageSearchIcon sx={mr(0.25)} />
            {t('common.button.search')}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default SearchModal
