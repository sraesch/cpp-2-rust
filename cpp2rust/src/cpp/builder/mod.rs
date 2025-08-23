mod cmake_files;

use std::{
    io::{BufWriter, Write},
    path::{Path, PathBuf},
};

use log::{debug, error, info, trace};
use url::Url;

use crate::{Error, cpp::CppProject, llm::LLMOptions};

use ai::{Client as LLMClient, Message};

pub use cmake_files::{CMakeFileType, CMakeFiles, find_cmake_project_files};

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

        let llm_client = LLMClient::new(
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

        // Here you would implement the logic to parse the CMake project files.
        // This is a placeholder implementation.
        info!("Parsing CMake project files in directory: {:?}", root_path);

        info!("Start collecting CMakeLists.txt...");
        let cmake_files = find_cmake_project_files(&self.options.root_directory).map_err(|e| {
            error!("Failed to find CMakeLists.txt files: {}", e);
            e
        })?;
        info!("Found {} CMakeLists.txt files", cmake_files.len());
        self.write_cmake_files(&cmake_files)?;

        if log::log_enabled!(log::Level::Debug) {
            info!("Dumping folder structure to debug log...");
            Self::dump_folder_structure_to_debug_log(&cmake_files);
        }

        info!("Analyzing CMake files...");
        self.analyze_cmake_files(&cmake_files).await?;
        info!("Analyzing CMake files...DONE");

        todo!(
            "Implement the logic to build the C++ project using the LLM client and other necessary components."
        );
    }

    /// Writes the given list of cmake files into the output directory.
    /// Is used for logging and debugging.
    ///
    /// # Arguments
    /// * `cmake_files`: The list of CMake files to write.
    fn write_cmake_files(&self, cmake_files: &CMakeFiles) -> Result<(), Error> {
        let p = self.options.output_directory.join("cmake_files.txt");
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

    /// Analyzes the given CMake files.
    ///
    /// # Arguments
    /// - `cmake_files`: The list of CMake files to analyze.
    async fn analyze_cmake_files(&self, cmake_files: &CMakeFiles) -> Result<(), Error> {
        let prompt_str = Self::create_prompt(&self.options.root_directory, cmake_files)?;
        trace!("LLM Prompt:\n{}", prompt_str);
        self.write_cmake_prompt_to_file(&prompt_str)?;

        // now create the prompt for the LLM
        let message = Message {
            role: "user".to_string(),
            tool_call_id: String::new(),
            content: prompt_str.clone(),
            tool_calls: vec![],
        };

        let prompt =
            ai::ChatCompletionParameter::new(self.options.llm.model.clone(), vec![message]);

        info!("Send prompt to LLM {}...", self.options.llm.model);
        let response = self.llm_client.chat_completion(&prompt).await?;
        info!(
            "Send prompt to LLM {}...Response received",
            self.options.llm.model
        );
        debug!("LLM Response: {:?}", response);

        for choice in response {
            println!("Response: {}", choice.message.content);
        }

        // self.llm_client.chat_completion(parameter)
        Ok(())
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

    /// Writes the CMake prompt to a file.
    ///
    /// # Arguments
    /// * `prompt`: The CMake prompt to write.
    fn write_cmake_prompt_to_file(&self, prompt: &str) -> Result<(), Error> {
        let p = self.options.output_directory.join("cmake_prompt.txt");
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
