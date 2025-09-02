import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/RemoveCircle'

import { CMakeVariable } from '../backend/cmake'
import { useMemo } from 'react'
import { CMakeValue } from './CMakeValue'

export interface CMakeTableProps {
  entries: Record<string, CMakeVariable>
  advanced?: boolean
  search?: string
  onChangeEntry: (name: string, newValue: string) => void
  onDeleteEntry: (name: string) => void
}

export default function CMakeTable({ entries, advanced, search, onChangeEntry, onDeleteEntry }: CMakeTableProps): React.JSX.Element {
  const filteredEntries = useMemo(() => {
    const filteredEntries = advanced
      ? entries
      : Object.fromEntries(Object.entries(entries).filter(([_, variable]) => !variable.advanced))

    if (search) {
      const lowercasedSearch = search.toLowerCase()
      return Object.fromEntries(
        Object.entries(filteredEntries).filter(([name, variable]) =>
          name.toLowerCase().includes(lowercasedSearch) || variable.value.toLowerCase().includes(lowercasedSearch)
        )
      )
    }

    return filteredEntries
  }, [entries, advanced, search])

  return (
    <TableContainer
      component={Paper}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflow: 'auto' }}
    >
      <Table stickyHeader sx={{ minWidth: 650 }} size="small" aria-label="cmake values table">
        <TableHead>
          <TableRow>
            <TableCell align="left" />
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(Object.entries(filteredEntries)).map(([name, variable]) => (
            <TableRow key={name}>
              <TableCell sx={{ maxWidth: '48px' }}>
                <IconButton color='secondary' onClick={() => onDeleteEntry(name)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
              <TableCell>{name}</TableCell>
              <TableCell>
                <CMakeValue
                  varType={variable.varType}
                  value={variable.value}
                  onChange={(newValue) => {
                    onChangeEntry(name, newValue)
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
