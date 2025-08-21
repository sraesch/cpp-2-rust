use std::path::Path;

use log::{error, info, trace};

use crate::Error;

#[derive(Debug, Clone)]
pub struct Folder {
    pub name: String,
    pub sub_folders: Vec<Folder>,
    pub has_cmake_lists: bool,
}
/// Finds all CMakeLists.txt files in the given root folder and its sub-folders.
/// Returns a Folder struct representing the folder structure with CMakeLists.txt files.
pub fn find_cmake_list_files(root_folder: &Path) -> Result<Folder, Error> {
    if !root_folder.is_dir() {
        return Err(Error::NotADirectory(root_folder.to_path_buf()));
    }

    let root_folder = if root_folder.is_absolute() {
        root_folder.to_path_buf()
    } else {
        let current_dir = std::env::current_dir().map_err(|e| {
            error!("Failed to get current directory: {}", e);
            Error::IO(Box::new(e))
        })?;
        current_dir.join(root_folder)
    };

    let folder = recursively_find_cmake_lists(&root_folder).map_err(|e| {
        error!("Failed to find CMakeLists.txt files: {}", e);
        e
    }).map_err(|e| {
        error!("Failed to find CMakeLists.txt files: {}", e);
        e
    })?;

    if let Some(folder)  = folder {
        Ok(folder)
    } else {
        Err(Error::NoCMakeListsFound)
    }
}

/// Recursively traverses over the folder structure to find all CMakeLists.txt files.
/// Returns the folder with the respective sub-folder or none, if not a single CMakeLists.txt is found
/// in the overall subtree.
///
/// # Arguments
/// * `folder` - The path to the folder to search for CMakeLists.txt files.
fn recursively_find_cmake_lists(folder: &Path) -> Result<Option<Folder>, Error> {
    let folder_entries = folder.read_dir().map_err(|e| {
        error!("Failed to read directory {:?}: {}", folder, e);
        Error::IO(Box::new(e))
    })?;

    // collect list of all sub-folders that can be accessed
    let sub_paths = folder_entries
    .filter_map(|entry| {
        match entry {
            Ok(entry) => if entry.path().is_dir() {
                Some(entry.path())
            } else {
                None
            },
            Err(e) => {
                error!("Failed to read directory entry in {:?}: {}", folder, e);
                None
            }
        }
    });

    // visit all sub-folder
    let sub_folders: Vec<Folder> = sub_paths.filter_map(|sub_folder| {
        match recursively_find_cmake_lists(&sub_folder) {
            Err(err) => {
                error!("Failed to find CMakeLists.txt in {:?}: {}", sub_folder, err);
                None
            },
            Ok(Some(folder)) => {
                Some(folder)
            },
            Ok(None) => None
        }
    }).collect();

    let has_cmake_lists = folder.join("CMakeLists.txt").exists();
    
    // check for case where we neither have a CMakeLists.txt nor in any of the sub-folders
    if !has_cmake_lists && sub_folders.is_empty() {
        trace!("Exclude {:?} as there are no CMakeLists.txt files", folder);
        return Ok(None);
    }

    // extract the name of the folder
    let folder_name = match extract_folder_name(folder) {
        Some(name) => name,
        None => return Ok(None),
    };

    Ok(Some(Folder {
        name: folder_name,
        sub_folders,
        has_cmake_lists,
    }))
}

/// Extracts the folder name from the given path.
/// Returns none, if something fails and dumps a log message.
/// 
/// # Arguments
/// * `folder` - The path to the folder from which to extract the name.
fn extract_folder_name(folder: &Path) -> Option<String> {
    match folder.file_name() {
        None => {
            error!("No folder name has been found in {:?}", folder);
            None
        },
        Some(name) => {
            match name.to_str() {
                Some(s) => Some(s.to_string()),
                None => {
                    error!("Failed to convert folder name {:?} to string", name);
                    None
                }
            }
        }
    }
}