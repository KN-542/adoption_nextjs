import React, { useRef } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import { common } from '@mui/material/colors'
import { mt, mb, w, ButtonColor } from '@/styles/index'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import Copyright from '@/components/common/Copyright'
import { RouterPath } from '@/enum/router'
import NextHead from '@/components/common/Header'
import { GetServerSideProps } from 'next'

const Error = () => {
  const router = useRouter()
  const t = useTranslations()

  const processing = useRef<boolean>(false)

  return (
    <>
      <NextHead />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={mb(4)}>
            Server Error
          </Typography>
          <Typography
            component="div"
            variant="body1"
            gutterBottom
            textAlign="center"
          >
            <Box>{t('features.login.errorMsg1')}</Box>
            <Box>{t('features.login.errorMsg2')}</Box>
            <Box>{t('features.login.errorMsg3')}</Box>
          </Typography>
          <Button
            tabIndex={-1}
            variant="contained"
            sx={[mt(10), w(60), ButtonColor(common.white, common.black)]}
            onClick={() => {
              if (processing.current) return
              processing.current = true

              router.push(RouterPath.Login)
            }}
          >
            {t('features.login.errorButton')}
          </Button>

          <Copyright sx={[mt(3)]} />
        </Box>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      messages: (await import(`../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default Error
