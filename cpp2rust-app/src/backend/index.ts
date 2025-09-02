import { invoke } from '@tauri-apps/api/core'
import { CMakeCache, CMakeVariable } from './cmake';
import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

export * from './cmake'

/**
 * Tries to load the CMake cache from the specified folder.
 *
 * @param folder {string} - The folder to load the cache from.
 * @returns {Promise<CMakeCache | null>} - The loaded CMake cache or null if it failed.
 */
export async function loadCacheFolder(folder: string): Promise<CMakeCache | null> {
    return await invoke<CMakeCache | null>('load_cache', { folder });
}

/**
 * Represents the entries in a CMake cache.
 */
export type CacheEntries = Record<string, CMakeVariable>;

/**
 * Represents the parameters for generating a CMake cache.
 */
export interface CMakeGenerationParams {
    sourceDir: string;
    buildDir: string;
    entries: CacheEntries;
    [key: string]: unknown;
}

/**
 * Tries to generate a CMake cache for the specified project.
 *
 * @param sourceDir {string} - The source directory of the project.
 * @param buildDir {string} - The build directory for the project.
 * @param cacheEntries {Record<string, CMakeVariable>} - The cache entries to use for generation.
 * @returns {Promise<CMakeCache | null>} - The generated CMake cache or null if it failed.
 */
export async function generateCMake(params: CMakeGenerationParams): Promise<CMakeCache | null> {
    return await invoke<CMakeCache | null>('generate_cmake', params)
}

/**
 * Represents a callback function for CMake log messages.
 */
export type CMakeLogMessagesCallback = (message: string) => void;

interface CMakeLoggingMessage {
    message: string
}

/**
 * Hook for cmake log messages.
 *
 * @param callback {CMakeLogMessagesCallback} - The callback to invoke with log messages.
 */
export function useCMakeLogMessages(callback: CMakeLogMessagesCallback): void {
    useEffect(() => {
        const unlisten = listen<CMakeLoggingMessage>('cmake_logging', (event) => {
            callback(event.payload.message)
        })

        return () => {
            unlisten.then((f) => f())
        };
    }, [callback]);
}
