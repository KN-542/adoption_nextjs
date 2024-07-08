import { Box } from '@mui/material'
import { GetStaticProps } from 'next'

const HomeAdmin = () => {
  return (
    <Box
      sx={{
        marginTop: '500px',
        marginLeft: '500px',
        fontSize: '50px',
        fontWeight: 'bold',
      }}
    >
      ホーム画面らしきもの後で作るよ~~~~~~ん
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let isError: boolean = false

  return {
    props: {
      isError,
      locale,
      messages: (await import(`../../public/locales/${locale}/common.json`))
        .default,
    },
  }
}

export default HomeAdmin
