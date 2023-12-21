import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/hooks/store/store'
import CustomTable from '@/components/Table'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { UsersTableBody, TableHeader } from '@/types/management'
import { useTranslations } from 'next-intl'
import { Box, Button } from '@mui/material'
import { common } from '@mui/material/colors'
import { map } from 'lodash'
import { UserListSSG } from '@/api/repository'
import _ from 'lodash'
import { useRouter } from 'next/router'
import { RouterPath } from '@/enum/router'
import { dispRole } from '@/enum/user'
import NextHead from '@/components/Header'
import { ml, mr, mt, TableMenu } from '@/styles/index'

const Applicants = ({ list, isError }) => {
  const router = useRouter()
  const t = useTranslations()

  const setting = useSelector((state: RootState) => state.management.setting)

  const [bodies, setBodies] = useState(list)

  useEffect(() => {
    if (isError) router.push(RouterPath.ManagementError)
  }, [])

  const tableHeader: TableHeader[] = [
    {
      id: 1,
      name: 'No',
    },
    {
      id: 2,
      name: t('management.features.user.header.name'),
    },
    {
      id: 3,
      name: t('management.features.user.header.mail'),
    },
    {
      id: 4,
      name: t('management.features.user.header.role'),
    },
  ]

  return (
    <>
      <NextHead></NextHead>
      <Box sx={mt(12)}>
        <Box sx={TableMenu}>
          <Button
            variant="contained"
            sx={[
              ml(1),
              {
                backgroundColor: setting.color,
                '&:hover': {
                  backgroundColor: common.white,
                  color: setting.color,
                },
              },
            ]}
            onClick={() => router.push(RouterPath.ManagementUserCreate)}
          >
            <AddCircleOutlineIcon sx={mr(0.25)} />
            {t('management.features.user.create')}
          </Button>
        </Box>
        <CustomTable
          headers={tableHeader}
          bodies={map(bodies, (l) => {
            return {
              no: l.no,
              name: l.name,
              mail: l.mail,
              role: t(dispRole(l.role)),
            }
          })}
        />
      </Box>
    </>
  )
}

export const getStaticProps = async ({ locale }) => {
  let isError = false
  const list: UsersTableBody[] = []
  await UserListSSG()
    .then((res) => {
      _.forEach(res.data.users, (r, index) => {
        list.push({
          no: Number(index) + 1,
          id: Number(r.id),
          name: r.name,
          mail: r.email,
          role: Number(r.role_id),
        })
      })
    })
    .catch(() => {
      isError = true
    })

  return {
    props: {
      list,
      isError,
      messages: (
        await import(`../../../../public/locales/${locale}/common.json`)
      ).default,
    },
  }
}

export default Applicants
