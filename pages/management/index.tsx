import NextHead from '@/components/common/Header'
import { GetStaticProps } from 'next'

const Home = () => {
  return (
    <>
      <NextHead />
    </>
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

export default Home
