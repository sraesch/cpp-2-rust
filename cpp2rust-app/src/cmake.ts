/**
 * Represents a CMake cache file.
 */
export interface CMakeCache {
  source_dir?: string
  build_dir?: string
  generator?: string
  variables: Record<string, CMakeVariable>
}

/**
 * Represents a CMake variable.
 */
export type CMakeVariable = {
  name: string
  varType: CMakeVariableType
  value: string
  advanced: boolean
}

/**
 * The type of variable value.
 */
export enum CMakeVariableType {
  BOOL = 'Bool',
  FILEPATH = 'FilePath',
  PATH = 'Path',
  STRING = 'String',
  INTERNAL = 'Internal'
}
