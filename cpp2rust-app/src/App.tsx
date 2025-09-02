import Box from '@mui/material/Box'
import CMakeConfiguration from './components/CMakeConfiguration'

function App(): React.JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <CMakeConfiguration />
    </Box>
  )
}

export default App
