import {
  Box,
  Button,
  DialogContent,
  List,
  ListItem,
  Typography,
} from '@mui/material'
import { common } from '@mui/material/colors'
import _ from 'lodash'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import ApartmentIcon from '@mui/icons-material/Apartment'
import Diversity2Icon from '@mui/icons-material/Diversity2'
import SettingsIcon from '@mui/icons-material/Settings'

import { ButtonContents, ButtonContentsSub, SettingModel } from '@/types/index'
import {
  MenuDisp,
  M0Auto,
  w,
  DialogContentSetting,
  ml,
  Color,
  mr,
  FontSize,
  mb,
  Padding,
  h,
} from '@/styles/index'
import { RolesCSR } from '@/api/repository'
import { RolesRequest } from '@/api/model/request'
import store, { RootState } from '@/hooks/store/store'
import { useSelector } from 'react-redux'
import { Operation } from '@/enum/common'
import { changeSetting } from '@/hooks/store'
import { RouterPath } from '@/enum/router'
import { toast } from 'react-toastify'
import ClearIcon from '@mui/icons-material/Clear'

type Props = {}

const SettingMenu: FC<Props> = () => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [menus, setMenus] = useState<ButtonContents[]>([])

  const inits = async () => {
    // API 使用可能ロール一覧
    await RolesCSR({
      hash_key: user.hashKey,
    } as RolesRequest)
      .then((res) => {
        setMenus([
          {
            name: (
              <>
                <ApartmentIcon sx={[Color(common.black), mr(1)]} />
                {t('features.setting.company.index')}
              </>
            ),
            role: res.data.map[Operation.ManagementSettingCompany],
          },
          {
            name: (
              <>
                <Diversity2Icon sx={[Color(common.black), mr(1)]} />
                {t('features.setting.team.index')}
              </>
            ),
            role: res.data.map[Operation.ManagementSettingTeam],
            contents: [
              {
                name: t('features.setting.team.sub.basic.index'),
                onClick: () =>
                  router.push(
                    RouterPath.Management +
                      RouterPath.Setting +
                      RouterPath.SettingTeam,
                  ),
              },
              {
                name: t('features.setting.team.sub.status.index'),
                onClick: () =>
                  router.push(
                    RouterPath.Management +
                      RouterPath.Setting +
                      RouterPath.SettingTeamStatus,
                  ),
              },
              {
                name: t('features.setting.team.sub.assign.index'),
                onClick: () =>
                  router.push(
                    RouterPath.Management +
                      RouterPath.Setting +
                      RouterPath.SettingTeamAssign,
                  ),
              },
              {
                name: t('features.setting.team.sub.type.index'),
                onClick: () =>
                  router.push(
                    RouterPath.Management +
                      RouterPath.Setting +
                      RouterPath.SettingTeamApplicantType,
                  ),
              },
            ] as ButtonContentsSub[],
          },
          {
            name: (
              <>
                <SettingsIcon sx={[Color(common.black), mr(1)]} />
                {t('features.setting.personal.index')}
              </>
            ),
            role: true,
            contents: [
              {
                name: t('features.setting.personal.sub.color.index'),
                onClick: () =>
                  router.push(
                    RouterPath.Management +
                      RouterPath.Setting +
                      RouterPath.SettingPersonalColor,
                  ),
              },
            ] as ButtonContentsSub[],
          },
        ])
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
            _.isEmpty(routerPath)
              ? RouterPath.Admin + RouterPath.Company
              : routerPath,
          )
        }
      })
  }

  useEffect(() => {
    const initialize = async () => {
      await inits()
    }

    initialize()
  }, [router.pathname])

  return (
    <DialogContent sx={[DialogContentSetting, w(20), h(100)]}>
      <Box sx={[w(90), M0Auto]}>
        {_.map(
          _.filter(menus, (m) => m.role),
          (m, i) => {
            return (
              <Box key={i} sx={[i < _.size(menus) - 1 ? mb(3) : null]}>
                <Typography
                  variant="h6"
                  sx={[MenuDisp(common.black), FontSize(20)]}
                >
                  {m.name}
                </Typography>
                {!_.isEmpty(m.contents) && (
                  <List>
                    {_.map(m.contents, (c, index) => {
                      return (
                        <ListItem key={index} sx={[ml(2), Padding(0)]}>
                          {'・'}
                          <Button
                            sx={[MenuDisp(common.black)]}
                            onClick={c.onClick}
                          >
                            {c.name}
                          </Button>
                        </ListItem>
                      )
                    })}
                  </List>
                )}
              </Box>
            )
          },
        )}
      </Box>
    </DialogContent>
  )
}

export default SettingMenu
