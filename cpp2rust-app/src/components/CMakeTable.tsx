import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import { CMakeVariable } from '../cmake'

export interface CMakeTableProps {
  entries: Record<string, CMakeVariable>
  advanced?: boolean
}

export default function CMakeTable({ entries, advanced }: CMakeTableProps): React.JSX.Element {
  const filteredEntries = advanced
    ? entries
    : Object.fromEntries(Object.entries(entries).filter(([_, variable]) => !variable.advanced))

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
