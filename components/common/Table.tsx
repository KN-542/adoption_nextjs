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
import {
  Body,
  CheckboxPropsField,
  Icons,
  TableHeader,
  TableSort,
} from '@/types/index'
import _ from 'lodash'
import {
  Cell,
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
  CustomTableContainer,
  BackGroundColor,
  Color,
  Padding,
  CustomTableIcon,
  ButtonColor,
} from '@/styles/index'
import { common } from '@mui/material/colors'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Button } from '@mui/material'

type Props = {
  height: number
  isNoContent: boolean
  headers: TableHeader[]
  bodies: Record<string, Body>[]
  pageSize: number
  icons?: Icons[]
  checkbox?: CheckboxPropsField
  changeTarget?: (s: TableSort) => void
  search?: (i: number, i2: number) => void
  changePage?: (i: number) => void
}

const CustomTable = (props: Props) => {
  const t = useTranslations()
  const setting = useSelector((state: RootState) => state.setting)

  return (
    <>
      {_.size(props.bodies) > 0 && (
        <Box sx={[w(90), M0Auto]}>
          <Paper sx={[mb(2)]}>
            <TableContainer sx={CustomTableContainer(props.height)}>
              <Table sx={minW(750)} aria-labelledby="tableTitle" size="medium">
                <TableHead sx={TableHeaderSX}>
                  <TableRow>
                    {!_.isEmpty(props.checkbox?.checkedList) && (
                      <TableCell sx={[Cell, BackGroundColor(setting.color)]}>
                        <Checkbox
                          style={Color(common.white)}
                          checked={_.isEqual(
                            _.size(props.bodies),
                            _.size(
                              _.filter(
                                props.checkbox?.checkedList,
                                (item) => item.checked,
                              ),
                            ),
                          )}
                          onClick={() => {
                            props.checkbox?.onClickAll(
                              !_.isEqual(
                                _.size(props.bodies),
                                _.size(
                                  _.filter(
                                    props.checkbox?.checkedList,
                                    (item) => item.checked,
                                  ),
                                ),
                              ),
                            )
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell
                      sx={[Cell, BackGroundColor(setting.color)]}
                    ></TableCell>
                    {_.map(props.headers, (header, index) => (
                      <TableCell
                        key={index}
                        align="left"
                        padding="none"
                        sx={[
                          Color(common.white),
                          BackGroundColor(setting.color),
                        ]}
                      >
                        {!_.isEmpty(header.sort) && (
                          <>
                            {!header.sort.target && (
                              <Button
                                variant="text"
                                sx={[Color(common.white), Padding(0)]}
                                onClick={async () => {
                                  props.changePage(1)
                                  props.changeTarget(header.sort)
                                  await props.search(1, props.pageSize)
                                }}
                              >
                                {header.name}
                                <ArrowDropUpIcon
                                  sx={[
                                    ml(0.25),
                                    BackGroundColor(setting.color),
                                    CustomTableIcon,
                                  ]}
                                />
                              </Button>
                            )}
                            {header.sort.target && (
                              <Button
                                variant="text"
                                sx={[Color(common.white), Bold, Padding(0)]}
                                onClick={async () => {
                                  props.changePage(1)
                                  props.changeTarget(header.sort)
                                  await props.search(1, props.pageSize)
                                }}
                              >
                                {header.name}
                                {header.sort.isAsc ? (
                                  <ArrowDropUpIcon
                                    sx={[
                                      ml(0.25),
                                      BackGroundColor(setting.color),
                                      CustomTableIcon,
                                    ]}
                                  />
                                ) : (
                                  <ArrowDropDownIcon
                                    sx={[
                                      ml(0.25),
                                      BackGroundColor(setting.color),
                                      CustomTableIcon,
                                    ]}
                                  />
                                )}
                              </Button>
                            )}
                          </>
                        )}
                        {_.isEmpty(header.sort) && <>{header.name}</>}
                      </TableCell>
                    ))}
                    {!_.isEmpty(props.icons) && (
                      <TableCell
                        key={''}
                        align="right"
                        padding="none"
                        sx={[
                          Color(common.white),
                          BackGroundColor(setting.color),
                        ]}
                      ></TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {_.map(props.bodies, (row, index) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                        {!_.isEmpty(props.checkbox?.checkedList) && (
                          <TableCell
                            padding="checkbox"
                            align="left"
                            sx={[
                              hBlock(75),
                              Color(common.white),
                              BackGroundColor(common.white),
                            ]}
                          >
                            <Checkbox
                              style={Color(setting.color)}
                              checked={
                                props.checkbox?.checkedList[index].checked
                              }
                              onClick={() =>
                                props.checkbox?.onClick(
                                  index,
                                  props.checkbox?.checkedList[index].checked,
                                )
                              }
                            />
                          </TableCell>
                        )}
                        <TableCell padding="none"></TableCell>
                        {_.map(
                          _.filter(_.keys(row), (str) => row[str].display),
                          (item: string, index2) => {
                            return (
                              <TableCell
                                component="th"
                                scope="row"
                                padding="none"
                                key={index2}
                                sx={hBlock(75)}
                              >
                                {row[item] && row[item].body}
                              </TableCell>
                            )
                          },
                        )}
                        {!_.isEmpty(props.icons) && (
                          <>
                            <TableCell
                              component="th"
                              align="right"
                              scope="row"
                              padding="none"
                              sx={hBlock(75)}
                            >
                              {_.map(props.icons, (icon, index2) => {
                                return (
                                  <Button
                                    key={index2}
                                    sx={[ButtonColor(icon.color, '')]}
                                    disabled={!icon.role}
                                    onClick={() => {
                                      icon.onClick(index)
                                    }}
                                  >
                                    {icon.element}
                                  </Button>
                                )
                              })}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}
      {_.isEqual(_.size(props.bodies), 0) && (
        <Box fontSize={60} sx={[TextCenter, mt(30)]}>
          {props.isNoContent
            ? t('common.table.noContent')
            : t('common.table.none')}
        </Box>
      )}
    </>
  )
}

export default CustomTable
