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
  List,
  ListItem,
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
  DisplayFlex,
  FontSize,
  M0Auto,
  mb,
  MenuDisp,
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
import {
  AssignRuleMasterResponse,
  AutoAssignRuleMasterResponse,
  GetOwnTeamResponse,
  InterviewerPriority,
  Possible,
} from '@/api/model/response'
import {
  AssignMasterSSG,
  GetOwnTeamCSR,
  RolesCSR,
  UpdateAssignMethodCSR,
} from '@/api/repository'
import {
  GetOwnTeamRequest,
  RolesRequest,
  UpdateAssignMethodRequest,
  UpdateAssignMethodSubRequest,
} from '@/api/model/request'
import _ from 'lodash'
import { changeSetting } from '@/hooks/store'
import { SelectTitlesModel, SettingModel } from '@/types/index'
import { RouterPath } from '@/enum/router'
import { Operation } from '@/enum/common'
import ClearIcon from '@mui/icons-material/Clear'
import { RuleAdditionalConfiguration } from '@/enum/user'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import DropDownList from '@/components/common/DropDownList'

const INTERVIEW_MIN = 1
const INTERVIEW_MAX = 6

type Props = {
  isError: boolean
  api: APIProps
}
type APIProps = {
  assignRules: AssignRuleMasterResponse[]
  autoAssignRules: AutoAssignRuleMasterResponse[]
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let isError = false

  // API: アサイン関連マスタ取得
  const assignRules: AssignRuleMasterResponse[] = []
  const autoAssignRules: AutoAssignRuleMasterResponse[] = []
  await AssignMasterSSG()
    .then((res) => {
      _.forEach(res.data.rule, (item, index) => {
        assignRules.push({
          no: Number(index) + 1,
          hashKey: item.hash_key,
          desc: item[`desc_${locale}`],
          setFlg: Number(item.additional_configuration),
          selected: false,
        })
      })
      _.forEach(res.data.auto_rule, (item, index) => {
        autoAssignRules.push({
          no: Number(index) + 1,
          hashKey: item.hash_key,
          desc: item[`desc_${locale}`],
          setFlg: Number(item.additional_configuration),
          selected: _.isEqual(index, 0),
        })
      })
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      isError,
      api: {
        assignRules,
        autoAssignRules,
      },
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

const SettingTeamAssign: FC<Props> = ({ isError, api }) => {
  const router = useRouter()
  const t = useTranslations()

  const user = useSelector((state: RootState) => state.user)
  const setting = useSelector((state: RootState) => state.setting)

  const [roles, setRoles] = useState<{ [key: string]: boolean }>({})
  const [team, setTeam] = useState<GetOwnTeamResponse>(null)
  const [rules, setRules] = useState<AssignRuleMasterResponse[]>(
    api.assignRules,
  )
  const [autoRules, setAutoRules] = useState<AutoAssignRuleMasterResponse[]>(
    api.autoAssignRules,
  )
  const [priority, setPriority] = useState<InterviewerPriority[]>([])
  const [possibleList, setPossibleList] = useState<Possible[]>([])
  const [selectedPossibleList, setSelectedPossibleList] = useState<Possible[]>(
    [],
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

      // API: チーム取得
      const res2 = await GetOwnTeamCSR({
        user_hash_key: user.hashKey,
      } as GetOwnTeamRequest)

      setTeam({
        numOfInterview: Number(res2.data.team.num_of_interview),
        userMin: Number(res2.data.team.user_min),
      } as GetOwnTeamResponse)

      setRules(
        _.map(rules, (rule) => {
          if (_.isEqual(rule.hashKey, res2.data.team.rule_hash)) {
            return {
              no: rule.no,
              hashKey: rule.hashKey,
              desc: rule.desc,
              setFlg: rule.setFlg,
              selected: true,
              selectedHash: res2.data.team.rule_hash,
            }
          }
          return {
            no: rule.no,
            hashKey: rule.hashKey,
            desc: rule.desc,
            setFlg: rule.setFlg,
            selected: false,
            selectedHash: '',
          }
        }),
      )

      if (
        _.every([
          !_.isEmpty(res2.data.auto_rule),
          !_.isEmpty(res2.data.auto_rule.hash_key),
        ])
      ) {
        setAutoRules(
          _.map(autoRules, (rule) => {
            if (_.isEqual(rule.hashKey, res2.data.auto_rule.hash_key)) {
              return {
                no: rule.no,
                hashKey: rule.hashKey,
                desc: rule.desc,
                setFlg: rule.setFlg,
                selected: true,
                selectedHash: res2.data.auto_rule.hash_key,
              }
            }
            return {
              no: rule.no,
              hashKey: rule.hashKey,
              desc: rule.desc,
              setFlg: rule.setFlg,
              selected: false,
              selectedHash: '',
            }
          }),
        )
      }

      if (!_.isEmpty(res2.data.priority)) {
        setPriority(
          _.map(res2.data.priority, (item) => {
            return {
              priority: Number(item.priority),
              hashKey: item.hash_key,
              name: item.name,
            } as InterviewerPriority
          }).sort((a, b) => a.priority - b.priority),
        )
      } else {
        setPriority(
          _.map(res2.data.team.users, (item, index) => {
            return {
              priority: Number(index) + 1,
              hashKey: item.hash_key,
              name: item.name,
            } as InterviewerPriority
          }),
        )
      }

      const pList: Possible[] = []
      const p2List: Possible[] = []

      for (let i = 1; i <= Number(res2.data.team.num_of_interview); i++) {
        p2List.push({
          num: i,
          ableList: _.map(res2.data.team.users, (item) => {
            return {
              key: item.hash_key,
              title: item.name,
              subTitle: item.email,
            } as SelectTitlesModel
          }),
        } as Possible)

        const ableList: SelectTitlesModel[] = []
        for (const item of _.filter(
          _.cloneDeep(res2.data.possible_list),
          (possible) => _.isEqual(Number(possible.num_of_interview), i),
        )) {
          ableList.push({
            key: item.hash_key,
            title: item.name,
            subTitle: item.email,
          } as SelectTitlesModel)
        }
        pList.push({
          num: i,
          ableList: ableList,
        } as Possible)
      }

      setPossibleList(p2List)
      setSelectedPossibleList(pList)
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

  const drag = (result: DropResult) => {
    if (!result.destination) return

    const reorderedList = [...priority]
    const [removed] = reorderedList.splice(result.source.index, 1)
    reorderedList.splice(result.destination.index, 0, removed)

    setPriority(reorderedList)
  }

  const update = async () => {
    // バリデーション
    for (const possible of selectedPossibleList) {
      if (_.isEmpty(possible.ableList)) {
        toast(
          `${String(possible.num)}${t(
            'features.setting.team.sub.assign.possibleTransactionContent',
          )}${t(
            'features.setting.team.sub.assign.possibleTransactionContentValidation',
          )}`,
          {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 600,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          },
        )
        return
      }

      if (possible.num < team.userMin) {
        toast(
          `${String(possible.num)}${t(
            'features.setting.team.sub.assign.possibleTransactionContent',
          )}${t(
            'features.setting.team.sub.assign.possibleTransactionContentValidation2',
          )}`,
          {
            style: {
              backgroundColor: setting.toastErrorColor,
              color: common.white,
              width: 600,
            },
            position: 'bottom-left',
            hideProgressBar: true,
            closeButton: () => <ClearIcon />,
          },
        )
        return
      }
    }

    // リクエスト整備(面接参加可能者)
    const subRequests: UpdateAssignMethodSubRequest[] = []
    for (const possible of selectedPossibleList) {
      for (const item of possible.ableList) {
        subRequests.push({
          num_of_interview: possible.num,
          hash_key: item.key,
        } as UpdateAssignMethodSubRequest)
      }
    }

    // API: 面接官割り振り方法更新
    await UpdateAssignMethodCSR({
      user_hash_key: user.hashKey,
      user_min: team.userMin,
      rule_hash:
        _.find(rules, (rule) => !_.isEmpty(rule.selectedHash)).selectedHash ??
        '',
      auto_rule_hash:
        _.find(autoRules, (rule) => !_.isEmpty(rule.selectedHash))
          ?.selectedHash ?? '',
      priority: _.map(priority, (p) => {
        return p.hashKey
      }),
      possible_list: subRequests,
    } as UpdateAssignMethodRequest)
      .then(() => {
        store.dispatch(
          changeSetting({
            successMsg: [t('common.toast.update_0')],
          } as SettingModel),
        )

        router.push(RouterPath.Management + RouterPath.Back)
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
  }

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
                  {t('features.setting.team.sub.assign.num') + '*'}
                </FormLabel>
                <TextField
                  margin="normal"
                  type="number"
                  sx={[ml(2), w(10)]}
                  value={team.userMin}
                  inputProps={{ min: INTERVIEW_MIN, max: INTERVIEW_MAX }}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value < INTERVIEW_MIN) {
                      setTeam((obj) => {
                        return {
                          numOfInterview: obj.numOfInterview,
                          userMin: INTERVIEW_MIN,
                        }
                      })
                      return
                    }
                    if (value > INTERVIEW_MAX) {
                      setTeam((obj) => {
                        return {
                          numOfInterview: obj.numOfInterview,
                          userMin: INTERVIEW_MAX,
                        }
                      })
                      return
                    }
                    setTeam((obj) => {
                      return {
                        numOfInterview: obj.numOfInterview,
                        userMin: value,
                      }
                    })
                  }}
                />

                <FormLabel sx={[mt(6), mb(1)]}>
                  {`${team.numOfInterview}${t(
                    'features.setting.team.sub.assign.possibleTransaction',
                  )}`}
                </FormLabel>
                <List>
                  {_.map(possibleList, (c, index) => {
                    return (
                      <ListItem
                        key={index}
                        sx={[ml(2), MenuDisp(common.black)]}
                      >
                        <Box>{`・${String(c.num)}${t(
                          'features.setting.team.sub.assign.possibleTransactionContent',
                        )}`}</Box>
                        <ArrowRightAltIcon sx={mr(1)} />
                        <DropDownList
                          list={
                            _.find(selectedPossibleList, (item) =>
                              _.isEqual(item.num, c.num),
                            ).ableList ?? []
                          }
                          initList={
                            _.find(possibleList, (item) =>
                              _.isEqual(item.num, c.num),
                            ).ableList ?? []
                          }
                          sx={[ml(2), w(50)]}
                          onChange={(value) =>
                            setSelectedPossibleList((items) => {
                              const res: Possible[] = []
                              for (const item of items) {
                                if (_.isEqual(c.num, item.num)) {
                                  res.push({
                                    num: item.num,
                                    ableList: value,
                                  })
                                } else {
                                  res.push(item)
                                }
                              }
                              return res
                            })
                          }
                        />
                      </ListItem>
                    )
                  })}
                </List>

                <FormLabel sx={[mt(6), mb(1)]}>
                  {t('features.setting.team.sub.assign.rule')}
                </FormLabel>

                <RadioGroup
                  aria-label="position"
                  name="type"
                  value={
                    _.find(rules, (rule) => rule.selected).selectedHash ?? ''
                  }
                  className="form-radio"
                  sx={[ml(2)]}
                >
                  {_.map(rules, (rule, idx) => {
                    return (
                      <FormControlLabel
                        key={idx}
                        sx={[ml(2)]}
                        color={setting.color}
                        value={rule.hashKey}
                        checked={rule.selected}
                        control={
                          <Radio
                            style={{ color: setting.color }}
                            value={rule.hashKey}
                            onChange={(e) => {
                              setRules(
                                _.map(rules, (rule) => {
                                  if (_.isEqual(rule.hashKey, e.target.value)) {
                                    return {
                                      no: rule.no,
                                      hashKey: rule.hashKey,
                                      desc: rule.desc,
                                      setFlg: rule.setFlg,
                                      selected: true,
                                      selectedHash: e.target.value,
                                    }
                                  }
                                  return {
                                    no: rule.no,
                                    hashKey: rule.hashKey,
                                    desc: rule.desc,
                                    setFlg: rule.setFlg,
                                    selected: false,
                                    selectedHash: '',
                                  }
                                }),
                              )
                            }}
                          />
                        }
                        label={rule.desc}
                      />
                    )
                  })}
                </RadioGroup>

                {_.isEqual(
                  _.find(rules, (rule) => rule.selected).setFlg ??
                    RuleAdditionalConfiguration.UnRequired,
                  RuleAdditionalConfiguration.Required,
                ) && (
                  <>
                    <FormLabel sx={[mt(6), mb(1)]}>
                      {t('features.setting.team.sub.assign.auto')}
                    </FormLabel>

                    <RadioGroup
                      aria-label="position"
                      name="type"
                      value={
                        _.find(autoRules, (rule) => rule.selected)
                          .selectedHash ?? ''
                      }
                      className="form-radio"
                      sx={[ml(2)]}
                    >
                      {_.map(autoRules, (rule, idx) => {
                        return (
                          <FormControlLabel
                            key={idx}
                            sx={[ml(2)]}
                            color={setting.color}
                            value={rule.hashKey}
                            checked={rule.selected}
                            control={
                              <Radio
                                style={{ color: setting.color }}
                                value={rule.hashKey}
                                onChange={(e) => {
                                  setAutoRules(
                                    _.map(autoRules, (rule) => {
                                      if (
                                        _.isEqual(rule.hashKey, e.target.value)
                                      ) {
                                        return {
                                          no: rule.no,
                                          hashKey: rule.hashKey,
                                          desc: rule.desc,
                                          setFlg: rule.setFlg,
                                          selected: true,
                                          selectedHash: e.target.value,
                                        }
                                      }
                                      return {
                                        no: rule.no,
                                        hashKey: rule.hashKey,
                                        desc: rule.desc,
                                        setFlg: rule.setFlg,
                                        selected: false,
                                        selectedHash: '',
                                      }
                                    }),
                                  )
                                }}
                              />
                            }
                            label={rule.desc}
                          />
                        )
                      })}
                    </RadioGroup>
                  </>
                )}

                {_.every([
                  _.isEqual(
                    _.find(rules, (rule) => rule.selected).setFlg ??
                      RuleAdditionalConfiguration.UnRequired,
                    RuleAdditionalConfiguration.Required,
                  ),
                  _.isEqual(
                    _.find(autoRules, (rule) => rule.selected).setFlg ??
                      RuleAdditionalConfiguration.UnRequired,
                    RuleAdditionalConfiguration.Required,
                  ),
                ]) && (
                  <>
                    <FormLabel sx={[mt(6), mb(1)]}>
                      {t('features.setting.team.sub.assign.priority')}
                    </FormLabel>
                    <Box sx={[ml(2), mb(5), ColorRed, Bold]}>
                      {t('features.setting.team.sub.assign.attention')}
                    </Box>

                    <DragDropContext onDragEnd={drag}>
                      <Droppable droppableId="newStatusList">
                        {(provided) => (
                          <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {_.map(priority, (item, index) => (
                              <Draggable
                                key={index}
                                draggableId={`item-${index}`}
                                index={index}
                              >
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={[
                                      DisplayFlex,
                                      ml(6),
                                      mb(4),
                                      FontSize(20),
                                    ]}
                                  >
                                    <Box sx={[mr(1), ml(1)]}>
                                      {`${index + 1}. `}
                                    </Box>
                                    <Box sx={Bold}>{item.name}</Box>
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </>
                )}
              </Box>
            </DialogContent>
          )}
        </Box>
      </Box>
    </>
  )
}

export default SettingTeamAssign
