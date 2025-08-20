use clap::{Parser, ValueEnum};
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

    /// Some option :-)
    #[arg(short, long)]
    pub random_option: String,
}

impl Options {
    /// Dumps the options to the log.
    pub fn dump_to_log(&self) {
        info!("log_level: {:?}", self.log_level);
        info!("random_option: {:?}", self.random_option);
    }
}
