import { GetServerSideProps } from 'next'

const HomeAdmin = () => {
  return <></>
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
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
