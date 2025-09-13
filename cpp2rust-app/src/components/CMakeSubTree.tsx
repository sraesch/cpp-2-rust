import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components"
import { CMakeVariable } from "../backend"

export interface CMakeSubTreeProps {
    groupName: string
    entries: CMakeVariable[]
    onChangeEntry: (name: string, newValue: string) => void
    onDeleteEntry: (name: string) => void

}

export default function CMakeSubTree(props: CMakeSubTreeProps): React.JSX.Element {
    return (
        <TreeItem itemType="branch">
            <TreeItemLayout>{props.groupName}</TreeItemLayout>
            <Tree>
                {props.entries.map((entry) => (
                    <TreeItem key={entry.name} itemType="leaf">
                        <TreeItemLayout>
                            {entry.name}
                        </TreeItemLayout>
                    </TreeItem>
                ))}
            </Tree>
        </TreeItem>
    )
}