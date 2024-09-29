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

export const getStaticProps: GetStaticProps = async () => {
  let isError: boolean = false

  return {
    props: {
      isError,
      locale: 'ja',
      messages: (await import(`../../public/locales/ja/common.json`)).default,
    },
  }
}

export default HomeAdmin
