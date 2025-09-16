import { Divider, makeStyles, Text } from "@fluentui/react-components"
import { useRef, useState } from "react"

export interface CMakeTreeHeaderProps {
    leftMinWidth: number
    rightMinWidth: number
    initialLeftWidth: number
    onChangeSize?: (left: number) => void
}

const useStyles = makeStyles({
    header: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'var(--colorNeutralBackground1)',
        borderBottom: '1px solid var(--colorNeutralStroke2)',
        alignItems: 'stretch'
    },
    headerDiv: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'col-resize'
    },
    headerDivider: {
        margin: '4px 4px',
    },
    headerCell1: {
        padding: '8px',
        color: 'var(--colorNeutralForeground1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
    },
    headerCell2: {
        padding: '8px',
        color: 'var(--colorNeutralForeground1)',
        overflow: 'hidden',
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center'
    },
})

export default function CMakeTreeHeader({ onChangeSize, leftMinWidth, rightMinWidth, initialLeftWidth }: CMakeTreeHeaderProps): React.JSX.Element {
    const classes = useStyles()
    const [headerCellWidth, setHeaderCellWidth] = useState(initialLeftWidth)
    const headerElement = useRef<HTMLDivElement>(null)


    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!headerElement.current) {
            return
        }

        const maxWidth = headerElement.current.clientWidth - rightMinWidth

        event.preventDefault()
        const startX = event.clientX
        const startWidth = headerCellWidth

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = startWidth + (moveEvent.clientX - startX)
            const clampedWidth = Math.min(Math.max(newWidth, leftMinWidth), maxWidth) // Minimum width of leftMinWidth, maximum width of maxWidth
            setHeaderCellWidth(clampedWidth)
            onChangeSize?.(clampedWidth)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <div ref={headerElement} className={classes.header}>
            <div className={classes.headerCell1} style={{ width: headerCellWidth }}>
                <Text>Name</Text>
            </div>
            <div className={classes.headerDiv} onMouseDown={handleMouseDown}>
                <Divider vertical className={classes.headerDivider} />
            </div>
            <div className={classes.headerCell2}>
                <Text>Value</Text>
            </div>
        </div>
    )
}