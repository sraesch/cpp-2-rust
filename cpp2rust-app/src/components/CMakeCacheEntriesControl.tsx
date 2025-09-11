import { Label, makeStyles, Input, Button, useId, Checkbox } from "@fluentui/react-components"
import { AddRegular, SearchRegular } from "@fluentui/react-icons"
import { useCallback, useEffect, useState } from "react"
import { CMakeVariable } from "../backend"
import CMakeAddVariableDialog from "./CMakeAddVariableDialog"

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'end',
        flexWrap: 'nowrap',
        gap: "8px",
    },
    search: {
        flexGrow: 1,
    },
    field: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
    }
})

export interface CMakeCacheEntriesControlProps extends React.HTMLAttributes<HTMLDivElement> {
    minLabelWidth?: string
    searchString?: string
    grouped?: boolean
    advanced?: boolean
    onSearchChange?: (value: string) => void
    onGroupedChange?: (grouped: boolean) => void
    onAdvancedChange?: (advanced: boolean) => void
    onAddEntry?: (entry: CMakeVariable) => void
}

/**
 * Extracts the div props from the CMakeCacheEntriesControlProps
 * @param props Props of type CMakeCacheEntriesControlProps
 * @returns Div props for the container div
 */
function extractDivProps(props: CMakeCacheEntriesControlProps): React.HTMLAttributes<HTMLDivElement> {
    const { minLabelWidth, searchString, grouped, advanced, onSearchChange, onGroupedChange, onAdvancedChange, onAddEntry, ...divProps } = props
    return divProps
}

export default function CMakeCacheEntriesControl(props: CMakeCacheEntriesControlProps) {
    const divProps = extractDivProps(props)

    const classes = useStyles()
    const inputId = useId("input")
    const [searchString, setSearchString] = useState('')
    const [grouped, setGrouped] = useState(false)
    const [advanced, setAdvanced] = useState(false)
    const [showAddVarDialog, setShowAddVarDialog] = useState(false)

    useEffect(() => {
        if (props.searchString !== undefined) {
            setSearchString(props.searchString)
        }
    }, [props.searchString])

    useEffect(() => {
        if (props.grouped !== undefined) {
            setGrouped(props.grouped)
        }
    }, [props.grouped])

    useEffect(() => {
        if (props.advanced !== undefined) {
            setAdvanced(props.advanced)
        }
    }, [props.advanced])

    const handleCloseAddVarDialog = useCallback((variable?: CMakeVariable) => {
        setShowAddVarDialog(false)
        if (variable) {
            props.onAddEntry?.(variable)
        }
    }, [props])

    const handleSearchStringChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchString(value)
        props.onSearchChange?.(value)
    }, [props])

    const handleGroupFlagChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked
        setGrouped(checked)
        props.onGroupedChange?.(checked)
    }, [props])

    const handleAdvancedFlagChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked
        setAdvanced(checked)
        props.onAdvancedChange?.(checked)
    }, [props])

    return (
        <div className={classes.root} {...divProps}>
            <CMakeAddVariableDialog open={showAddVarDialog} onClose={handleCloseAddVarDialog} />
            <Label style={{ minWidth: props.minLabelWidth }} weight="semibold" htmlFor={inputId}>
                Search Variable
            </Label>
            <Input
                className={classes.search}
                id={inputId}
                appearance="outline"
                contentBefore={<SearchRegular />}
                value={searchString}
                onChange={handleSearchStringChange} />
            <Checkbox
                checked={grouped}
                onChange={handleGroupFlagChanged}
                label="Grouped"
            />
            <Checkbox
                checked={advanced}
                onChange={handleAdvancedFlagChanged}
                label="Advanced"
            />
            <Button icon={<AddRegular />} onClick={() => setShowAddVarDialog(true)}>Add Variable</Button>
        </div>
    )
}
