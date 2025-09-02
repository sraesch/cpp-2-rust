import { open } from '@tauri-apps/plugin-dialog'

/**
 * Opens a dialog to select a folder.
 * @param defaultPath - The default path to open the dialog at.
 * @returns The selected folder path or undefined if no folder was selected.
 */
export async function selectFolder(defaultPath?: string): Promise<string | null> {
    const folder = await open({
        multiple: false,
        directory: true,
        defaultPath
    });

    return folder
}

/**
 * Opens a dialog to select a file.
 * @param defaultPath - The default path to open the dialog at.
 * @returns The selected file path or undefined if no file was selected.
 */
export async function selectFile(defaultPath?: string): Promise<string | null> {
    const file = await open({
        multiple: false,
        directory: false,
        defaultPath
    });

    return file
}