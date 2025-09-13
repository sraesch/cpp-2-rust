import { Button, Tree, TreeItem, TreeItemLayout, Text, makeStyles } from "@fluentui/react-components"
import { DeleteRegular } from '@fluentui/react-icons'
import { CMakeVariable } from "../backend"
import { CMakeValue } from "./CMakeValue"

export interface CMakeSubTreeProps {
    groupName: string
    entries: CMakeVariable[]
    onChangeEntry: (name: string, newValue: string) => void
    onDeleteEntry: (name: string) => void
}

const useStyles = makeStyles({
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        flexGrow: 1,
        width: '100%',
    },
    text: {
        marginRight: '8px',
        minWidth: '200px',
    },
    field: {
        flexGrow: 1,
    }
})

export default function CMakeSubTree(props: CMakeSubTreeProps): React.JSX.Element {
    const classes = useStyles()

    return (
        <TreeItem itemType="branch">
            <TreeItemLayout>{props.groupName}</TreeItemLayout>
            <Tree>
                {props.entries.map((entry) => (
                    <TreeItem key={entry.name} itemType="leaf">
                        <TreeItemLayout
                            actions={<Button
                                appearance="subtle"
                                onClick={() => props.onDeleteEntry(entry.name)}
                                icon={<DeleteRegular />}
                                aria-label="Delete"
                            />}
                            main={{ className: classes.item }}
                        >
                            <div className={classes.text}>
                                <Text>{entry.name}</Text>
                            </div>
                            <CMakeValue
                                varType={entry.varType}
                                value={entry.value}
                                onChange={(newValue) => {
                                    props.onChangeEntry(entry.name, newValue)
                                }}
                            />
                        </TreeItemLayout>
                    </TreeItem>
                ))}
            </Tree>
        </TreeItem>
    )
}