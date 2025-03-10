import { RouterPath } from '@/enum/router'
import { RootState } from '@/hooks/store/store'
import { Box, Button, MenuItem, Select } from '@mui/material'
import _ from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ButtonColor,
  maxW,
  maxH,
  minW,
  mb,
  PaginationMenu,
  ml,
  TextCenter,
  BorderRadius,
  w,
  mr,
  SelectWithoutBox,
} from '@/styles/index'
import { common } from '@mui/material/colors'
import { useTranslations } from 'next-intl'

type Props = {
  show: boolean
  currentPage: number
  listSize: number
  pageSize: number
  search: (i: number, i2: number) => void
  changePage: (i: number) => void
  changePageSize: (i: number) => void
}

type Option = {
  isButton: boolean
  disp: string
  value?: number
}

const NOT_SKIP_PAGE_SIZE_MAX = 5
const SKIP_PAGE_SIZE = 3
const MIN_EL_SIZE = 284

const PAGE_SIZE_LIST = [25, 50, 100, 200]

const Pagination = (props: Props) => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.setting)
  const [displayList, setDisplayList] = useState<Option[]>([])

  const displayPagination = () => {
    if (
      _.some([props.currentPage <= 0, props.listSize < 0, props.pageSize <= 0])
    ) {
      router.push(RouterPath.Error)
      return
    }

    const list: Option[] = []
    const mod = props.listSize % props.pageSize
    const intPart = Math.floor(props.listSize / props.pageSize)
    const size = intPart + (mod > 0 ? 1 : 0)

    if (size <= NOT_SKIP_PAGE_SIZE_MAX) {
      for (let i = 1; i <= size; i++) {
        list.push({
          isButton: true,
          disp: String(i),
          value: i,
        } as Option)
      }

      setDisplayList(list)
      return
    }

    if (
      _.every([
        SKIP_PAGE_SIZE < props.currentPage,
        props.currentPage < size - SKIP_PAGE_SIZE,
      ])
    ) {
      list.push({
        isButton: true,
        disp: '<',
        value: 1,
      } as Option)
      list.push({
        isButton: false,
        disp: '...',
      } as Option)
      for (
        let i = props.currentPage - SKIP_PAGE_SIZE + 1;
        i <= props.currentPage + SKIP_PAGE_SIZE - 1;
        i++
      ) {
        list.push({
          isButton: true,
          disp: String(i),
          value: i,
        } as Option)
      }
      list.push({
        isButton: false,
        disp: '...',
      } as Option)
      list.push({
        isButton: true,
        disp: '>',
        value: size,
      } as Option)

      setDisplayList(list)
      return
    }

    if (SKIP_PAGE_SIZE < props.currentPage) {
      list.push({
        isButton: true,
        disp: '<',
        value: 1,
      } as Option)
      list.push({
        isButton: false,
        disp: '...',
      } as Option)
      for (let i = size - SKIP_PAGE_SIZE - 1; i <= size; i++) {
        list.push({
          isButton: true,
          disp: String(i),
          value: i,
        } as Option)
      }

      setDisplayList(list)
      return
    }

    if (props.currentPage < size - SKIP_PAGE_SIZE) {
      for (let i = 1; i <= SKIP_PAGE_SIZE + 1; i++) {
        list.push({
          isButton: true,
          disp: String(i),
          value: i,
        } as Option)
      }
      list.push({
        isButton: false,
        disp: '...',
      } as Option)
      list.push({
        isButton: true,
        disp: '>',
        value: size,
      } as Option)

      setDisplayList(list)
      return
    }
  }

  useEffect(() => {
    displayPagination()
  }, [])

  return (
    <>
      <Select
        value={String(props.pageSize)}
        sx={[SelectWithoutBox, mr(3), mb(0.5)]}
        onChange={async (e) => {
          try {
            props.changePage(1)
            props.changePageSize(Number(e.target.value))
            await props.search(1, Number(e.target.value))
          } catch {
            router.push(RouterPath.Error)
            return
          }
        }}
      >
        {_.map(PAGE_SIZE_LIST, (item, index) => (
          <MenuItem key={index} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
      {props.show ? (
        <Box
          sx={[
            w(100),
            maxW(MIN_EL_SIZE + 24 * _.size(displayList)),
            mb(1.5),
            PaginationMenu,
          ]}
        >
          {_.map(displayList, (item, index) => {
            if (item.isButton) {
              const flg = _.isEqual(props.currentPage, item.value)
              return (
                <Button
                  tabIndex={-1}
                  key={index}
                  disabled={flg}
                  sx={[
                    ButtonColor(
                      flg ? setting.color : common.white,
                      flg ? common.white : setting.color,
                    ),
                    minW(24),
                    maxW(24),
                    maxH(24),
                    ml(1),
                    BorderRadius(20),
                  ]}
                  onClick={async () => {
                    props.changePage(item.value)
                    await props.search(item.value, props.pageSize)
                  }}
                >
                  {item.disp}
                </Button>
              )
            } else {
              return (
                <Box
                  key={index}
                  sx={[minW(24), maxW(24), maxH(24), ml(1), TextCenter]}
                >
                  {item.disp}
                </Box>
              )
            }
          })}
          <Box component="span" sx={ml(4)}>
            {`${props.pageSize * (props.currentPage - 1) + 1} ~ ${_.min([
              props.pageSize * props.currentPage,
              props.listSize,
            ])} / ${props.listSize}${t('common.pagination.size')}`}
          </Box>
        </Box>
      ) : (
        <Box
          sx={[
            w(100),
            maxW(MIN_EL_SIZE + 24 * _.size(displayList)),
            mb(1.5),
            PaginationMenu,
          ]}
        >{`${props.listSize} ${t('common.pagination.size')}`}</Box>
      )}
    </>
  )
}

export default Pagination
