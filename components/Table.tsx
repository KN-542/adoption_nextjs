import * as React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/hooks/store/store'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Checkbox from '@mui/material/Checkbox'
import { useTranslations } from 'next-intl'
import { TableHeader, TableSort } from '@/types/management'
import { isEmpty, isEqual, keys, map, size } from 'lodash'
import {
  Cell,
  ColorWhite,
  M0Auto,
  mb,
  minW,
  mt,
  TableHeaderSX,
  TextCenter,
  hBlock,
  w,
  ml,
  Bold,
} from '@/styles/index'
import { common } from '@mui/material/colors'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useState } from 'react'
import { Button } from '@mui/material'

type Props = {
  headers: TableHeader[]
  bodies: Record<string, any>[]
  isCheckbox?: boolean
  changeTarget: (s: TableSort) => void
  search: () => void
}

const CustomTable = (props: Props) => {
  const t = useTranslations()
  const setting = useSelector((state: RootState) => state.management.setting)

  const [selected, setSelected] = useState<string[]>([])

  const isSelected = (name: string) => selected.indexOf(name) !== -1

  return (
    <>
      {size(props.bodies) > 0 && (
        <Box sx={[w(90), M0Auto]}>
          <Paper sx={[mb(2)]}>
            <TableContainer sx={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <Table sx={minW(750)} aria-labelledby="tableTitle" size="medium">
                <TableHead sx={TableHeaderSX}>
                  <TableRow>
                    {props.isCheckbox && (
                      <TableCell
                        sx={[
                          Cell,
                          {
                            backgroundColor: setting.color,
                          },
                        ]}
                      ></TableCell>
                    )}
                    <TableCell
                      sx={[
                        Cell,
                        {
                          backgroundColor: setting.color,
                        },
                      ]}
                    ></TableCell>
                    {map(props.headers, (header) => (
                      <TableCell
                        key={header.id}
                        align="left"
                        padding="none"
                        sx={[ColorWhite, { bgcolor: setting.color }]}
                      >
                        {!isEmpty(header.sort) && (
                          <>
                            {!header.sort.target && (
                              <Button
                                variant="text"
                                sx={[
                                  ColorWhite,
                                  {
                                    padding: 0,
                                  },
                                ]}
                                onClick={async () => {
                                  props.changeTarget(header.sort)
                                  await props.search()
                                }}
                              >
                                {header.name}
                                <ArrowDropUpIcon
                                  sx={[
                                    ml(0.25),
                                    {
                                      backgroundColor: setting.color,
                                      padding: 0,
                                      minWidth: 10,
                                      ml: 1,
                                      mr: 0,
                                    },
                                  ]}
                                />
                              </Button>
                            )}
                            {header.sort.target && (
                              <Button
                                variant="text"
                                sx={[
                                  ColorWhite,
                                  Bold,
                                  {
                                    padding: 0,
                                  },
                                ]}
                                onClick={async () => {
                                  props.changeTarget(header.sort)
                                  await props.search()
                                }}
                              >
                                {header.name}
                                {header.sort.isAsc ? (
                                  <ArrowDropUpIcon
                                    sx={[
                                      ml(0.25),
                                      {
                                        backgroundColor: setting.color,
                                        padding: 0,
                                        minWidth: 10,
                                        ml: 1,
                                        mr: 0,
                                      },
                                    ]}
                                  />
                                ) : (
                                  <ArrowDropDownIcon
                                    sx={[
                                      ml(0.25),
                                      {
                                        backgroundColor: setting.color,
                                        padding: 0,
                                        minWidth: 10,
                                        ml: 1,
                                        mr: 0,
                                      },
                                    ]}
                                  />
                                )}
                              </Button>
                            )}
                          </>
                        )}
                        {isEmpty(header.sort) && <>{header.name}</>}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {map(props.bodies, (row, index) => {
                    const isItemSelected = isSelected(String(row.name))

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={index}
                        selected={isItemSelected}
                      >
                        {props.isCheckbox && (
                          <TableCell
                            padding="checkbox"
                            sx={[
                              hBlock(75),
                              ColorWhite,
                              { bgcolor: common.white },
                            ]}
                          >
                            <Checkbox
                              style={{ color: setting.color }}
                              checked={isItemSelected}
                              inputProps={{
                                'aria-labelledby': `enhanced-table-checkbox-${index}`,
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell padding="none"></TableCell>
                        {map(keys(row), (item, index2) => {
                          return (
                            <TableCell
                              component="th"
                              scope="row"
                              padding="none"
                              key={index2}
                              sx={hBlock(75)}
                            >
                              {isEmpty(row.item) && row[item]}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
      {isEqual(size(props.bodies), 0) && (
        <Box fontSize={60} sx={[TextCenter, mt(30)]}>
          {t('common.table.none')}
        </Box>
      )}
    </>
  )
}

export default CustomTable
