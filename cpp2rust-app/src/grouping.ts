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
 * @param variables {CMakeVariable[]} Array of CMake variables to group
 * @param advanced {boolean} Whether to include advanced variables
 * @param search {string | undefined} Optional search string to filter variables
 * @returns {Record<string, CMakeVariable[]>} A record of grouped CMake variables
 */
export function groupCMakeVariablesByPrefix(variables: CMakeVariable[], advanced: boolean, search?: string): GroupedCMakeVariables {
    const grouped: GroupedCMakeVariables = {
        groups: {},
        ungrouped: []
    }

    const lowercasedSearch = search?.toLowerCase()

    // Sort variables into groups based on their prefix and apply filters
    variables.forEach((variable) => {
        // Skip advanced entries if not in advanced mode
        if (!advanced && variable.advanced) {
            return
        }

        // Skip entries that do not match the search string
        if (lowercasedSearch) {
            if (!variable.name.toLowerCase().includes(lowercasedSearch) && !variable.value.toLowerCase().includes(lowercasedSearch)) {
                return
            }
        }

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