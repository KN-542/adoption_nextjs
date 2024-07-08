import NextHead from '@/components/common/Header'
import { GetStaticProps } from 'next'

const Home = () => {
  return (
    <>
      <NextHead></NextHead>
    </>
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

export default Home
