import { SearchCompanyRequest, RolesRequest } from '@/api/model/request'
import { SearchCompanyResponse } from '@/api/model/response'
import { SearchCompanyCSR, RolesCSR } from '@/api/repository'
import NextHead from '@/components/common/Header'
import { SearchCompanyTextIndex } from '@/enum/company'
import { RouterPath } from '@/enum/router'
import store, { RootState } from '@/hooks/store/store'
import { common } from '@mui/material/colors'
import { HttpStatusCode } from 'axios'
import _ from 'lodash'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { Operation } from '@/enum/common'
import {
  Body,
  CheckboxPropsField,
  SelectedCheckbox,
  SelectedMenuModel,
  SettingModel,
  TableHeader,
} from '@/types/index'
import { Box, Button } from '@mui/material'
import {
  ButtonColorInverse,
  M0Auto,
  SpaceBetween,
  TableMenuButtons,
  maxW,
  mb,
  ml,
  mr,
  mt,
  w,
} from '@/styles/index'
import CustomTable from '@/components/common/Table'
import Pagination from '@/components/common/Pagination'
import SelectedMenu from '@/components/common/SelectedMenu'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import { changeSetting, companySearchPageSize } from '@/hooks/store'
import { GetServerSideProps } from 'next'
import { DURING } from '@/hooks/common'

type Props = {
  isError: boolean
}

