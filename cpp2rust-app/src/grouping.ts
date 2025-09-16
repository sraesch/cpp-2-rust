import { CMakeVariable } from "./backend/cmake"

/**
 * Extracts the prefix of a CMake variable name.
 * @param name {string} Name of the CMake variable
 * @returns {string} The prefix of the variable (the part before the first underscore)
 */
export function getVariablePrefix(name: string): string {
    return name.split('_')[0]
}

/**
 * Interface representing grouped CMake variables.
 */
export interface GroupedCMakeVariables {
    groups: Record<string, CMakeVariable[]>
    ungrouped: CMakeVariable[]
}

/**
 * Groups CMake variables by their prefix (the part before the first underscore).
 * If a group contains only one variable, it is merged into the "Ungrouped Variables" group.
 * Thus, there are only groups with multiple variables and/or the "Ungrouped Variables" group.
 * @param variables {CMakeVariable[]} Array of CMake variables to group.
 * @returns {GroupedCMakeVariables} The grouped CMake variables.
 */
export function groupCMakeVariablesByPrefix(variables: CMakeVariable[]): GroupedCMakeVariables {
    const grouped: GroupedCMakeVariables = {
        groups: {},
        ungrouped: []
    }

    // Sort variables into groups based on their prefix
    variables.forEach((variable) => {
        const prefix = getVariablePrefix(variable.name)
        if (!grouped.groups[prefix]) {
            grouped.groups[prefix] = []
        }

        grouped.groups[prefix].push(variable)
    })

    // Merge elements from groups with only one element into the "Ungrouped Variables" group
    // and remove the respective groups
    for (const prefix in grouped.groups) {
        if (grouped.groups[prefix].length === 1) {
            grouped.ungrouped.push(grouped.groups[prefix][0])
            delete grouped.groups[prefix]
        }
    }

    // Sort the elements of each group alphabetically by variable name
    for (const prefix in grouped.groups) {
        grouped.groups[prefix].sort((a, b) => a.name.localeCompare(b.name))
    }

    // Sort the ungrouped variables alphabetically by variable name
    grouped.ungrouped.sort((a, b) => a.name.localeCompare(b.name))

    return grouped
}

/**
 * Filters a CMake variable based on the advanced mode and search string.
 * @param variable {CMakeVariable} The CMake variable to filter.
 * @param advanced {boolean} Whether to include advanced variables.
 * @param lowercasedSearch {string | undefined} The lowercased search string.
 * @returns {boolean} True if the variable passes the filters, false otherwise.
 */
function filterCMakeVariable(variable: CMakeVariable, advanced: boolean, lowercasedSearch?: string): boolean {
    // Skip advanced entries if not in advanced mode
    if (!advanced && variable.advanced) {
        return false
    }

    // Skip entries that do not match the search string
    if (lowercasedSearch) {
        if (!variable.name.toLowerCase().includes(lowercasedSearch) && !variable.value.toLowerCase().includes(lowercasedSearch)) {
            return false
        }
    }
    return true
}

/**
 * Groups CMake variables by their prefix (the part before the first underscore).
 * If a group contains only one variable (without filtering), it is merged into the "Ungrouped Variables" group.
 * Thus, there are only groups with multiple variables and/or the "Ungrouped Variables" group.
 * @param variables {CMakeVariable[]} Array of CMake variables to group
 * @param advanced {boolean} Whether to include advanced variables
 * @param search {string | undefined} Optional search string to filter variables
 * @returns {Record<string, CMakeVariable[]>} A record of grouped CMake variables
 */

export function filterGroupedCMakeVariables(grouped: GroupedCMakeVariables, advanced: boolean, search?: string): GroupedCMakeVariables {
    const filtered: GroupedCMakeVariables = {
        groups: {},
        ungrouped: []
    }

    const lowercasedSearch = search?.toLowerCase()

    // Filter each group
    for (const prefix in grouped.groups) {
        const filteredGroup = grouped.groups[prefix].filter((variable) => filterCMakeVariable(variable, advanced, lowercasedSearch))

        if (filteredGroup.length > 0) {
            filtered.groups[prefix] = filteredGroup
        }
    }

    // Add ungrouped variables
    filtered.ungrouped.push(...grouped.ungrouped.filter((variable) => filterCMakeVariable(variable, advanced, lowercasedSearch)))

    return filtered
}
