import { CMakeVariable } from '../backend/cmake'
import { useMemo } from 'react'
import {
    makeStyles,
    Tree,
} from '@fluentui/react-components'
import { CacheEntries } from '../backend'
import { filterGroupedCMakeVariables, groupCMakeVariablesByPrefix, GroupedCMakeVariables } from '../grouping'
import CMakeSubTree from './CMakeSubTree'

export interface CMakeTreeProps {
    entries: CacheEntries
    advanced?: boolean
    search?: string
    onChangeEntry: (name: string, newValue: string) => void
    onDeleteEntry: (name: string) => void
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

    // Group the variables by their prefix
    const groupedVariables = useMemo<GroupedCMakeVariables>(() => {
        return groupCMakeVariablesByPrefix(entriesArray)
    }, [entriesArray])

    // Filter the grouped variables based on the advanced mode and search string
    // (no filtering for now)
    const filteredGroupedVariables = useMemo<GroupedCMakeVariables>(() => {
        return filterGroupedCMakeVariables(groupedVariables, advanced ?? false, search)
    }, [groupedVariables, advanced, search])

    return (
        <div className={classes.root}>
            <Tree aria-label="CMake Variables Tree"
                size='small'
                style={{ minWidth: "600px" }}>
                {
                    Object.entries(filteredGroupedVariables.groups).map(([groupName, groupEntries]) => (
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
