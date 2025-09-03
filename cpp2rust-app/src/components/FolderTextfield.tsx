import { makeStyles, useId, Input, Label, Button, type InputProps } from "@fluentui/react-components";
import {
    FolderOpenRegular,
} from "@fluentui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { selectFolder } from "../tauri_utils";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "row",
        alignItems: "end",
        gap: "8px",
    },
    input: {
        flexGrow: 1,
    },
});

/**
 * Extend the default input props and override onChange event.
 */
export interface FolderTextFieldProps extends Omit<InputProps, 'onChange'> {
    label: string;
    minLabelWidth?: string;
    onChange?: (newValue: string) => void;
}

export const FolderTextField = (props: FolderTextFieldProps) => {
    const [value, setValue] = useState<string>(props.value || '')
    const inputId = useId("input");
    const styles = useStyles();

    // Sync local state with prop changes
    useEffect(() => setValue(props.value || ''), [props.value]);

    // Callback for changing the value and triggering the onChange prop
    const changeValue = useCallback((newValue: string) => {
        setValue(newValue);
        if (props.onChange) {
            props.onChange(newValue);
        }
    }, [props]);

    // Callback for browsing the folder
    const handleBrowseSource = useCallback((): void => {
        console.log('Browse Source Directory')

        // Trigger open dialog in app backend
        selectFolder(value).then((folder) => {
            if (folder) {
                changeValue(folder)
            }
        })
    }, [value, changeValue])

    return (
        <div className={styles.root}>
            <Label style={{ minWidth: props.minLabelWidth }} weight="semibold" htmlFor={inputId} size={props.size} disabled={props.disabled}>
                {props.label}
            </Label>
            <Input className={styles.input} id={inputId} {...props} value={value} onChange={(e) => changeValue(e.target.value)} />
            <Button icon={<FolderOpenRegular />} onClick={handleBrowseSource}>Browse</Button>
        </div>
    );
};