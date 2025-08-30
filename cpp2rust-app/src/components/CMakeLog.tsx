import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

export interface CMakeLogProps {
  logMessages: string
}

export default function CMakeLog({ logMessages }: CMakeLogProps): React.JSX.Element {
  const lines = useMemo(() => logMessages.split('\n'), [logMessages])

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <List dense={true} sx={{ width: '100%', bgcolor: 'background.paper', flexGrow: 1 }}>
        {lines.map((line, index) => (
          <ListItem key={index}>
            <Typography variant="body2">{line}</Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
