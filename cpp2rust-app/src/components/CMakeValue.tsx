import { Button, ButtonProps, Checkbox, Input, InputProps, useId } from "@fluentui/react-components"
import {
    OpenFolderRegular,
    OpenRegular
} from "@fluentui/react-icons"
import { CMakeVariableType } from "../backend/cmake"
import { selectFile, selectFolder } from "../tauri_utils"

export interface CMakeValueProps extends Omit<Partial<InputProps>, 'onChange'> {
    varType: CMakeVariableType
    value: string
    onChange: (newValue: string) => void
}

const FolderButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button
            {...props}
            appearance="transparent"
            icon={<OpenFolderRegular />}
            size="small"
        />
    )
}

const FileButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button
            {...props}
            appearance="transparent"
            icon={<OpenRegular />}
            size="small"
        />
    )
}

export function CMakeValue(props: CMakeValueProps): React.JSX.Element {
    const { varType, value, onChange } = props
    const inputId = useId("input")

    const handleOpenFolder = async () => {
        const folder = await selectFolder(value)
        if (folder) {
            onChange(folder)
        }
    }

    const handleOpenFile = async () => {
        const file = await selectFile(value)
        if (file) {
            onChange(file)
        }
    }

    if (varType === CMakeVariableType.BOOL) {
        return (
            <Checkbox
                checked={value === "ON" || value === "1" || value.toLowerCase() === "true"}
                onChange={(event) => onChange(event.target.checked ? "ON" : "OFF")}
            />
        )
    }

    if (varType === CMakeVariableType.STRING) {
        return (
            <Input
                id={inputId}
                {...props}
                onChange={(e) => onChange(e.target.value)}
                required />
        )
    }

    if (varType === CMakeVariableType.PATH || varType === CMakeVariableType.FILEPATH) {
        return (
            <Input
                {...props}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                contentAfter={
                    varType === CMakeVariableType.PATH ? <FolderButton onClick={handleOpenFolder} /> : <FileButton onClick={handleOpenFile} />
                }
            />
        )
    }

    return <span>{`Variable Type: $${varType}`}</span>
}