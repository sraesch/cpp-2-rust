import { CacheEntries } from "../backend"
import CMakeTable from "./CMakeTable"
import CMakeTree from "./cmake_tree"

export interface CMakeVariablesProps {
    entries: CacheEntries
    advanced?: boolean
    search?: string
    grouped?: boolean
    disabled?: boolean
    onChangeEntry: (name: string, newValue: string) => void
    onDeleteEntry: (name: string) => void
}

export default function CMakeVariables({ entries, advanced, search, grouped, onChangeEntry, onDeleteEntry, disabled }: CMakeVariablesProps): React.JSX.Element {
    if (grouped) {
        return <CMakeTree
            entries={entries}
            advanced={advanced}
            search={search}
            onChangeEntry={onChangeEntry}
            onDeleteEntry={onDeleteEntry}
            disabled={disabled}
        />
    } else {
        return <CMakeTable
            entries={entries}
            advanced={advanced}
            search={search}
            onChangeEntry={onChangeEntry}
            onDeleteEntry={onDeleteEntry}
            disabled={disabled}
        />
    }
}