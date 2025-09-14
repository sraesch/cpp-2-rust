import { CacheEntries } from "../backend"
import { CMakeVariable } from "../backend/cmake"
import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import {
    makeStyles,
    Button,
    Text
} from "@fluentui/react-components"
import {
    ChevronRightRegular,
    ChevronDownRegular,
    DeleteRegular,
    ResizeVideoRegular
} from "@fluentui/react-icons"
import { CMakeValue } from "./CMakeValue"

export interface CMakeTreeProps {
    entries: CacheEntries
    advanced?: boolean
    search?: string
    onChangeEntry: (name: string, newValue: string) => void
    onDeleteEntry: (name: string) => void
}

interface GroupedEntries {
    [groupName: string]: CMakeVariable[]
}

const useStyles = makeStyles({
    container: {
        flex: "1 1 0",
        minHeight: "0",
        overflowX: "auto",
        overflowY: "auto",
        border: "1px solid #e0e0e0",
        borderRadius: "4px"
    },
    header: {
        display: 'flex',
        backgroundColor: 'var(--colorNeutralBackground2)',
        borderBottom: '1px solid var(--colorNeutralStroke2)',
        position: 'relative',
        minHeight: '40px',
        alignItems: 'center'
    },
    headerCell: {
        padding: '8px 12px',
        fontWeight: '600',
        color: 'var(--colorNeutralForeground1)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
    },
    resizer: {
        position: 'absolute',
        right: '-3px',
        top: '0',
        bottom: '0',
        width: '6px',
        cursor: 'col-resize',
        backgroundColor: 'transparent',
        zIndex: 1,
        '&:hover': {
            backgroundColor: 'var(--colorBrandBackground)'
        }
    },
    resizerActive: {
        backgroundColor: 'var(--colorBrandBackground)'
    },
    content: {
        flex: 1,
        overflowY: 'auto'
    },
    groupHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'var(--colorNeutralBackground1)',
        borderBottom: '1px solid var(--colorNeutralStroke3)',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'var(--colorNeutralBackground1Hover)'
        }
    },
    groupIcon: {
        marginRight: '8px',
        fontSize: '12px'
    },
    groupTitle: {
        fontWeight: '600',
        color: 'var(--colorBrandForeground1)'
    },
    groupCount: {
        marginLeft: '8px',
        color: 'var(--colorNeutralForeground3)'
    },
    entryRow: {
        display: 'flex',
        minHeight: '36px',
        borderBottom: '1px solid var(--colorNeutralStroke3)',
        alignItems: 'center',
        '&:hover': {
            backgroundColor: 'var(--colorNeutralBackground1Hover)'
        }
    },
    entryCell: {
        padding: '8px 12px',
        overflow: 'hidden'
    },
    entryName: {
        fontFamily: 'var(--fontFamilyMonospace)',
        fontSize: '13px',
        color: 'var(--colorNeutralForeground1)'
    },
    entryValue: {
        display: 'flex',
        alignItems: 'center',
        width: '100%'
    },
    deleteCell: {
        padding: '4px 8px',
        display: 'flex',
        justifyContent: 'center',
        width: '40px',
        minWidth: '40px'
    }
})

