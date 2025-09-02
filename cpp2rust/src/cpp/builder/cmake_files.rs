use std::{
    io::{BufWriter, Write},
    path::{Path, PathBuf},
};

use log::{debug, error, info, trace};
use schemars::{JsonSchema, schema_for};
use serde::{Deserialize, Serialize};

use crate::{Error, utils::make_absolute};

use ai::{Client as LLMClient, JsonSchemaDescription, Message, json_types::ResponseFormat};

/// The list of found CMake files.
pub type CMakeFiles = Vec<PathBuf>;

/// A single cmake file in the project like a *.cmake or CMakeLists.txt file.
#[derive(Serialize, Deserialize, Debug, JsonSchema, Clone, PartialEq, Eq, Hash)]
#[schemars(deny_unknown_fields)]
pub struct CMakeFile {
    /// The path to the cmake file.
    pub path: PathBuf,

    pub cmake_file_type: CMakeFileClassification,

    /// A list of other cmake files that are included by this cmake file.
    /// For example through include or add_subdirectory.
    pub includes: Vec<PathBuf>,

    /// A list of targets defined in this cmake file.
    pub targets: Vec<CMakeTarget>,
}

/// A single cmake target in the project like an executable or a library.
#[derive(Serialize, Deserialize, Debug, JsonSchema, Clone, PartialEq, Eq, Hash)]
#[schemars(deny_unknown_fields)]
pub struct CMakeTarget {
    /// The name of the cmake target also used for referencing.
    pub name: String,

    /// A more human-readable name for the cmake target.
    pub display_name: String,

    pub target_type: CMakeTargetType,

    /// The list of linked/referenced targets for the cmake target.
    /// The targets are listed by their names.
    pub linked_targets: Vec<String>,
}

/// The type of target defined in a cmake file.
/// Can either be a library or an executable.
#[derive(Serialize, Deserialize, Debug, JsonSchema, Clone, PartialEq, Eq, Hash)]
#[schemars(deny_unknown_fields)]
pub enum CMakeTargetType {
    Executable,
    Library,
}

/// The overall cmake project with all its cmake files and defined targets.
#[derive(Serialize, Deserialize, Debug, JsonSchema, Clone, PartialEq, Eq, Hash)]
#[schemars(deny_unknown_fields)]
pub struct CMakeProject {
    /// The name of the project.
    pub project_name: String,

    /// The list of cmake files in the project.
    pub cmake_files: Vec<CMakeFile>,

    /// The list of targets defined in the cmake files.
    pub targets: Vec<CMakeTarget>,
}

/// The classification of the cmake file.
/// That is, is it a CMakeLists.txt file, a Find script, or something else?
#[derive(Serialize, Deserialize, Debug, JsonSchema, Clone, PartialEq, Eq, Hash)]
#[schemars(deny_unknown_fields)]
pub enum CMakeFileClassification {
    CMakeLists,
    FindScript,
    Other,
}

pub async fn analyze_cmake_project(
    root_folder: &Path,
    out_directory: &Path,
    llm_client: &LLMClient,
    llm_model: &str,
) -> Result<CMakeProject, Error> {
    // Collect all cmake files in the project and write the list to the output directory.
    info!("Collect all cmake files...");
    let cmake_files = find_cmake_files_in_project(root_folder)?;
    write_cmake_files(out_directory, &cmake_files)?;
    info!("Collect all cmake files...DONE");

    // Create prompt for the LLM to:
    // - Classify the cmake files
    // - Extract the targets from the cmake files
    // - Find the included cmake files
    // - Relations between the cmake targets.
    info!("Create prompt for LLM...");
    let prompt_str = create_prompt(root_folder, &cmake_files)?;
    trace!("LLM Prompt:\n{}", prompt_str);
    write_cmake_prompt_to_file(out_directory, &prompt_str)?;
    info!("Create prompt for LLM...DONE");

    // now create the prompt for the LLM
    let message = Message {
        role: "user".to_string(),
        tool_call_id: String::new(),
        content: prompt_str.clone(),
        tool_calls: vec![],
    };

    let mut prompt = ai::ChatCompletionParameter::new(llm_model.to_string(), vec![message]);

    let schema = schema_for!(CMakeProject);

    let json_schema = JsonSchemaDescription {
        name: "CMakeProject".to_string(),
        strict: true,
        schema,
    };

    prompt.set_response_format(ResponseFormat {
        json_schema: Some(&json_schema),
        schema_type: "json_schema",
    });

    info!("Send prompt to LLM {}...", llm_model);
    let response = llm_client.chat_completion(&prompt).await?;
    info!("Send prompt to LLM {}...Response received", llm_model);
    debug!("LLM Response: {:?}", response);

    for choice in response {
        println!("Response: {}", choice.message.content);
    }

    todo!("Parse the response and create a CMakeProject struct");
}

