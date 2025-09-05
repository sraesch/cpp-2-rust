import { CMakeVariable } from '../backend/cmake'
import { useMemo } from 'react'
import { CMakeValue } from './CMakeValue'
import { Button, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableRow, TableColumnDefinition, useTableFeatures, createTableColumn, useTableColumnSizing_unstable } from '@fluentui/react-components'
import { DeleteRegular } from '@fluentui/react-icons'
import { CacheEntries } from '../backend'

export interface CMakeTableProps {
  entries: CacheEntries
  advanced?: boolean
  search?: string
  onChangeEntry: (name: string, newValue: string) => void
  onDeleteEntry: (name: string) => void
}

export default function CMakeTable({ entries, advanced, search, onChangeEntry, onDeleteEntry }: CMakeTableProps): React.JSX.Element {
  const entriesArray: CMakeVariable[] = useMemo(() => Object.values(entries), [entries])

  const filteredEntries: CMakeVariable[] = useMemo(() => {
    const filteredEntries = advanced
      ? entriesArray
      : entriesArray.filter((variable) => !variable.advanced)

    if (search) {
      const lowercasedSearch = search.toLowerCase()

      return entriesArray.filter(variable =>
        variable.name.toLowerCase().includes(lowercasedSearch) || variable.value.toLowerCase().includes(lowercasedSearch)
      )
    }

    return filteredEntries
  }, [entriesArray, advanced, search])

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
        {filteredEntries.map((variable) => (
          <TableRow key={variable.name}>
            <TableCell>{variable.name}</TableCell>
            <TableCell>
              <CMakeValue
                varType={variable.varType}
                value={variable.value}
                onChange={(newValue) => {
                  onChangeEntry(variable.name, newValue)
                }}
              />
            </TableCell>
            <TableCell role="gridcell">
              <TableCellLayout>
                <Button
                  appearance="subtle"
                  onClick={() => onDeleteEntry(variable.name)}
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
