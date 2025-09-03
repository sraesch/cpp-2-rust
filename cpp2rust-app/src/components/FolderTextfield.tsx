import { makeStyles, useId, Input, Label } from "@fluentui/react-components";
import type { InputProps } from "@fluentui/react-components";

const useStyles = makeStyles({
    root: {
        // Stack the label above the field
        display: "flex",
        flexDirection: "row",
        alignItems: "end",
        // Use 2px gap below the label (per the design system)
        gap: "2px",
        // Prevent the example from taking the full width of the page (optional)
        maxWidth: "400px",
    },
    input: {
        flexGrow: 1,
        width: "512px",
    },
});

export interface FolderTextFieldProps extends InputProps {
    label: string;
}

export const FolderTextField = (props: FolderTextFieldProps) => {
    const inputId = useId("input");
    const styles = useStyles();

    return (
        <div className={styles.root}>
            <Label weight="semibold" htmlFor={inputId} size={props.size} disabled={props.disabled}>
                {props.label}
            </Label>
            <Input className={styles.input} id={inputId} {...props} />
        </div>
    );
};