import {
  GetOwnTeamRequest,
  RolesRequest,
  UpdateBasicTeamRequest,
} from '@/api/model/request'
import { GetOwnTeamResponse } from '@/api/model/response'
import { GetOwnTeamCSR, RolesCSR, UpdateBasicTeamCSR } from '@/api/repository'
import store, { RootState } from '@/hooks/store/store'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { GetServerSideProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'
import { changeSetting } from '@/hooks/store'
import { SettingModel } from '@/types/index'
import { RouterPath } from '@/enum/router'
import NextHead from '@/components/common/Header'
import { Box, Button, DialogContent, FormLabel, TextField } from '@mui/material'
import {
  Bold,
  ButtonColorInverse,
  ColorRed,
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
import { Operation } from '@/enum/common'
import { LITTLE_DURING } from '@/hooks/common'

type Props = {}

const SettingTeam: FC<Props> = () => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [team, setTeam] = useState<GetOwnTeamResponse>(null)

  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)

  const processing = useRef<boolean>(false)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })

      // API: チーム取得
      const res2 = await GetOwnTeamCSR({
        user_hash_key: user.hashKey,
      } as GetOwnTeamRequest)

      setTeam({ numOfInterview: Number(res2.data.team.num_of_interview) })
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

  const update = async () => {
    if (processing.current) return
    processing.current = true

    // API: チーム基本情報更新
    await UpdateBasicTeamCSR({
      user_hash_key: user.hashKey,
      num_of_interview: team.numOfInterview,
    } as UpdateBasicTeamRequest)
      .then(() => {
        toast(t('common.toast.update_0'), {
          style: {
            backgroundColor: setting.toastSuccessColor,
            color: common.white,
            width: 500,
          },
          position: 'bottom-left',
          hideProgressBar: true,
          closeButton: () => <ClearIcon />,
        })

        setTimeout(() => {
          processing.current = false
        }, LITTLE_DURING)
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

          setTimeout(() => {
            processing.current = false
          }, LITTLE_DURING)
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
  }

  useEffect(() => {
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
              <Box sx={[TableMenuButtons, mt(1)]}>
                <Button
                  tabIndex={-1}
                  variant="contained"
                  sx={[
                    mr(10),
                    minW(100),
                    ButtonColorInverse(common.white, setting.color),
                  ]}
                  onClick={update}
                >
                  {t('common.button.update')}
                </Button>
              </Box>

              <Box sx={[w(100), M0Auto, ColorRed, Bold]}>
                {t('features.setting.attention')}
              </Box>

              <Box sx={ColumnMt4}>
                <FormLabel sx={[mt(2), mb(1)]}>
                  {t('features.setting.team.sub.basic.num')}
                </FormLabel>
                <TextField
                  margin="normal"
                  type="number"
                  sx={[ml(2), w(10)]}
                  value={team.numOfInterview}
                  inputProps={{ min: 1, max: 30 }}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value < 1) {
                      setTeam({ numOfInterview: 1 })
                      return
                    }
                    if (value > 30) {
                      setTeam({ numOfInterview: 30 })
                      return
                    }
                    setTeam({ numOfInterview: value })
                  }}
                />
              </Box>
            </DialogContent>
          )}
        </Box>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default SettingTeam
