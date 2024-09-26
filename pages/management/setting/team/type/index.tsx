import { GetStaticProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import store, { RootState } from '@/hooks/store/store'
import NextHead from '@/components/common/Header'
import { Box, Button, DialogContent } from '@mui/material'
import {
  ButtonColorInverse,
  ColumnMt4,
  DialogContentSetting,
  M0Auto,
  mb,
  minW,
  ml,
  mr,
  mt,
  SpaceBetween,
  TableMenuButtons,
  w,
} from '@/styles/index'
import SettingMenu from '@/components/common/SettingMenu'
import { common } from '@mui/material/colors'
import { ListApplicantTypeResponse } from '@/api/model/response'
import { ListApplicantTypeCSR, RolesCSR } from '@/api/repository'
import { ListApplicantTypeRequest, RolesRequest } from '@/api/model/request'
import _ from 'lodash'
import { changeSetting } from '@/hooks/store'
import { Body, Icons, SettingModel, TableHeader } from '@/types/index'
import { RouterPath } from '@/enum/router'
import { Operation } from '@/enum/common'
import ClearIcon from '@mui/icons-material/Clear'
import { HttpStatusCode } from 'axios'
import CustomTable from '@/components/common/Table'
import EditNoteIcon from '@mui/icons-material/EditNote'
import DeleteIcon from '@mui/icons-material/Delete'

const PAGE_SIZE = 25

type Props = {
  locale: string
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      locale,
      messages: (
        await import(`../../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

const SettingTeamType: FC<Props> = ({ locale }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [types, setTypes] = useState<ListApplicantTypeResponse[]>([])
  const [icons, setIcons] = useState<Icons[]>([])

  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })
      if (
        _.isEqual(
          res.data.map[Operation.ManagementSettingTeam],
          HttpStatusCode.Forbidden,
        )
      ) {
        router.push(RouterPath.Error)
        return
      }

      setIcons([
        {
          color: setting.toastSuccessColor,
          element: <EditNoteIcon />,
          role: res.data.map[Operation.ManagementTeamEdit],
          onClick: (i: number) => {},
        },
        {
          color: setting.toastErrorColor,
          element: <DeleteIcon />,
          role: res.data.map[Operation.ManagementTeamDelete],
          onClick: (i: number) => {},
        },
      ])

      // API: 応募者種別一覧
      const res2 = await ListApplicantTypeCSR({
        user_hash_key: user.hashKey,
      } as ListApplicantTypeRequest)

      setTypes(
        _.map(_.cloneDeep(res2.data.list), (item, index) => {
          return {
            no: Number(index) + 1,
            name: item.name,
            rule: item[`rule_${locale}`],
            occupation: item[`name_${locale}`],
          } as ListApplicantTypeResponse
        }),
      )
    } catch ({ isServerError, routerPath, toastMsg, storeMsg }) {
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
        router.push(_.isEmpty(routerPath) ? RouterPath.Management : routerPath)
      }
    } finally {
      isInit(false)
    }
  }

  const tableHeader: TableHeader[] = [
    {
      name: 'No',
    },
    {
      name: t('features.setting.team.sub.type.header.name'),
    },
    {
      name: t('features.setting.team.sub.type.header.documentRule'),
    },
    {
      name: t('features.setting.team.sub.type.header.occupation'),
    },
  ]

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
        if (init) await inits()
      } finally {
        isLoading(false)
      }
    }

    initialize()
  }, [router.pathname])

  return (
    <>
      <NextHead />
      <Box sx={mt(18)}>
        <Box sx={[SpaceBetween, w(90), M0Auto]}>
          <SettingMenu />
          {_.every([!loading, roles[Operation.ManagementSettingTeam]]) && (
            <DialogContent sx={[DialogContentSetting, w(90), ml(3)]}>
              <Box sx={[TableMenuButtons, w(90), mt(1)]}>
                <Button
                  variant="contained"
                  sx={[
                    mb(2),
                    minW(100),
                    ButtonColorInverse(common.white, setting.color),
                  ]}
                  onClick={() =>
                    router.push(
                      RouterPath.Management +
                        RouterPath.Setting +
                        RouterPath.SettingTeamApplicantTypeCreate,
                    )
                  }
                >
                  {t('common.button.create')}
                </Button>
              </Box>

              <CustomTable
                height={75}
                headers={tableHeader}
                isNoContent={false}
                icons={icons}
                pageSize={PAGE_SIZE}
                bodies={_.map(types, (u) => {
                  return {
                    no: new Body(u.no),
                    name: new Body(u.name),
                    documentRule: new Body(u.rule),
                    occupation: new Body(u.occupation),
                  }
                })}
              />
            </DialogContent>
          )}
        </Box>
      </Box>
    </>
  )
}

export default SettingTeamType
