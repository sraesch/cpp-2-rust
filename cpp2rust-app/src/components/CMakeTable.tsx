import { CMakeVariable } from '../backend/cmake'
import { useMemo, useState } from 'react'
import { CMakeValue } from './CMakeValue'
import { Button, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableRow, TableColumnDefinition, useTableFeatures, createTableColumn, useTableColumnSizing_unstable, Menu, MenuTrigger, TableHeaderCell, MenuPopover, MenuList, MenuItem, TableColumnSizingOptions } from '@fluentui/react-components'
import { DeleteRegular } from '@fluentui/react-icons'
import { CacheEntries } from '../backend'

export interface CMakeTableProps {
  entries: CacheEntries
  advanced?: boolean
  search?: string
  onChangeEntry: (name: string, newValue: string) => void
  onDeleteEntry: (name: string) => void
}

const columnsDef: TableColumnDefinition<CMakeVariable>[] = [
  createTableColumn<CMakeVariable>({
    columnId: "name",
    renderHeaderCell: () => <>Name</>,
  }),
  createTableColumn<CMakeVariable>({
    columnId: "value",
    renderHeaderCell: () => <>Value</>,
  }),
  createTableColumn<CMakeVariable>({
    columnId: "actions",
    renderHeaderCell: () => <></>,
  }),
]

const columnSizingOptions: TableColumnSizingOptions = {
  name: {
    idealWidth: 300,
    minWidth: 150,
  },
  value: {
    minWidth: 110,
    defaultWidth: 250,
  },
  actions: {
    minWidth: 32,
    idealWidth: 32,
    defaultWidth: 32,
  },
}

export default function CMakeTable({ entries, advanced, search, onChangeEntry, onDeleteEntry }: CMakeTableProps): React.JSX.Element {
  const entriesArray: CMakeVariable[] = useMemo(() => Object.values(entries), [entries])
  const [columns] = useState<TableColumnDefinition<CMakeVariable>[]>(columnsDef);

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


  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { getRows, columnSizing_unstable, tableRef } = useTableFeatures<CMakeVariable>(
    {
      columns,
      items: filteredEntries,
    },
    [
      useTableColumnSizing_unstable({
        columnSizingOptions,
        autoFitColumns: false,
      }),
    ]
  )
  const rows = getRows()

  return (
    <div style={{
      height: "33vh",
      overflowX: "auto",
      overflowY: "auto",
      border: "1px solid #e0e0e0",
      borderRadius: "4px"
    }}>
      <Table ref={tableRef}
        {...columnSizing_unstable.getTableProps()}
        noNativeElements={true}
        size='small'
        role="grid"
        style={{ minWidth: "600px" }}
        aria-label="cmake values table">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <Menu openOnContext key={column.columnId}>
                <MenuTrigger>
                  <TableHeaderCell
                    key={column.columnId}
                    {...columnSizing_unstable.getTableHeaderCellProps(
                      column.columnId
                    )}
                  >
                    {column.renderHeaderCell()}
                  </TableHeaderCell>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      onClick={columnSizing_unstable.enableKeyboardMode(
                        column.columnId
                      )}
                    >
                      Keyboard Column Resizing
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((variable) => (
            <TableRow key={variable.item.name}>
              <TableCell {...columnSizing_unstable.getTableCellProps("name")}>
                <TableCellLayout truncate>
                  {variable.item.name}
                </TableCellLayout>
              </TableCell>
              <TableCell {...columnSizing_unstable.getTableCellProps("value")}>
                <TableCellLayout truncate>
                  <CMakeValue
                    varType={variable.item.varType}
                    value={variable.item.value}
                    onChange={(newValue) => {
                      onChangeEntry(variable.item.name, newValue)
                    }}
                  />
                </TableCellLayout>
              </TableCell>
              <TableCell {...columnSizing_unstable.getTableCellProps("actions")}>
                <TableCellLayout truncate>
                  <Button
                    appearance="subtle"
                    onClick={() => onDeleteEntry(variable.item.name)}
                    icon={<DeleteRegular />}
                    aria-label="Delete"
                  />
                </TableCellLayout>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
