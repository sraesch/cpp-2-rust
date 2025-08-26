mod cmake_files;

use std::path::PathBuf;

use log::{debug, error, info};
use url::Url;

use crate::{
    Error,
    cpp::{CppProject, builder::cmake_files::analyze_cmake_project},
    llm::LLMOptions,
};

use ai::Client as LLMClient;

pub use cmake_files::CMakeFiles;

/// The options for parsing the CPP project structure.
pub struct Options {
    /// The root directory for the project.
    pub root_directory: PathBuf,

    /// The output directory for the generated files.
    pub output_directory: PathBuf,

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

        let llm_client = LLMClient::new_with_timeout(
            options.llm.api_key.clone(),
            llm_endpoint,
            options.llm.api_timeout,
        )
        .map_err(|e| {
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
        let root_path = self.options.root_directory.as_path();

        let cmake_analysis = analyze_cmake_project(
            root_path,
            &self.options.output_directory,
            &self.llm_client,
            &self.options.llm.model,
        )
        .await?;

        todo!(
            "Implement the logic to build the C++ project using the LLM client and other necessary components."
        );
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
