mod cmake_files;

use std::path::PathBuf;

use log::{debug, error, info};
use url::Url;

use crate::{Error, cpp::CppProject, llm::LLMOptions};

use ai::Client as LLMClient;

pub use cmake_files::{CMakeFileType, CMakeFiles, find_cmake_project_files};

/// The options for parsing the CPP project structure.
pub struct Options {
    /// The root directory for the project.
    pub root_directory: PathBuf,

    /// The options for the LLM to be used to collect all relevant information.
    pub llm: LLMOptions,
}

/// Builds the C++ project from the given source.
///
/// # Arguments
/// * `options` - The options to configure the builder.
pub async fn build_cpp_project(options: Options) -> Result<CppProject, Error> {
    // Here you would implement the logic to build the C++ project based on the provided options.
    // This is a placeholder implementation.
    info!(
        "Parsing C++ project from directory: {:?}",
        options.root_directory
    );
    info!("Using LLM model: {}", options.llm.model);

    info!("Creating Builder instance...");
    let builder = Builder::new(options).await?;
    info!("Creating Builder instance...DONE");

    builder.build().await
}

/// The internal builder object to build the cpp project.
struct Builder {
    llm_client: LLMClient,
    options: Options,
}

impl Builder {
    /// Creates a new Builder instance.
    ///
    /// # Arguments
    /// * `options` - The options to configure the builder.
    pub async fn new(options: Options) -> Result<Self, Error> {
        // try to parse the LLM endpoint
        let llm_endpoint = Url::parse(&options.llm.endpoint).map_err(|e| {
            error!("Failed to parse LLM endpoint URL: {}", e);
            Error::Url(e)
        })?;

        let llm_client =
            LLMClient::new(options.llm.api_key.clone(), llm_endpoint).map_err(|e| {
                error!("Failed to create LLM client: {}", e);
                Error::LLM(e)
            })?;

        Ok(Self {
            llm_client,
            options,
        })
    }

    /// Builds the C++ project.
    pub async fn build(self) -> Result<CppProject, Error> {
        info!("Building C++ project...");

        self.parse_cmake_project_files().await.map_err(|err| {
            error!("Failed to parse CMake project files: {}", err);
            err
        })?;

        todo!(
            "Implement the logic to build the C++ project using the LLM client and other necessary components."
        );
    }

    /// Parses the CMake project files in the given directory.
    async fn parse_cmake_project_files(&self) -> Result<CMakeFiles, Error> {
        let root_path = self.options.root_directory.as_path();

        // Here you would implement the logic to parse the CMake project files.
        // This is a placeholder implementation.
        info!("Parsing CMake project files in directory: {:?}", root_path);

        info!("Start collecting CMakeLists.txt...");
        let cmake_files = find_cmake_project_files(&self.options.root_directory).map_err(|e| {
            error!("Failed to find CMakeLists.txt files: {}", e);
            e
        })?;
        info!("Found {} CMakeLists.txt files", cmake_files.len());

        if log::log_enabled!(log::Level::Debug) {
            info!("Dumping folder structure to debug log...");
            Self::dump_folder_structure_to_debug_log(&cmake_files);
        }

        Ok(cmake_files)
    }

    /// Dumps the cmake files to the debug log.
    ///
    /// # Arguments
    /// * `cmake_files` - The list of cmake files to dump.
    fn dump_folder_structure_to_debug_log(cmake_files: &CMakeFiles) {
        for (id, cmake_file) in cmake_files.iter().enumerate() {
            debug!("CMake file (id={}): {}", id, cmake_file.display());
        }
    }
}
