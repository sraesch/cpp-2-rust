import { CMakeVariable } from '../backend/cmake'
import { useMemo, useState } from 'react'
import {
    TableColumnDefinition,
    createTableColumn,
    TableColumnSizingOptions,
    makeStyles,
    Tree,
} from '@fluentui/react-components'
import { CacheEntries } from '../backend'
import { groupCMakeVariablesByPrefix, GroupedCMakeVariables } from '../grouping'
import CMakeSubTree from './CMakeSubTree'

export interface CMakeTreeProps {
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

const useStyles = makeStyles({
    root: {
        flex: "1 1 0",
        minHeight: "0",
        overflowX: "auto",
        overflowY: "auto",
        border: "1px solid #e0e0e0",
        borderRadius: "4px"
    },
})

export default function CMakeTree({ entries, advanced, search, onChangeEntry, onDeleteEntry }: CMakeTreeProps): React.JSX.Element {
    const classes = useStyles()
    const entriesArray: CMakeVariable[] = useMemo(() => Object.values(entries), [entries])

    const groupedVariables = useMemo<GroupedCMakeVariables>(() => {
        return groupCMakeVariablesByPrefix(entriesArray, advanced ?? false, search)
    }, [entriesArray, advanced, search])

    return (
        <div className={classes.root}>
            <Tree aria-label="CMake Variables Tree"
                size='small'
                style={{ minWidth: "600px" }}>
                {
                    Object.entries(groupedVariables.groups).map(([groupName, groupEntries]) => (
                        <CMakeSubTree
                            key={groupName}
                            groupName={groupName}
                            entries={groupEntries}
                            onChangeEntry={onChangeEntry}
                            onDeleteEntry={onDeleteEntry}
                        />
                    ))
                }
            </Tree>
        </div>
    )
}
