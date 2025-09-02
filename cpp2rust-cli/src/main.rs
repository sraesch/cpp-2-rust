mod options;
mod secret;

use anyhow::Result;
use clap::Parser as _;
use log::{LevelFilter, error, info};
use options::Options;
use std::io::Write as _;

/// Parses the program arguments and returns None, if no arguments were provided and Some otherwise.
fn parse_args() -> Result<Options> {
    let options = Options::parse();
    Ok(options)
}

/// Initializes the program logging
///
/// # Arguments
/// * `filter` - The log level filter, i.e., the minimum log level to be logged.
fn initialize_logging(filter: LevelFilter) {
    env_logger::builder()
        .format(|buf, record| {
            writeln!(
                buf,
                "{}:{} {} [{}] - {}",
                record.file().unwrap_or("unknown"),
                record.line().unwrap_or(0),
                chrono::Local::now().format("%Y-%m-%dT%H:%M:%S"),
                record.level(),
                record.args()
            )
        })
        .filter_level(filter)
        .init();
}

/// Runs the program.
async fn run_program() -> Result<()> {
    let options = parse_args()?;
    initialize_logging(LevelFilter::from(options.log_level));

    // Get the environment variable API_KEY
    info!("Load API_KEY...");

    info!("Load API_KEY...Ok");

    info!("Options:");
    options.dump_to_log();
    info!("-------");

    // make sure the output directory exists
    std::fs::create_dir_all(&options.output_directory)?;

    match options.command {
        options::Commands::Project(_) => {
            info!("Running command: Project");
            let cpp_options: cpp2rust::cpp::Options = options.into();
            let project = cpp2rust::cpp::build_cpp_project(cpp_options).await?;
            info!("Parsed C++ project: {:?}", project);
        }
    }

    Ok(())
}

#[tokio::main]
async fn main() {
    match run_program().await {
        Ok(()) => {
            info!("SUCCESS");
        }
        Err(err) => {
            error!("Error: {}", err);
            error!("FAILED");

            std::process::exit(-1);
        }
    }
}
