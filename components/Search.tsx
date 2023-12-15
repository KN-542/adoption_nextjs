import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Paper,
} from '@mui/material'

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleSearch = () => {
    console.log('Search with term:', searchTerm)
    // 実際の検索ロジックをここに実装します。
  }

  // この配列は選択可能なオプションのリストを表すもので、実際のアプリでは動的に生成される可能性があります。
  const options = ['オプション1', 'オプション2', 'オプション3']

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        '& > :not(style)': { m: 1, width: '95%' },
      }}
    >
      <Typography variant="h6">検索コンポーネント</Typography>
      <TextField
        label="検索キーワード"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
      />
      <Button variant="contained" onClick={handleSearch}>
        検索
      </Button>
      <Paper style={{ maxHeight: 200, overflow: 'auto' }}>
        <List component="nav" aria-label="mailbox folders">
          {options.map((option, index) => (
            <React.Fragment key={option}>
              {index !== 0 && <Divider />}
              <ListItem button>
                <ListItemText primary={option} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  )
}

export default Search
