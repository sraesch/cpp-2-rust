import Checkbox from "@mui/material/Checkbox"
import TextField from "@mui/material/TextField"
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from "@mui/material/IconButton"
import FileOpen from "@mui/icons-material/FileOpen"
import FolderOpen from "@mui/icons-material/FolderOpen"
import { CMakeVariableType } from "../cmake"
import { selectFile, selectFolder } from "../tauri_utils"

export interface CMakeValueProps {
    varType: CMakeVariableType
    value: string
    onChange: (newValue: string) => void
}

export function CMakeValue(props: CMakeValueProps): React.JSX.Element {
    const { varType, value, onChange } = props

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
                size="small"
                checked={value === "ON" || value === "1" || value.toLowerCase() === "true"}
                onChange={(event) => onChange(event.target.checked ? "ON" : "OFF")}
            />
        )
    }

    if (varType === CMakeVariableType.STRING) {
        return (
            <TextField
                size="small"
                variant="standard"
                value={value}
                fullWidth
                onChange={(event) => onChange(event.target.value)}
            />
        )
    }

    if (varType === CMakeVariableType.PATH || varType === CMakeVariableType.FILEPATH) {
        return (
            <TextField
                size="small"
                variant="standard"
                value={value}
                fullWidth
                onChange={(event) => onChange(event.target.value)}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={
                                        varType === CMakeVariableType.PATH ? 'Choose a folder' : 'Choose a file'
                                    }
                                    onClick={varType === CMakeVariableType.PATH ? handleOpenFolder : handleOpenFile}
                                    edge="end"
                                >
                                    {varType === CMakeVariableType.PATH ? <FolderOpen fontSize="small" /> : <FileOpen fontSize="small" />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
        )
    }

    return <span>{`Variable Type: $${varType}`}</span>
}