import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useEffect, useState } from 'react'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CMakeTable from './CMakeTable'
import CMakeControls from './CMakeControls'
import CMakeLog from './CMakeLog'
import { CMakeCache, CMakeVariable } from '../cmake'
import { listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'


function loremIpsum(): string {
  return `
    Skipping web integration as there is no emscripten configured
    Applying Compiler Defaults (Unix)
    Skipping web integration as there is no emscripten configured
    Tests are enabled
    Found GTest
    GLM_INCLUDE_DIRS .............. /Users/sascharasch/libs/glm/include
    Create Test Target: test_utils
    Create Test Target: test_logging
    Create Test Target: test_program_args
    GLM_INCLUDE_DIRS .............. /Users/sascharasch/libs/glm/include
    RapidJSON found. Headers: /Users/sascharasch/src/rapidjson/include
    Create Test Target: test_cache_fmt
    Create Test Target: test_cache_gen
    Create Test Target: test_cache_reader
    Configuring done
    `
}

/**
 * Opens a dialog to select a folder.
 * @returns The selected folder path or undefined if no folder was selected.
 */
async function selectFolder(): Promise<string | null> {
  const folder = await open({
    multiple: false,
    directory: true,
  });

  return folder
}

export default function CMakeConfiguration(): React.JSX.Element {
  const [sourceDir, setSourceDir] = useState<string>('')
  const [buildDir, setBuildDir] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [grouped, setGrouped] = useState<boolean>(false)
  const [advanced, setAdvanced] = useState<boolean>(false)
  const [entries, setEntries] = useState<Record<string, CMakeVariable>>({})
  const [logMessages, setLogMessages] = useState<string>('')
  const [generator, setGenerator] = useState<string | undefined>(undefined)

  // Register listener for CMake log messages which are send on the channel 'cmake:log'
  useEffect(() => {
    const unlistenPromise = listen<string>('cmake:log', (event) => {
      setLogMessages((prev) => prev + '\n' + event.payload)
    })

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [])

  const handleBrowseSource = (): void => {
    console.log('Browse Source Directory')

    // Trigger open dialog in app backend
    selectFolder().then((folder) => {
      if (folder) {
        setSourceDir(folder)
      }
    })
  }

  const handleBrowseBuild = async (): Promise<void> => {
    console.log('Browse Build Directory')
    // Trigger open dialog in app backend
    const folder = await selectFolder()
    if (!folder) {
      return
    }

    setBuildDir(folder)

    await invoke<CMakeCache | null>('load_cache', { folder }).then((cache) => {
      if (cache) {
        const cacheObj = cache as CMakeCache
        if (cacheObj.generator) {
          console.log('Generator:', cacheObj.generator)
          setGenerator(cacheObj.generator)
        }

        if (cacheObj.source_dir) {
          console.log('Source Directory:', cacheObj.source_dir)
          setSourceDir(cacheObj.source_dir)
        }

        if (cacheObj.build_dir) {
          console.log('Build Directory:', cacheObj.build_dir)
          setBuildDir(cacheObj.build_dir)
        }

        setEntries(cacheObj.variables ? cacheObj.variables : {})
      }
    })
  }

  const handleConfigCMake = (): void => {
    console.log('Configure CMake')
    if (!sourceDir) {
      setLogMessages((prev) => prev + '\n' + 'Error: Source Directory is not set!')
      return
    }

    setLogMessages('') // clear log messages
    // Trigger CMake configuration in app backend
    invoke('cmake:configure', { sourceDir, buildDir, entries })
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        margin: '16px'
      }}
    >
      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
      >
        <TextField
          label="Project Source Code"
          variant="standard"
          value={sourceDir}
          onChange={(e) => setSourceDir(e.target.value)}
          fullWidth
          size="small"
        />
        <Button
          size="small"
          sx={{ minWidth: '160px', height: '32px' }}
          variant="contained"
          onClick={handleBrowseSource}
        >
          Browse Source
        </Button>
      </Box>
      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
      >
        <TextField
          label="Project Build Directory"
          variant="standard"
          value={buildDir}
          onChange={(e) => setBuildDir(e.target.value)}
          fullWidth
          size="small"
        />
        <Button
          size="small"
          sx={{ minWidth: '160px', height: '32px' }}
          variant="contained"
          onClick={handleBrowseBuild}
        >
          Browse Build
        </Button>
      </Box>
      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}
      >
        <TextField
          label="Search"
          variant="standard"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox size="small" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} />
          <Typography>Grouped</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            size="small"
            checked={advanced}
            onChange={(e) => setAdvanced(e.target.checked)}
          />
          <Typography>Advanced</Typography>
        </Box>
        <Button sx={{ minWidth: '100px', height: '32px' }} variant="outlined" size="small">
          Add Entry
        </Button>
      </Box>
      <CMakeTable entries={entries} advanced={advanced} />
      <CMakeControls onConfig={handleConfigCMake} generator={generator} />
      <CMakeLog logMessages={logMessages} />
    </Box>
  )
}