/// Finds all cmake project files in the given root folder and its sub-folders.
/// Returns a list of cmake files.
///
/// # Arguments
/// * `root_folder` - The path to the project root folder to search for cmake files.
pub fn find_cmake_files_in_project(root_folder: &Path) -> Result<CMakeFiles, Error> {
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
        } else if is_cmake_file(&path) {
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

/// Checks if the given path references a cmake file.
/// That is either a CMakeLists.txt or a file with .cmake extension.
/// If it is a cmake file it returns true and false otherwise.
///
/// # Arguments
/// - `file_path` - The path to the file to check.
fn is_cmake_file(file_path: &Path) -> bool {
    // First, we check if it is actually a file
    if !file_path.is_file() {
        return false;
    }

    // Check if the file has a CMake extension
    if let Some(extension) = file_path.extension().and_then(|s| s.to_str()) {
        if extension.to_lowercase() == "cmake" {
            return true;
        }
    }

    // Check if the file is a CMakeLists.txt
    if let Some(file_name) = file_path.file_name().and_then(|s| s.to_str()) {
        if file_name.to_lowercase() == "cmakelists.txt" {
            return true;
        }
    }

    false
}

/// Creates a prompt for a LLM to generate classify the cmake files and analyze their mutual dependencies.
/// Return the prompt as a String.
///
/// # Arguments
/// - `root_path`: The root path of the CMake project.
/// - `cmake_files`: The list of CMake files to analyze.
fn create_prompt(root_path: &Path, cmake_files: &CMakeFiles) -> Result<String, Error> {
    let mut writer = BufWriter::new(Vec::new());

    // first write the task part of the prompt
    writeln!(
        writer,
        "Task: Analyze the following CMake files and identify for each, what is the purpose of the file and references to other cmake files:\n"
    )?;

    for cmake_file in cmake_files {
        let cmake_file_path = root_path.join(cmake_file);
        // try to open the file and read its contents
        match std::fs::read_to_string(cmake_file_path) {
            Ok(contents) => {
                writeln!(writer, "--- FILE: {} ---", cmake_file.display())?;
                writeln!(writer, "{}", contents)?;
                writeln!(writer, "--- END FILE: {} ---\n", cmake_file.display())?;
            }
            Err(e) => {
                error!("Failed to read CMake file {}: {}", cmake_file.display(), e);
                continue;
            }
        }
    }

    writer.flush()?;

    let buffer: Vec<u8> = writer.into_inner().unwrap();
    let prompt = String::from_utf8(buffer).map_err(|e| {
        error!("Failed to convert prompt to String: {}", e);
        Error::CMakeNotUtf8(e)
    })?;

    Ok(prompt)
}

/// Writes the given list of cmake files into the output directory.
/// Is used for logging and debugging.
///
/// # Arguments
/// * `out_directory`: The output directory where the CMake files will be written.
/// * `cmake_files`: The list of CMake files to write.
fn write_cmake_files(out_directory: &Path, cmake_files: &CMakeFiles) -> Result<(), Error> {
    let p = out_directory.join("cmake_files.txt");
    let file = std::fs::File::create(&p).map_err(|e| {
        error!("Failed to create file {:?}: {}", p, e);
        Error::IO(Box::new(e))
    })?;

    let mut writer = BufWriter::new(file);
    for cmake_file in cmake_files {
        writeln!(writer, "{}", cmake_file.display()).map_err(|e| {
            error!("Failed to write CMake file {}: {}", cmake_file.display(), e);
            Error::IO(Box::new(e))
        })?;
    }

    Ok(())
}

/// Writes the CMake prompt to a file.
///
/// # Arguments
/// * `out_directory`: The output directory where the prompt file will be created.
/// * `prompt`: The CMake prompt to write.
fn write_cmake_prompt_to_file(out_directory: &Path, prompt: &str) -> Result<(), Error> {
    let p = out_directory.join("cmake_prompt.txt");
    let file = std::fs::File::create(&p).map_err(|e| {
        error!("Failed to create file {:?}: {}", p, e);
        Error::IO(Box::new(e))
    })?;

    let mut writer = BufWriter::new(file);
    writeln!(writer, "{}", prompt).map_err(|e| {
        error!("Failed to write prompt to file {:?}: {}", p, e);
        Error::IO(Box::new(e))
    })?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_cmake_file() {
        let p = make_absolute(Path::new("test_data/cmake_files/")).unwrap();

        println!("PWD: {}", std::env::current_dir().unwrap().display());

        let test_cases = vec![
            (p.join("CMakeLists.txt"), true),
            (p.join("CMAKELISTS.txt"), true),
            (p.join("foo.cmake"), true),
            (p.join("bar.txt"), false),
            (p.join("baz.rs"), false),
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

    #[test]
    fn test_finding_cmake_files() {
        let root_folder = Path::new("test_data/finding_cmake_lists");
        let result = find_cmake_files_in_project(root_folder);
        assert!(result.is_ok());
        let cmake_files = result.unwrap();
        assert_eq!(cmake_files.len(), 3);

        println!("{:?}", cmake_files);

        assert_eq!(
            cmake_files[0],
            Path::new("CMakeLists.txt"),
            "id=0, CMakeLists.txt not found"
        );

        assert_eq!(
            cmake_files[1],
            Path::new("a/CMakeLists.txt"),
            "id=1, a/CMakeLists.txt not found"
        );

        assert_eq!(
            cmake_files[2],
            Path::new("c/d/CMakeLists.txt"),
            "id=2, c/d/CMakeLists.txt not found"
        );
    }
}
