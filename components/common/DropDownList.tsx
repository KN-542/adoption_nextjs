import { Color, Column, minW, ml, mr, w } from '@/styles/index'
import { SelectTitlesModel } from '@/types/index'
import {
  Autocomplete,
  Box,
  Chip,
  ListItem,
  TextField,
  createFilterOptions,
} from '@mui/material'
import _ from 'lodash'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { grey } from '@mui/material/colors'
import { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'

type Props = {
  list: SelectTitlesModel[]
  initList: SelectTitlesModel[]
  sx?: any
  icon?: JSX.Element
  onChange(value: SelectTitlesModel[]): void
}

const DropDownList = (props: Props) => {
  const setting = useSelector((state: RootState) => state.setting)

  return (
    <Autocomplete
      multiple
      sx={props.sx}
      options={_.filter(
        props.initList,
        (option) =>
          !_.includes(
            _.map(props.list, (s) => {
              return s.key
            }),
            option.key,
          ),
      )}
      getOptionLabel={(option) => option.title}
      renderOption={(propositions, option) => (
        <ListItem {...propositions} sx={[w(100)]}>
          {!_.isEmpty(props.icon) && <>{props.icon}</>}
          {_.isEmpty(props.icon) && (
            <AccountCircleIcon fontSize="large" sx={mr(2)} />
          )}
          <Box sx={[Column, w(100)]}>
            <Box sx={w(100)}>{option.title}</Box>
            {!_.isEmpty(option.subTitle) && (
              <Box sx={[w(100), ml(0.25), Color(grey[500]), { fontSize: 12 }]}>
                {option.subTitle}
              </Box>
            )}
          </Box>
        </ListItem>
      )}
      filterOptions={createFilterOptions({
        matchFrom: 'any',
        stringify: (option) => `${option.title} ${option.subTitle}`,
      })}
      value={props.list}
      onChange={(_e, value) => props.onChange(value)}
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
  )
}

export default DropDownList