const Company: React.FC<Props> = ({ isError }) => {
  const router = useRouter()
  const t = useTranslations()

  const company = useSelector((state: RootState) => state.company)
  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [bodies, setBodies] = useState<SearchCompanyResponse[]>([])
  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [checkedList, setCheckedList] = useState<SelectedCheckbox[]>([])

  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)
  const [noContent, isNoContent] = useState<boolean>(false)
  const [pageDisp, isPageDisp] = useState<boolean>(false)

  const processing = useRef<boolean>(false)

  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(company.search.pageSize)

  const searchTextList = _.cloneDeep(company.search.textForm)

  const inits = async () => {
    // API 使用可能ロール一覧
    await RolesCSR({
      hash_key: user.hashKey,
    } as RolesRequest)
      .then((res) => {
        setRoles(res.data.map as { [key: string]: boolean })
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
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

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
      .finally(() => {
        isInit(false)
      })
  }

  // 検索
  const search = async (currentPage: number, currentSize: number) => {
    isPageDisp(false)
    if (init) isLoading(true)

    // API: 企業検索
    const list: SearchCompanyResponse[] = []
    await SearchCompanyCSR({
      user_hash_key: user.hashKey,
      name: searchTextList[SearchCompanyTextIndex.Name].value.trim(),
    } as SearchCompanyRequest)
      .then((res) => {
        if (_.isEqual(res.data.code, HttpStatusCode.NoContent)) {
          isNoContent(true)
          return
        }

        _.forEach(res.data.list, (r, index) => {
          list.push({
            no: Number(index) + 1,
            hashKey: r.hash_key,
            name: r.name,
          } as SearchCompanyResponse)
        })
        setBodies(list)

        if (currentSize) {
          setPageSize(currentSize)
          store.dispatch(companySearchPageSize(currentSize))
        }
      })
      .catch(({ isServerError, routerPath, toastMsg, storeMsg }) => {
        if (isServerError) {
          router.push(routerPath)
          return
        }

        if (!_.isEmpty(toastMsg)) {
          toast(t(toastMsg), {
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

        if (!_.isEmpty(storeMsg)) {
          const msg = t(storeMsg)
          store.dispatch(
            changeSetting({
              errorMsg: _.isEmpty(msg) ? [] : [msg],
            } as SettingModel),
          )
          router.push(
            _.isEmpty(routerPath) ? RouterPath.Management : routerPath,
          )
        }
      })
      .finally(() => {
        isLoading(false)
        isPageDisp(true)
      })
  }

  const changePage = (i: number) => {
    setPage(i)
  }

  const changePageSize = (i: number) => {
    setPageSize(i)
  }

  const tableHeader: TableHeader[] = [
    {
      name: 'No',
      sort: null,
    },
    {
      name: t('features.company.header.name'),
      sort: null,
    },
  ]

  // 選択済みメニュー表示
  const dispMenu: SelectedMenuModel[] = []

  useEffect(() => {
    // トースト
    if (loading) {
      if (!_.isEmpty(setting.errorMsg)) {
        setTimeout(() => {
          for (const msg of setting.errorMsg) {
            toast(msg, {
              style: {
                backgroundColor: setting.toastErrorColor,
                color: common.white,
                width: 630,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
          }
        }, 0.1 * 1000)

        store.dispatch(
          changeSetting({
            errorMsg: [],
          } as SettingModel),
        )
      }

      if (!_.isEmpty(setting.successMsg)) {
        setTimeout(() => {
          for (const msg of setting.successMsg) {
            toast(msg, {
              style: {
                backgroundColor: setting.toastSuccessColor,
                color: common.white,
                width: 630,
              },
              position: 'bottom-left',
              hideProgressBar: true,
              closeButton: () => <ClearIcon />,
            })
          }
        }, 0.1 * 1000)

        store.dispatch(
          changeSetting({
            successMsg: [],
          } as SettingModel),
        )
      }
    }

    const initialize = async () => {
      try {
        if (isError) {
          router.push(RouterPath.Error)
          return
        }

        if (init) await inits()

        await search(1, pageSize)
      } finally {
        isLoading(false)
      }
    }

    initialize()
  }, [])

  return (
    <>
      <NextHead />
      {_.every([!isError, !loading, roles[Operation.AdminCompanyRead]]) && (
        <>
          <Box sx={mt(12)}>
            <Box sx={[SpaceBetween, w(90), M0Auto]}>
              <Pagination
                show={_.size(bodies) > pageSize}
                currentPage={page}
                listSize={_.size(bodies)}
                pageSize={pageSize}
                search={search}
                changePage={changePage}
                changePageSize={changePageSize}
              ></Pagination>
              {_.size(_.filter(checkedList, (c) => c.checked)) > 0 && (
                <SelectedMenu
                  menu={dispMenu}
                  size={_.size(_.filter(checkedList, (c) => c.checked))}
                ></SelectedMenu>
              )}
              <Box
                sx={[
                  TableMenuButtons,
                  mb(3),
                  _.size(_.filter(checkedList, (c) => c.checked)) > 0
                    ? maxW(300)
                    : null,
                ]}
              >
                <Button
                  variant="contained"
                  sx={[ml(1), ButtonColorInverse(common.white, setting.color)]}
                  onClick={() => {
                    if (processing.current) return
                    processing.current = true

                    setTimeout(() => {
                      processing.current = false
                    }, DURING)
                  }}
                >
                  <ManageSearchIcon sx={mr(0.25)} />
                  {t('common.button.condSearch')}
                </Button>
                {roles[Operation.AdminCompanyCreate] && (
                  <Button
                    variant="contained"
                    sx={[
                      ml(1),
                      ButtonColorInverse(common.white, setting.color),
                    ]}
                    onClick={() => {
                      if (processing.current) return
                      processing.current = true

                      router.push(RouterPath.Admin + RouterPath.CompanyCreate)
                    }}
                  >
                    <AddCircleOutlineIcon sx={mr(0.25)} />
                    {t('features.company.create')}
                  </Button>
                )}
              </Box>
            </Box>
            <CustomTable
              height={75}
              headers={tableHeader}
              isNoContent={noContent}
              pageSize={pageSize}
              bodies={_.map(bodies, (l) => {
                return {
                  no: new Body(l.no),
                  name: new Body(l.name),
                }
              }).slice(pageSize * (page - 1), pageSize * page)}
              checkbox={
                {
                  checkedList: checkedList,
                  onClick: (i: number, checked: boolean) => {
                    const list = _.cloneDeep(checkedList)
                    list[i].checked = !checked
                    setCheckedList(list)
                  },
                  onClickAll: (b: boolean) => {
                    const list = _.cloneDeep(checkedList)
                    for (const item of list) {
                      item.checked = b
                    }
                    setCheckedList(list)
                  },
                } as CheckboxPropsField
              }
              changeTarget={() => {}}
              search={search}
              changePage={changePage}
            />
          </Box>
        </>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  let isError: boolean = false

  return {
    props: {
      isError,
      locale,
      messages: (await import(`../../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Company
