import { Accordion, makeStyles } from "@fluentui/react-components"
import { CacheEntries, CMakeVariable } from "../../backend"
import { useMemo, useState } from "react"
import CMakeTreeHeader from "./header"
import CMakeTreeGroup from "./group"
import { filterGroupedCMakeVariables, groupCMakeVariablesByPrefix, GroupedCMakeVariables } from "../../grouping"

export interface CMakeTreeProps {
    entries: CacheEntries
    advanced?: boolean
    search?: string
    disabled?: boolean
    onChangeEntry: (name: string, newValue: string) => void
    onDeleteEntry: (name: string) => void
}

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0",
        border: "1px solid #e0e0e0",
        borderRadius: "4px"
    },
    content: {
        flex: "1 1 0",
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
    },
})

interface Group {
    name: string
    entries: CMakeVariable[]
}

type Groups = Group[]

const UNGROUPED: string = "Ungrouped Entries"

export default function CMakeTree(props: CMakeTreeProps): React.JSX.Element {
    const classes = useStyles()
    const [headerCellWidth, setHeaderCellWidth] = useState(256)

    // First: Group the entries by prefix.
    const groupedEntries: GroupedCMakeVariables = useMemo(() => {
        return groupCMakeVariablesByPrefix(Object.values(props.entries))
    }, [props.entries])

    // Second: Filter the entries based on advanced flag and search string.
    // The result is a mapping from group name to list of entries in that group.
    const filteredGroupedEntries: Groups = useMemo(() => {
        const filtered: GroupedCMakeVariables = filterGroupedCMakeVariables(groupedEntries, props.advanced ?? false, props.search)
        const ungrouped: Group = { name: UNGROUPED, entries: filtered.ungrouped }
        const result: Groups = Object.entries(filtered.groups).map(([group, entries]) => ({ name: group, entries }))
        return [ungrouped, ...result]
    }, [groupedEntries, props.advanced, props.search])

    return (
        <div className={classes.container}>
            <CMakeTreeHeader
                leftMinWidth={256}
                rightMinWidth={256}
                initialLeftWidth={headerCellWidth}
                onChangeSize={setHeaderCellWidth} />
            <div className={classes.content}>
                <Accordion
                    multiple
                    collapsible
                >
                    {filteredGroupedEntries.map(({ name, entries }) => (
                        <CMakeTreeGroup
                            key={name}
                            columnWidth={headerCellWidth}
                            title={name}
                            entries={entries}
                            disabled={props.disabled}
                            onChangeEntry={props.onChangeEntry}
                            onDeleteEntry={props.onDeleteEntry}
                        />
                    ))}
                </Accordion>
            </div>
        </div>
    )
}