import { AccordionHeader, AccordionItem, AccordionPanel, Button, Text, makeStyles } from "@fluentui/react-components"
import { CMakeVariable } from "../../backend"
import { CMakeValue } from "../CMakeValue"
import { DeleteRegular } from "@fluentui/react-icons"

export interface CMakeTreeGroupProps {
    title: string
    entries: CMakeVariable[]
    columnWidth: number
    disabled?: boolean
    onChangeEntry: (name: string, newValue: string) => void
    onDeleteEntry: (name: string) => void
}

const useStyles = makeStyles({
    panel: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflow: 'hidden',
    },
    cell1: {
        padding: '8px',
        marginLeft: '16px',
        color: 'var(--colorNeutralForeground1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
    },
    cell2: {
        padding: '8px',
        color: 'var(--colorNeutralForeground1)',
        overflow: 'hidden',
        display: 'flex',
        flexWrap: 'nowrap',
        flexGrow: 1,
        alignItems: 'stretch'
    },
})



export default function CMakeTreeGroup({ title, entries, columnWidth, disabled, onChangeEntry, onDeleteEntry }: CMakeTreeGroupProps): React.JSX.Element {
    const classes = useStyles()

    return (
        <AccordionItem value={`${title}`}>
            <AccordionHeader>{`${title} (${entries.length})`}</AccordionHeader>
            {entries.map((entry) => (
                <AccordionPanel key={entry.name} className={classes.panel}>
                    <div className={classes.cell1} style={{ width: `${columnWidth}px` }}>
                        <Text>{entry.name}</Text>
                    </div>
                    <div className={classes.cell2}>
                        <CMakeValue
                            varType={entry.varType}
                            value={entry.value}
                            disabled={disabled}
                            style={{ flexGrow: 1 }}
                            onChange={(newValue) => onChangeEntry(entry.name, newValue)}
                        />
                    </div>
                    <Button
                        appearance="subtle"
                        size="small"
                        onClick={() => onDeleteEntry(entry.name)}
                        icon={<DeleteRegular />}
                        disabled={disabled}
                        aria-label={`Delete ${entry.name}`}
                    />
                </AccordionPanel>
            ))}
        </AccordionItem>
    )
}