use std::path::Path;

use cpp2rust::cpp::{parse_cmake_cache, CMakeCache};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn load_cache(folder: &str) -> Option<CMakeCache> {
    let p = Path::new(folder);

    // check if the folder exists and is a directory
    if !p.exists() || !p.is_dir() {
        println!("Folder does not exist or is not a directory: {}", folder);
        return None;
    }

    // check if the CMakeCache.txt file exists
    let cache_file = p.join("CMakeCache.txt");
    if !cache_file.exists() {
        println!(
            "CMakeCache.txt file does not exist: {}",
            cache_file.display()
        );
        return None;
    }

    // open file to CMakeCache.txt
    let file = std::fs::File::open(cache_file).ok()?;

    parse_cmake_cache(file)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_cache])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
