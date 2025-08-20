use std::path::PathBuf;

use clap::{Args, Parser, Subcommand, ValueEnum};
use log::{LevelFilter, info};

/// Workaround for parsing the different log level
#[derive(ValueEnum, Clone, Copy, Debug)]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

impl From<LogLevel> for LevelFilter {
    fn from(value: LogLevel) -> Self {
        match value {
            LogLevel::Trace => LevelFilter::Trace,
            LogLevel::Debug => LevelFilter::Debug,
            LogLevel::Info => LevelFilter::Info,
            LogLevel::Warn => LevelFilter::Warn,
            LogLevel::Error => LevelFilter::Error,
        }
    }
}

/// CLI interface for your awesome program.
#[derive(Parser, Debug, Clone)]
#[command(author, version, about, long_about = None)]
#[command(propagate_version = true)]
pub struct Options {
    /// The log level
    #[arg(short, value_enum, long, default_value_t = LogLevel::Info)]
    pub log_level: LogLevel,

    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug, Clone)]
pub enum Commands {
    /// Parses the C++ project files and dumps out the JSON representation
    Project(ProjectArguments),
}


#[derive(Args, Debug, Clone)]
pub struct ProjectArguments {
    /// The LLM model to be used.
    #[arg(short, long)]
    pub model: String,

    /// The LLM API endpoint to use
    #[arg(short, long, default_value = "https://openrouter.ai/api/v1/")]
    pub api_endpoint: String,

    /// The root directory for the project
    #[arg(short = 'r', long)]
    pub root_directory: PathBuf,
}


impl Options {
    /// Dumps the options to the log.
    pub fn dump_to_log(&self) {
        info!("log_level: {:?}", self.log_level);
    }
}

impl From<ProjectArguments> for cpp2rust::cpp::Options {
    fn from(args: ProjectArguments) -> Self {
        cpp2rust::cpp::Options {
            root_directory: args.root_directory,
            llm: cpp2rust::llm::LLMOptions {
                model: args.model,
                endpoint: args.api_endpoint,
                api_key: std::env::var("API_KEY").unwrap_or_default(),
            },
        }
    }
}