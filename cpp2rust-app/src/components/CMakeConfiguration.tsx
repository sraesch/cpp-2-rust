import Box from '@mui/material/Box'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { useCallback, useState } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CMakeTable from './CMakeTable'
import CMakeControls from './CMakeControls'
import CMakeLog from './CMakeLog'
import { CMakeCache, CMakeVariable } from '../backend/cmake'
import { selectFolder } from '../tauri_utils'
import CMakeAddVariableDialog from './CMakeAddVariableDialog'
import { info, warn } from '@tauri-apps/plugin-log'
import { generateCMake, loadCacheFolder, useCMakeLogMessages } from '../backend'

import { makeStyles, Text, Label, Input } from '@fluentui/react-components'
import { useId } from '@fluentui/react-utilities'
import { FolderTextField } from './FolderTextfield'
import CMakeCacheEntriesControl from './CMakeCacheEntriesControl'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    width: '100%',
    height: 'calc(100vh - 16px)',
    margin: '8px',
    gap: '8px'
  },
})


export default function CMakeConfiguration(): React.JSX.Element {
  const classes = useStyles()
  const projectSourceId = useId()
  const [sourceDir, setSourceDir] = useState<string>('')
  const [buildDir, setBuildDir] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [grouped, setGrouped] = useState<boolean>(false)
  const [advanced, setAdvanced] = useState<boolean>(false)
  const [entries, setEntries] = useState<Record<string, CMakeVariable>>({})
  const [logMessages, setLogMessages] = useState<string>('')
  const [generator, setGenerator] = useState<string | undefined>(undefined)

  // Register listener for CMake log messages which are send on the channel 'cmake_logging'
  useCMakeLogMessages((message) => {
    setLogMessages((prev) => prev + '\n' + message)
  })

  const handleChangeBuildDir = useCallback(async (folder: string): Promise<void> => {
    setBuildDir(folder)

    console.log(`Try loading cache from build folder: ${folder}`)
    const cache = await loadCacheFolder(folder)

    if (cache) {
      console.log(`Loaded cache:`, cache)

      const cacheObj = cache as CMakeCache
      if (cacheObj.generator) {
        console.log('Set Generator:', cacheObj.generator)
        setGenerator(cacheObj.generator)
      }

      if (cacheObj.source_dir) {
        console.log('Set Source Directory:', cacheObj.source_dir)
        setSourceDir(cacheObj.source_dir)
      }

      if (cacheObj.build_dir) {
        console.log('Set Build Directory:', cacheObj.build_dir)
        setBuildDir(cacheObj.build_dir)
      }

      setEntries(cacheObj.variables ? cacheObj.variables : {})
    } else {
      console.log('No cache found')
      setEntries({})
    }
  }, [])

  const handleGenerate = async (): Promise<void> => {
    info('Generate CMake...')
    if (!sourceDir) {
      warn('Source Directory is not set!')
      setLogMessages((prev) => prev + '\n' + 'Error: Source Directory is not set!')
      return
    }

    if (!buildDir) {
      warn('Build Directory is not set!')
      setLogMessages((prev) => prev + '\n' + 'Error: Build Directory is not set!')
      return
    }

    setLogMessages('') // clear log messages

    // Trigger CMake generation in app backend
    let ret = await generateCMake({ sourceDir, buildDir, entries })
    if (ret) {
      setEntries(ret.variables ? ret.variables : {})
    }
  }

  const handleChangeEntry = (name: string, newValue: string): void => {
    setEntries((prev) => ({
      ...prev,
      [name]: { ...prev[name], value: newValue },
    }))
  }

  const handleDeleteEntry = (name: string): void => {
    setEntries((prev) => {
      const newEntries = { ...prev }
      delete newEntries[name]
      return newEntries
    })
  }

  return (
    <div className={classes.root}>
      <FolderTextField
        label="Project Source Code"
        minLabelWidth='168px'
        value={sourceDir}
        onChange={setSourceDir}
        appearance='filled-darker'
      />
      <FolderTextField
        label="Project Build Directory"
        minLabelWidth='168px'
        value={buildDir}
        onChange={handleChangeBuildDir}
        appearance='filled-darker'
      />
      <CMakeCacheEntriesControl
        minLabelWidth='168px'
        style={{ marginTop: '16px' }}
        searchString={search}
        grouped={grouped}
        advanced={advanced}
        onSearchChange={setSearch}
        onGroupedChange={setGrouped}
        onAdvancedChange={setAdvanced}
        onAddEntry={(variable) => setEntries((prev) => ({ ...prev, [variable.name]: variable }))}
      />
      <CMakeTable entries={entries}
        advanced={advanced}
        search={search}
        onChangeEntry={handleChangeEntry}
        onDeleteEntry={handleDeleteEntry}
      />
      <CMakeControls onGenerate={handleGenerate} generator={generator} />
      <CMakeLog size='medium' appearance='outline' logMessages={logMessages} />
    </div>
  )

  // return (
  //   <Box
  //     sx={{
  //       width: '100%',
  //       height: '100%',
  //       display: 'flex',
  //       flexDirection: 'column',
  //       gap: 2,
  //       margin: '16px'
  //     }}
  //   >
  //     <CMakeAddVariableDialog open={showAddEntryDialog} onClose={handleCloseAddVariableDialog} />
  //     <Box
  //       sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
  //     >
  //       <TextField
  //         label="Project Source Code"
  //         variant="standard"
  //         value={sourceDir}
  //         onChange={(e) => setSourceDir(e.target.value)}
  //         fullWidth
  //         size="small"
  //       />
  //       <Button
  //         size="small"
  //         sx={{ minWidth: '160px', height: '32px' }}
  //         variant="contained"
  //         onClick={handleBrowseSource}
  //       >
  //         Browse Source
  //       </Button>
  //     </Box>
  //     <Box
  //       sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
  //     >
  //       <TextField
  //         label="Project Build Directory"
  //         variant="standard"
  //         value={buildDir}
  //         onChange={(e) => handleChangeBuildDir(e.target.value)}
  //         fullWidth
  //         size="small"
  //       />
  //       <Button
  //         size="small"
  //         sx={{ minWidth: '160px', height: '32px' }}
  //         variant="contained"
  //         onClick={handleBrowseBuild}
  //       >
  //         Browse Build
  //       </Button>
  //     </Box>
  //     <Box
  //       sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
  //     >
  //       <TextField
  //         label="Search"
  //         variant="standard"
  //         value={search}
  //         onChange={(e) => setSearch(e.target.value)}
  //         fullWidth
  //         size="small"
  //       />
  //       <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
  //         <Checkbox size="small" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} />
  //         <Typography>Grouped</Typography>
  //       </Box>
  //       <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
  //         <Checkbox
  //           size="small"
  //           checked={advanced}
  //           onChange={(e) => setAdvanced(e.target.checked)}
  //         />
  //         <Typography>Advanced</Typography>
  //       </Box>
  //       <Button sx={{ minWidth: '100px', height: '32px' }} variant="outlined" size="small" onClick={() => setShowAddEntryDialog(true)}>
  //         Add Entry
  //       </Button>
  //     </Box>
  //     <CMakeTable entries={entries}
  //       advanced={advanced}
  //       search={search}
  //       onChangeEntry={handleChangeEntry}
  //       onDeleteEntry={handleDeleteEntry}
  //     />
  //     <CMakeControls onGenerate={handleGenerate} generator={generator} />
  //     <CMakeLog logMessages={logMessages} />
  //   </Box>
  // )
}
