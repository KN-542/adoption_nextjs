import { GetStaticProps } from 'next'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import store, { RootState } from '@/hooks/store/store'
import NextHead from '@/components/common/Header'
import {
  Box,
  Button,
  DialogContent,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
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
import { common } from '@mui/material/colors'
import { DocumentRuleResponse, OccupationResponse } from '@/api/model/response'
import {
  CreateApplicantTypeCSR,
  DocumentRulesSSG,
  OccupationsSSG,
  RolesCSR,
} from '@/api/repository'
import { CreateApplicantTypeRequest, RolesRequest } from '@/api/model/request'
import _ from 'lodash'
import { changeSetting } from '@/hooks/store'
import { SettingModel } from '@/types/index'
import { RouterPath } from '@/enum/router'
import { Operation } from '@/enum/common'
import ClearIcon from '@mui/icons-material/Clear'
import { SubmitHandler, useForm } from 'react-hook-form'
import ErrorHandler from '@/components/common/ErrorHandler'
import { ValidationType } from '@/enum/validation'
import { FormValidation, FormValidationValue } from '@/hooks/validation'

type Props = {
  isError: boolean
  documentRules: DocumentRuleResponse[]
  occupations: OccupationResponse[]
}

type Inputs = {
  name: string
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let isError: boolean = false

  // API: ステータスイベントマスタ一覧
  const documentRulesSSG: DocumentRuleResponse[] = []
  await DocumentRulesSSG()
    .then((res) => {
      _.forEach(res.data.list, (item, index) => {
        documentRulesSSG.push({
          no: Number(index) + 1,
          hashKey: item.hash_key,
          rule: item[`rule_${locale}`],
        })
      })
    })
    .catch(() => {
      isError = true
    })

  // API: 職種マスタ一覧
  const occupationsSSG: OccupationResponse[] = []
  await OccupationsSSG()
    .then((res) => {
      _.forEach(res.data.list, (item, index) => {
        occupationsSSG.push({
          no: Number(index) + 1,
          hashKey: item.hash_key,
          name: item[`name_${locale}`],
        })
      })
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      isError,
      documentRules: documentRulesSSG,
      occupations: occupationsSSG,
      messages: (
        await import(`../../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

const SettingTeamType: FC<Props> = ({
  isError,
  documentRules,
  occupations,
}) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})

  const [ruleHash, setRuleHash] = useState<string>(documentRules[0].hashKey)
  const [occupationHash, setOccupationHash] = useState<string>(
    occupations[0].hashKey,
  )

  const [loading, isLoading] = useState<boolean>(true)
  const [init, isInit] = useState<boolean>(true)

  const inits = async () => {
    try {
      // API: 使用可能ロール一覧
      const res = await RolesCSR({
        hash_key: user.hashKey,
      } as RolesRequest)

      setRoles(res.data.map as { [key: string]: boolean })
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const formValidationValue: FormValidationValue = {
    name: {
      max: 15,
    },
  }

  const formValidation: FormValidation = {
    name: [
      {
        type: ValidationType.Required,
        message:
          t('features.setting.team.sub.type.header.name') +
          t('common.validate.required'),
      },
      {
        type: ValidationType.MaxLength,
        message:
          t('features.setting.team.sub.type.header.name') +
          t('common.validate.is') +
          String(formValidationValue.name.max) +
          t('common.validate.maxLength'),
      },
    ],
  }

  const update: SubmitHandler<Inputs> = async (d: Inputs) => {
    // API: 応募者種別登録
    await CreateApplicantTypeCSR({
      user_hash_key: user.hashKey,
      name: _.trim(d.name),
      rule_hash: ruleHash,
      occupation_hash: occupationHash,
    } as CreateApplicantTypeRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [
              t('features.setting.team.sub.type.index') +
                t(`common.toast.create`),
            ],
          } as SettingModel),
        )

        router.push(
          RouterPath.Management +
            RouterPath.Setting +
            RouterPath.SettingTeamApplicantType,
        )
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
      if (isError) {
        router.push(RouterPath.Error)
        return
      }
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
              <Box noValidate component="form" onSubmit={handleSubmit(update)}>
                <Box sx={[TableMenuButtons, mt(1)]}>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={[
                      mr(10),
                      minW(100),
                      ButtonColorInverse(common.white, setting.color),
                    ]}
                  >
                    {t('common.button.update')}
                  </Button>
                </Box>

                <Box sx={[w(100), M0Auto, ColorRed, Bold]}>
                  {t('features.setting.attention')}
                </Box>

                <Box sx={ColumnMt4}>
                  <FormLabel sx={[mt(2), mb(1)]}>
                    {t('features.setting.team.sub.type.header.name') + '*'}
                  </FormLabel>
                  <TextField
                    margin="normal"
                    required
                    sx={[ml(2), w(50)]}
                    {...register('name', {
                      required: true,
                      maxLength: formValidationValue.name.max,
                      setValueAs: (value) => _.trim(value),
                    })}
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  <Box sx={[ml(2)]}>
                    <ErrorHandler
                      validations={formValidation.name}
                      type={errors.name?.type}
                    ></ErrorHandler>
                  </Box>

                  <FormLabel sx={[mt(2), mb(1)]}>
                    {t('features.setting.team.sub.type.header.documentRule') +
                      '*'}
                  </FormLabel>
                  <RadioGroup
                    aria-label="position"
                    row
                    name="documentRule"
                    value={ruleHash}
                    className="form-radio"
                    sx={[ml(2)]}
                  >
                    {_.map(documentRules, (rule, idx) => {
                      return (
                        <FormControlLabel
                          key={idx}
                          sx={[ml(2)]}
                          color={setting.color}
                          value={rule.hashKey}
                          checked={_.isEqual(rule.hashKey, ruleHash)}
                          control={
                            <Radio
                              style={{ color: setting.color }}
                              value={rule.hashKey}
                              onChange={(e) => setRuleHash(e.target.value)}
                            />
                          }
                          label={rule.rule}
                        />
                      )
                    })}
                  </RadioGroup>

                  <FormLabel sx={[mt(6), mb(1)]}>
                    {t('features.setting.team.sub.type.header.occupation') +
                      '*'}
                  </FormLabel>
                  <RadioGroup
                    aria-label="position"
                    row
                    name="type"
                    value={occupationHash}
                    className="form-radio"
                    sx={[ml(2), w(60)]}
                  >
                    {_.map(occupations, (o, idx) => {
                      return (
                        <FormControlLabel
                          key={idx}
                          sx={[ml(2), minW(400)]}
                          color={setting.color}
                          value={o.hashKey}
                          checked={_.isEqual(o.hashKey, occupationHash)}
                          control={
                            <Radio
                              style={{ color: setting.color }}
                              value={o.hashKey}
                              onChange={(e) =>
                                setOccupationHash(e.target.value)
                              }
                            />
                          }
                          label={o.name}
                        />
                      )
                    })}
                  </RadioGroup>
                </Box>
              </Box>
            </DialogContent>
          )}
        </Box>
      </Box>
    </>
  )
}

export default SettingTeamType
