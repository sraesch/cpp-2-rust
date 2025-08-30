import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import { CMakeVariable } from '../cmake'
import { useMemo } from 'react'

export interface CMakeTableProps {
  entries: Record<string, CMakeVariable>
  advanced?: boolean
  search?: string
}

export default function CMakeTable({ entries, advanced, search }: CMakeTableProps): React.JSX.Element {
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
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(Object.entries(filteredEntries)).map(([name, variable]) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell>{variable.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
