import { CMakeVariable, CMakeVariableType, isCMakeVariableValid } from '../backend/cmake';
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CMakeValue } from './CMakeValue'
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    makeStyles,
    useId,
    Label,
    Input,
    Select,
} from "@fluentui/react-components"

const useStyles = makeStyles({
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        justifyContent: 'start',
        alignItems: 'stretch'
    },
    fieldWithLabel: {
        // Stack the label above the field
        display: "flex",
        flexDirection: "column",
        // Use 2px gap below the label (per the design system)
        gap: "2px",
    },
})

export interface CMakeAddVariableDialogProps {
    open?: boolean;
    onClose?: (variable?: CMakeVariable) => void;
}

export default function CMakeAddVariableDialog(props: CMakeAddVariableDialogProps): React.JSX.Element {
    const classes = useStyles()
    const [name, setName] = useState<string>('')
    const [value, setValue] = useState<string>('OFF')
    const [type, setType] = useState<CMakeVariableType>(CMakeVariableType.BOOL)
    const inputId = useId("name")
    const selectId = useId("type")
    const valueId = useId("value")

    // clear everything when the dialog is being opened
    useEffect(() => {
        if (props.open) {
            setName('')
            setValue('OFF')
            setType(CMakeVariableType.BOOL)
        }
    }, [props.open])

    // Memoized validation check
    const isValid = useMemo(() => {
        return isCMakeVariableValid({ name, varType: type, value, advanced: false })
    }, [name, value, type])

    // Callback to reset the value to bool with false
    const resetValue = useCallback((newType: CMakeVariableType) => {
        if (newType === CMakeVariableType.BOOL) {
            setValue('OFF')
        } else {
            setValue('')
        }
    }, [])

    // Callback for changing the variable type
    const handleChangeVariableType = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setType(event.target.value as CMakeVariableType)
        resetValue(event.target.value as CMakeVariableType)
    }, [resetValue])

    return (
        <Dialog open={props.open || false} onOpenChange={() => props.onClose?.()}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>Add Variable</DialogTitle>
                    <DialogContent className={classes.content}>
                        <div className={classes.fieldWithLabel}>
                            <Label htmlFor={inputId}>
                                Variable Name
                            </Label>
                            <Input
                                id={inputId}
                                {...props}
                                onChange={(e) => setName(e.target.value)}
                                required />
                        </div>
                        <div>
                            <Label htmlFor={selectId}>Variable Type</Label>
                            <Select
                                id={selectId}
                                {...props}
                                onChange={handleChangeVariableType}>
                                <option value={CMakeVariableType.BOOL}>Boolean</option>
                                <option value={CMakeVariableType.STRING}>String</option>
                                <option value={CMakeVariableType.FILEPATH}>File Path</option>
                                <option value={CMakeVariableType.PATH}>Directory Path</option>
                            </Select>
                        </div>
                        <div className={classes.fieldWithLabel}>
                            <Label htmlFor={valueId}>Variable Value</Label>
                            <CMakeValue varType={type} value={value} onChange={setValue} />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => props.onClose?.()}>Cancel</Button>
                        <Button
                            disabled={!isValid}
                            appearance="primary"
                            onClick={() => props.onClose?.({ name, varType: type, value, advanced: false })}
                        >
                            Add Variable
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}