use std::{path::Path, process::Stdio};

use cpp2rust::cpp::{patch_cmake_file, CMakeCache, Variables};
use log::{debug, error, info, log_enabled, Level};

use serde::Serialize;
use tauri::{AppHandle, Emitter};

use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::ChildStderr;
use tokio::process::ChildStdout;
use tokio::process::Command;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn load_cache(folder: &str) -> Option<CMakeCache> {
    info!("Loading CMake cache from folder: {}", folder);

    let p = Path::new(folder);

    // check if the folder exists and is a directory
    if !p.exists() || !p.is_dir() {
        info!("Folder does not exist or is not a directory: {}", folder);
        return None;
    }

    // check if the CMakeCache.txt file exists
    let cache_file = p.join("CMakeCache.txt");
    if !cache_file.exists() {
        info!(
            "CMakeCache.txt file does not exist: {}",
            cache_file.display()
        );
        return None;
    }

    // open file to CMakeCache.txt
    let file = std::fs::File::open(cache_file).ok()?;

    CMakeCache::parse(file)
}

#[derive(Serialize, Clone)]
struct CMakeLoggingMessage {
    pub message: String,
}

fn write_log_message(app: AppHandle, message: String) {
    if let Err(err) = app.emit("cmake_logging", CMakeLoggingMessage { message }) {
        error!("Failed to emit event: {}", err);
    }
}

/// Helper function to asynchronously stream the stdout of a child process
///
/// # Arguments
/// * `app` - The Tauri application handle
/// * `out` - The standard output stream of the child process
async fn stream_stdout(app: AppHandle, out: ChildStdout) {
    let mut reader = BufReader::new(out).lines();
    while let Ok(Some(line)) = reader.next_line().await {
        write_log_message(app.clone(), line);
    }
}

/// Helper function to asynchronously stream the stderr of a child process
///
/// # Arguments
/// * `app` - The Tauri application handle
/// * `out` - The standard output stream of the child process
async fn stream_stderr(app: AppHandle, out: ChildStderr) {
    let mut reader = BufReader::new(out).lines();
    while let Ok(Some(line)) = reader.next_line().await {
        write_log_message(app.clone(), line);
    }
}

#[tauri::command]
async fn generate_cmake(
    app: AppHandle,
    source_dir: String,
    build_dir: String,
    entries: Variables,
) -> Option<CMakeCache> {
    let build_dir = Path::new(&build_dir);

    // Implement the CMake generation logic here
    info!("Generating CMake with:");
    info!("Source Directory: {}", source_dir);
    info!("Build Directory: {}", build_dir.display());
    if log_enabled!(Level::Debug) {
        for (name, value) in entries.iter() {
            debug!("Entry: {} = {:?}", name, value);
        }
    }

    // make sure the build directory exists
    info!("Ensuring build directory exists: {}", build_dir.display());
    if let Err(err) = std::fs::create_dir_all(build_dir) {
        error!("Failed to create build directory: {}", err);
        return None;
    }

    // try to patch CMakeCache.txt
    let cmake_cache_file = build_dir.join("CMakeCache.txt");
    if cmake_cache_file.exists() {
        info!("Patching {}", cmake_cache_file.display());

        if let Err(err) = patch_cmake_file(cmake_cache_file.as_path(), &entries) {
            error!("Failed to patch CMakeCache.txt: {}", err);
            return None;
        }
    }

    // run cmake command and pipe output to log
    let mut cmd = Command::new("cmake");
    cmd.arg("-S")
        .arg(source_dir)
        .arg("-B")
        .arg(build_dir)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = cmd
        .spawn()
        .map_err(|err| {
            error!("Failed to spawn cmake process: {}", err);
        })
        .ok()?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();

    // Spawn independent tasks to stream both pipes concurrently
    let out_task = tokio::spawn(stream_stdout(app.clone(), stdout));
    let err_task = tokio::spawn(stream_stderr(app.clone(), stderr));

    // Wait for the process to exit
    let status = child
        .wait()
        .await
        .map_err(|err| {
            error!("Failed to wait on cmake process: {}", err);
        })
        .ok()?;

    // Ensure both streaming tasks finish (ignore join errors but log them)
    if let Err(e) = out_task.await {
        error!("stdout task join error: {e}");
    }

    if let Err(e) = err_task.await {
        error!("stderr task join error: {e}");
    }

    info!("process exited with status: {status}");

    // try to load the cmake cache
    let cache_file = build_dir.join("CMakeCache.txt");
    let cmake_cache = {
        let file = std::fs::File::open(cache_file).ok()?;
        CMakeCache::parse(file)?
    };
    info!("CMake cache loaded");

    Some(cmake_cache)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Determine the log level using the environment variable
    let log_level = std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into());
    let log_level = log_level.parse().unwrap_or(Level::Info);

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .filter(move |e| e.level() <= log_level)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_cache, generate_cmake])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
