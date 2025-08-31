use std::{collections::BTreeMap, path::Path};

use cpp2rust::cpp::{CMakeCache, CMakeVariable};

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

    CMakeCache::parse(file)
}

type Entries = BTreeMap<String, CMakeVariable>;

#[tauri::command]
fn configure_cmake(source_dir: &str, build_dir: &str, entries: Entries) {
    // Implement the CMake configuration logic here
    println!("Configuring CMake with:");
    println!("Source Directory: {}", source_dir);
    println!("Build Directory: {}", build_dir);
    for (name, value) in entries.iter() {
        println!("Entry: {} = {:?}", name, value);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_cache, configure_cmake])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
