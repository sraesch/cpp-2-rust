use std::path::{Path, PathBuf};

use log::{error, info};

use crate::{Error, utils::make_absolute};

/// The list of found CMake files.
pub type CMakeFiles = Vec<PathBuf>;

// /// A single cmake file.
// #[derive(Debug, Clone)]
// pub struct CMakeFile {
//     /// The unique identifier for the cmake file.
//     /// The root folder always has id 0.
//     pub id: u32,

//     /// The relative path to the cmake file.
//     pub relative_path: PathBuf,

//     /// The type of the cmake file.
//     pub cmake_file_type: CMakeFileType,

//     /// References to other cmake files defined by their id.
//     pub references: Vec<u32>,
// }

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

    // sort by path lengths, i.e. how many directories deep the file is
    cmake_files.sort_by_key(|path| path.components().count());

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
                error!("Failed to find cmake files in {:?}: {}", path, err);
            }
        } else if is_cmake_file(&path).is_some() {
            // Found a cmake file, add it to the cmake_files collection
            let relative_path = match path.strip_prefix(project_root) {
                Ok(relative_path) => relative_path,
                Err(err) => {
                    error!(
                        "Failed to strip prefix {:?} from {:?}: {}",
                        project_root, path, err
                    );
                    return Ok(()); // DO NOT RETURN, BUT RATHER CONTINUE
                }
            };
            cmake_files.push(relative_path.to_path_buf());
        }
    }
    Ok(())
}

/// Checks if the given path references a CMakeFile.
/// That is either a CMakeLists.txt or a file with .cmake extension.
/// If it is a cmake file it returns either NotClassified or CMakeLists and none
/// otherwise.
///
/// # Arguments
/// - `file_path` - The path to the file to check.
fn is_cmake_file(file_path: &Path) -> Option<CMakeFileType> {
    // First, we check if it is actually a file
    if !file_path.is_file() {
        return None;
    }

    // Check if the file has a CMake extension
    if let Some(extension) = file_path.extension().and_then(|s| s.to_str()) {
        if extension.to_lowercase() == "cmake" {
            return Some(CMakeFileType::NotClassified);
        }
    }

    // Check if the file is a CMakeLists.txt
    if let Some(file_name) = file_path.file_name().and_then(|s| s.to_str()) {
        if file_name.to_lowercase() == "cmakelists.txt" {
            return Some(CMakeFileType::CMakeLists);
        }
    }

    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_cmake_file() {
        let p = make_absolute(Path::new("test_data/cmake_files/")).unwrap();

        println!("PWD: {}", std::env::current_dir().unwrap().display());

        let test_cases = vec![
            (p.join("CMakeLists.txt"), Some(CMakeFileType::CMakeLists)),
            (p.join("CMAKELISTS.txt"), Some(CMakeFileType::CMakeLists)),
            (p.join("foo.cmake"), Some(CMakeFileType::NotClassified)),
            (p.join("bar.txt"), None),
            (p.join("baz.rs"), None),
        ];

        for (file_path, expected) in test_cases {
            assert_eq!(
                is_cmake_file(file_path.as_path()),
                expected,
                "Failed on file: {:?}",
                file_path
            );
        }
    }
}
