import { RouterPath } from '@/enum/router'
import { RootState } from '@/hooks/store/store'
import { Box, Button } from '@mui/material'
import { cloneDeep, every, isEqual, map, min, some } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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
  mr,
  BorderRadius,
} from '@/styles/index'
import { common } from '@mui/material/colors'
import { useTranslations } from 'next-intl'

type Props = {
  currentPage: number
  listSize: number
  pageSize: number
  search: (i?: number) => void
  changePage: (i: number) => void
}

type Option = {
  isButton: boolean
  disp: string
  value?: number
}

const NOT_SKIP_PAGE_SIZE_MAX = 5
const SKIP_PAGE_SIZE = 3

const Pagination = (props: Props) => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.management.setting)
  const [displayList, setDisplayList] = useState<Option[]>([])

  const displayPagination = () => {
    if (
      some([props.currentPage <= 0, props.listSize <= 0, props.pageSize <= 0])
    ) {
      router.push(RouterPath.ManagementError)
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
      every([
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
    <Box sx={[minW(1000), mb(1.5), PaginationMenu]}>
      <Box component="span" sx={mr(1)}>
        {t('common.pagination.top') + ':'}
      </Box>
      {map(displayList, (item, index) => {
        if (item.isButton) {
          const flg = isEqual(props.currentPage, item.value)
          return (
            <Button
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
                await props.search(item.value)
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
        {`${props.pageSize * (props.currentPage - 1) + 1} ~ ${min([
          props.pageSize * props.currentPage,
          props.listSize,
        ])}${t('common.pagination.size')} / ${props.listSize}${t(
          'common.pagination.size',
        )}`}
      </Box>
    </Box>
  )
}

export default Pagination
