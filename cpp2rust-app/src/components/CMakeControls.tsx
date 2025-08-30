import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export interface CMakeControlsProps {
  generator?: string
  onConfig?: () => void
  onGenerate?: () => void
}

export default function CMakeControls({
  generator,
  onConfig,
  onGenerate
}: CMakeControlsProps): React.JSX.Element {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Button size="small" variant="contained" color="primary" onClick={onConfig}>
        Configure
      </Button>
      <Button size="small" variant="contained" color="primary" onClick={onGenerate}>
        Generate
      </Button>
      <Typography variant="body2" color="text.secondary">
        Generator: {generator || 'None'}
      </Typography>
    </Box>
  )
}
