import { RootState } from '@/hooks/store/store'
import { TopMenu } from '@/types/common/index'
import { Button } from '@mui/material'
import _ from 'lodash'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { BorderRadius, ButtonColor, Padding, mb, mr } from '@/styles/index'
import { common } from '@mui/material/colors'

type Props = {
  items: TopMenu[]
}

const SelectedTopMenu = (props: Props) => {
  const router = useRouter()
  const setting = useSelector((state: RootState) => state.setting)

  return (
    <>
      {_.map(props.items, (item, index) => (
        <Button
          size="small"
          key={index}
          sx={[
            ButtonColor(common.white, setting.color),
            BorderRadius(0),
            mb(3),
            mr(0.5),
            Padding(1),
          ]}
          onClick={() => router.push(item.router)}
        >
          {item.name}
        </Button>
      ))}
    </>
  )
}

export default SelectedTopMenu