export default function CMakeTree({ entries, advanced, search, onChangeEntry, onDeleteEntry }: CMakeTreeProps): React.JSX.Element {
    const classes = useStyles()
    const [keyColumnWidth, setKeyColumnWidth] = useState(300)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const [isResizing, setIsResizing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const resizerRef = useRef<HTMLDivElement>(null)

    const filteredEntries = useMemo(() => {
        const entriesArray: CMakeVariable[] = Object.values(entries)

        let filtered = advanced
            ? entriesArray
            : entriesArray.filter((variable) => !variable.advanced)

        if (search) {
            const lowercasedSearch = search.toLowerCase()
            filtered = filtered.filter(variable =>
                variable.name.toLowerCase().includes(lowercasedSearch) ||
                variable.value.toLowerCase().includes(lowercasedSearch)
            )
        }

        return filtered
    }, [entries, advanced, search])

    const filteredGroupedEntries = useMemo(() => {
        const groups: GroupedEntries = {}

        // First pass: group by prefix
        filteredEntries.forEach(entry => {
            const underscoreIndex = entry.name.indexOf('_')
            const prefix = underscoreIndex > 0 ? entry.name.substring(0, underscoreIndex) : entry.name

            if (!groups[prefix]) {
                groups[prefix] = []
            }
            groups[prefix].push(entry)
        })

        // Second pass: move single-item groups to "Ungrouped Entries"
        const ungroupedEntries: CMakeVariable[] = []
        const finalGroups: GroupedEntries = {}

        Object.entries(groups).forEach(([groupName, groupEntries]) => {
            if (groupEntries.length === 1) {
                ungroupedEntries.push(...groupEntries)
            } else {
                finalGroups[groupName] = groupEntries
            }
        })

        if (ungroupedEntries.length > 0) {
            finalGroups["Ungrouped Entries"] = ungroupedEntries
        }

        return finalGroups
    }, [filteredEntries])

    const toggleGroup = useCallback((groupName: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev)
            if (newSet.has(groupName)) {
                newSet.delete(groupName)
            } else {
                newSet.add(groupName)
            }
            return newSet
        })
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return

            const containerRect = containerRef.current.getBoundingClientRect()
            const newWidth = e.clientX - containerRect.left
            const minWidth = 150
            const maxWidth = containerRect.width - 200 // Leave space for value column and delete button

            setKeyColumnWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)))
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)

            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isResizing])

    const valueColumnWidth = containerRef.current ?
        containerRef.current.clientWidth - keyColumnWidth - 40 : // 40px for delete button
        300

    return (
        <div className={classes.container} ref={containerRef}>
            {/* Header */}
            <div className={classes.header}>
                <div
                    className={classes.headerCell}
                    style={{ width: keyColumnWidth, position: 'relative' }}
                >
                    Key
                    <div
                        ref={resizerRef}
                        className={`${classes.resizer} ${isResizing ? classes.resizerActive : ''}`}
                        onMouseDown={handleMouseDown}
                    >
                        <ResizeVideoRegular style={{ fontSize: '12px', margin: 'auto' }} />
                    </div>
                </div>
                <div
                    className={classes.headerCell}
                    style={{ width: valueColumnWidth }}
                >
                    Value
                </div>
                <div className={classes.headerCell} style={{ width: 40 }}>
                    {/* Actions column header */}
                </div>
            </div>

            {/* Content */}
            <div className={classes.content}>
                {Object.entries(filteredGroupedEntries)
                    .sort(([a], [b]) => {
                        // Sort "Ungrouped Entries" last
                        if (a === "Ungrouped Entries") return 1
                        if (b === "Ungrouped Entries") return -1
                        return a.localeCompare(b)
                    })
                    .map(([groupName, groupEntries]) => {
                        const isExpanded = expandedGroups.has(groupName)

                        return (
                            <div key={groupName}>
                                {/* Group Header */}
                                <div
                                    className={classes.groupHeader}
                                    onClick={() => toggleGroup(groupName)}
                                >
                                    <div className={classes.groupIcon}>
                                        {isExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                                    </div>
                                    <Text className={classes.groupTitle}>
                                        {groupName}
                                    </Text>
                                    <Text className={classes.groupCount}>
                                        ({groupEntries.length})
                                    </Text>
                                </div>

                                {/* Group Entries */}
                                {isExpanded && groupEntries
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(entry => (
                                        <div key={entry.name} className={classes.entryRow}>
                                            <div
                                                className={classes.entryCell}
                                                style={{ width: keyColumnWidth }}
                                            >
                                                <Text className={classes.entryName}>
                                                    {entry.name}
                                                </Text>
                                            </div>
                                            <div
                                                className={classes.entryCell}
                                                style={{ width: valueColumnWidth }}
                                            >
                                                <div className={classes.entryValue}>
                                                    <CMakeValue
                                                        varType={entry.varType}
                                                        value={entry.value}
                                                        onChange={(newValue) => onChangeEntry(entry.name, newValue)}
                                                    />
                                                </div>
                                            </div>
                                            <div className={classes.deleteCell}>
                                                <Button
                                                    appearance="subtle"
                                                    size="small"
                                                    onClick={() => onDeleteEntry(entry.name)}
                                                    icon={<DeleteRegular />}
                                                    aria-label={`Delete ${entry.name}`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}