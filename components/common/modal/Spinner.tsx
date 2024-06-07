import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import { SpinnerSx } from '@/styles/index'

const Spinner = () => {
  return (
    <Box sx={SpinnerSx}>
      <CircularProgress size={60} />
    </Box>
  )
}

export default Spinner
