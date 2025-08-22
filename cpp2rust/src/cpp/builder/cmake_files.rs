use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
};

use log::{error, info};

use crate::{Error, utils::make_absolute};

/// The list of found CMake files.
pub type CMakeFiles = BTreeMap<u32, CMakeFile>;

/// A single cmake file.
#[derive(Debug, Clone)]
pub struct CMakeFile {
    /// The unique identifier for the cmake file.
    /// The root folder always has id 0.
    pub id: u32,

    /// The relative path to the cmake file.
    pub relative_path: PathBuf,

    /// The type of the cmake file.
    pub cmake_file_type: CMakeFileType,

    /// References to other cmake files defined by their id.
    pub references: Vec<u32>,
}

/// The type of a cmake file.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum CMakeFileType {
    CMakeLists,
    FindScript { library_name: String },
    Config,
    NotClassified,
}

/// Finds all cmake project files in the given root folder and its sub-folders.
/// Returns a list of cmake files.
///
/// # Arguments
/// * `root_folder` - The path to the project root folder to search for cmake files.
pub fn find_cmake_project_files(root_folder: &Path) -> Result<CMakeFiles, Error> {
    let root_folder = make_absolute(root_folder)?;
    if !root_folder.is_dir() {
        error!("Root folder is not a directory: {:?}", root_folder);
        return Err(Error::NotADirectory(root_folder.to_path_buf()));
    }

    // make sure the project root folder has a CMakeLists.txt file
    if !root_folder.join("CMakeLists.txt").exists() {
        error!(
            "No CMakeLists.txt found in the root folder {:?}",
            root_folder
        );
        return Err(Error::NoCMakeListsFound);
    }

    info!("Searching for cmake files in {:?}", root_folder);
    let mut cmake_files = CMakeFiles::new();
    recursively_find_cmake_project_files(&root_folder, &root_folder, &mut cmake_files).map_err(
        |e| {
            error!("Failed to find cmake files: {}", e);
            e
        },
    )?;

    info!(
        "Found {} cmake files in {:?}",
        cmake_files.len(),
        root_folder
    );
    assert!(
        !cmake_files.is_empty(),
        "It should be non-empty, as we checked the root folder"
    );

    Ok(cmake_files)
}

/// Recursively traverses over the folder structure to find all cmake files.
/// Returns the folder with the respective sub-folder or none, if not a single CMakeLists.txt is found
/// in the overall subtree.
///
/// # Arguments
/// * `project_root` - The path to the project root folder.
/// * `folder` - The path to the folder to search for cmake files.
/// * `cmake_files` - The mutable reference to the CMakeFiles collection to populate.
fn recursively_find_cmake_project_files(
    project_root: &Path,
    folder: &Path,
    cmake_files: &mut CMakeFiles,
) -> Result<(), Error> {
    // Create a path iterator onto the entries of the directory
    let entries = folder.read_dir().map_err(|e| {
        error!("Failed to read directory {:?}: {}", folder, e);
        Error::IO(Box::new(e))
    })?;

    let paths = entries.filter_map(|entry| match entry {
        Ok(entry) => Some(entry.path()),
        Err(e) => {
            error!("Failed to read directory entry in {:?}: {}", folder, e);
            None
        }
    });

    // Iterate over the paths of the entries in the directory to find
    // - cmake-files
    // - sub-directories to further traverse
    for path in paths {
        if path.is_dir() {
            if let Err(err) = recursively_find_cmake_project_files(project_root, &path, cmake_files)
            {
                error!("Failed to find CMakeLists.txt in {:?}: {}", path, err);
            }
        } else if path.is_file() {
            if let Some(file_name) = path.file_name().and_then(|s| s.to_str()) {
                if file_name == "CMakeLists.txt" {
                    // Found a CMakeLists.txt file, add it to the cmake_files collection
                    let relative_path = match path.strip_prefix(project_root) {
                        Ok(relative_path) => relative_path,
                        Err(err) => {
                            error!(
                                "Failed to strip prefix {:?} from {:?}: {}",
                                project_root, path, err
                            );
                            return Ok(());
                        }
                    };
                    let id = cmake_files.len() as u32;
                    cmake_files.insert(
                        id,
                        CMakeFile {
                            id,
                            relative_path: relative_path.to_path_buf(),
                            cmake_file_type: CMakeFileType::CMakeLists,
                            references: Vec::new(),
                        },
                    );
                }
            }
        }
    }
    Ok(())
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
        }
        Some(name) => match name.to_str() {
            Some(s) => Some(s.to_string()),
            None => {
                error!("Failed to convert folder name {:?} to string", name);
                None
            }
        },
    }
}
