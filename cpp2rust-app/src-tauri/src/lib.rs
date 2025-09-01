use std::{collections::BTreeMap, path::Path};

use cpp2rust::cpp::{CMakeCache, CMakeVariable, Variables};
use log::{debug, error, info, log_enabled, Level};

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

#[tauri::command]
fn generate_cmake(source_dir: &str, build_dir: &str, entries: Variables) -> Option<CMakeCache> {
    // Implement the CMake generation logic here
    info!("Generating CMake with:");
    info!("Source Directory: {}", source_dir);
    info!("Build Directory: {}", build_dir);
    if log_enabled!(Level::Debug) {
        for (name, value) in entries.iter() {
            debug!("Entry: {} = {:?}", name, value);
        }
    }

    // make sure the build directory exists
    info!("Ensuring build directory exists: {}", build_dir);
    if let Err(err) = std::fs::create_dir_all(build_dir) {
        error!("Failed to create build directory: {}", err);
        return None;
    }

    todo!()

    // // Try to load cmake cache file and patch it
    // let cache = load_cache(build_dir);
    // if let Some(cache) = cache {
    //     info!("Loaded CMake cache successfully.");
    //     // Use the cache for CMake generation
    // } else {
    //     info!("Failed to load CMake cache.");
    //     return false;
    // }

    // true
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
