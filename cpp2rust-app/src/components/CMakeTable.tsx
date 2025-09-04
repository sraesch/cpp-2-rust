import { CMakeVariable } from '../backend/cmake'
import { useMemo } from 'react'
import { CMakeValue } from './CMakeValue'
import { Button, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableRow } from '@fluentui/react-components'
import { DeleteRegular } from '@fluentui/react-icons'

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
    <Table size='small' role="grid" style={{ minWidth: "600px" }} aria-label="cmake values table">
      <TableHeader>
        <TableRow>
          <TableCell align="left">Name</TableCell>
          <TableCell align="left">Value</TableCell>
          <TableCell align="left" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from(Object.entries(filteredEntries)).map(([name, variable]) => (
          <TableRow key={name}>
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
            <TableCell role="gridcell">
              <TableCellLayout>
                <Button
                  appearance="subtle"
                  onClick={() => onDeleteEntry(name)}
                  icon={<DeleteRegular />}
                  aria-label="Delete"
                />
              </TableCellLayout>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
