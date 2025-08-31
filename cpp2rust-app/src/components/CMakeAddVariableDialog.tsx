import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'

import { CMakeVariable, CMakeVariableType, isCMakeVariableNameValid, isCMakeVariableValid } from '../cmake';
import { useEffect, useMemo, useState } from 'react'
import { CMakeValue } from './CMakeValue'

export interface CMakeAddVariableDialogProps {
    open?: boolean;
    onClose?: (variable?: CMakeVariable) => void;
}

export default function CMakeAddVariableDialog(props: CMakeAddVariableDialogProps): React.JSX.Element {
    const [name, setName] = useState<string>('')
    const [value, setValue] = useState<string>('OFF')
    const [type, setType] = useState<CMakeVariableType>(CMakeVariableType.BOOL)

    // clear everything when the dialog is being opened
    useEffect(() => {
        if (props.open) {
            setName('')
            setValue('OFF')
            setType(CMakeVariableType.BOOL)
        }
    }, [props.open])

    const isValid = useMemo(() => {
        return isCMakeVariableValid({ name, varType: type, value, advanced: false })
    }, [name, value])

    const isVariableNameValid = useMemo(() => {
        return isCMakeVariableNameValid(name);
    }, [name])

    const resetValue = (newType: CMakeVariableType) => {
        if (newType === CMakeVariableType.BOOL) {
            setValue('OFF')
        } else {
            setValue('')
        }
    }

    const handleChangeVariableType = (event: SelectChangeEvent<CMakeVariableType>) => {
        setType(event.target.value)
        resetValue(event.target.value)
    }

    return (
        <Dialog open={props.open || false} onClose={() => props.onClose?.()} maxWidth="md">
            <DialogTitle>Add CMake Variable</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'start', alignItems: 'stretch' }}>
                <TextField variant='standard'
                    size='small'
                    label="Variable Name"
                    fullWidth
                    value={name} onChange={(e) => setName(e.target.value)}
                    sx={{
                        minWidth: 360
                    }}
                    error={!isVariableNameValid}
                    helperText={!isVariableNameValid ? 'Invalid variable name' : ''}
                />

                <Select
                    size='small'
                    variant='standard'
                    labelId="variable-type-label"
                    id="variable-type-select"
                    value={type}
                    label="Variable Type"
                    onChange={handleChangeVariableType}
                    sx={{ minWidth: 120 }}
                >
                    <MenuItem value={CMakeVariableType.BOOL}>Boolean</MenuItem>
                    <MenuItem value={CMakeVariableType.STRING}>String</MenuItem>
                    <MenuItem value={CMakeVariableType.FILEPATH}>File Path</MenuItem>
                    <MenuItem value={CMakeVariableType.PATH}>Directory Path</MenuItem>
                </Select>
                <Box>
                    <CMakeValue varType={type} value={value} onChange={setValue} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose?.()}>Cancel</Button>
                <Button disabled={!isValid} onClick={() => props.onClose?.({ name, varType: type, value, advanced: false })}>Add Variable</Button>
            </DialogActions>
        </Dialog>
    );
}