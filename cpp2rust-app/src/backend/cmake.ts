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

/**
 * Checks if a CMake variable value is valid based on its type.
 * @param varType The type of the CMake variable.
 * @param value The value of the CMake variable.
 * @returns True if the value is valid for the given variable type, false otherwise.
 */
export function isCMakeValueValid(varType: CMakeVariableType, value: string): boolean {
  if (varType === CMakeVariableType.BOOL) {
    return value === 'ON' || value === 'OFF';
  } else {
    return true;
  }
}

/**
 * Checks if a CMake variable name is valid.
 *
 * A valid CMake variable name must start with a letter or underscore, followed by letters, numbers, or underscores.
 * It must not be empty.
 *
 * @param name The name of the CMake variable to check.
 * @returns True if the name is valid and false otherwise.
 */
export function isCMakeVariableNameValid(name: string): boolean {
  const namePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
  return namePattern.test(name);
}

/**
 * Checks if a CMake variable is valid.
 * @param variable The CMake variable to check.
 * @returns True if the variable is valid, false otherwise.
 */
export function isCMakeVariableValid(variable: CMakeVariable): boolean {
  return isCMakeVariableNameValid(variable.name) && isCMakeValueValid(variable.varType, variable.value);
}
