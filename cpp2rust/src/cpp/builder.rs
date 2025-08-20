use std::path::PathBuf;

use log::{error, info};
use url::Url;

use crate::{cpp::CppProject, llm::LLMOptions, Error};

use ai::Client as LLMClient;

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
    info!("Parsing C++ project from directory: {:?}", options.root_directory);
    info!("Using LLM model: {}", options.llm.model);

    info!("Creating Builder instance...");
    let builder = Builder::new(options).await?;
    info!("Creating Builder instance...DONE");

    builder.build().await
}

/// The internal builder object to build the cpp project.
struct Builder {
    llm_client: LLMClient,
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

        let llm_client = LLMClient::new(options.llm.api_key.clone(), llm_endpoint)
            .map_err(
                |e| {
                    error!("Failed to create LLM client: {}", e);
                    Error::LLM(e)
                }
            )?;
        
        Ok(Self { llm_client })
    }

    /// Builds the C++ project.
    pub async fn build(self) -> Result<CppProject, Error> {
        info!("Building C++ project...");


        todo!("Implement the logic to build the C++ project using the LLM client and other necessary components.");
    }
}