use std::{collections::{HashMap, HashSet}, path::PathBuf};

/// Represents a C++ project consisting of modules with mutual dependencies.
#[derive(Debug, Clone)]
pub struct CppProject {
    pub name: String,
    pub description: String,
    pub root_dir: PathBuf,
    pub modules: HashMap<String, Module>,
}

/// Represents a C++ module with its properties.
#[derive(Debug, Clone)]
pub struct Module {
    /// The name of the module.
    pub name: String,

    /// A description of the module what it does.
    pub description: String,

    /// The root path of the module relative to the project root.
    pub relative_path: PathBuf,

    /// The source directory of the module relative to the module root.
    pub source_dir: PathBuf,

    /// The type of this module (library or binary).
    pub module_type: ModuleType,

    /// A set of names of other modules this module depends on.
    pub dependencies: HashSet<String>,
}

/// Represents the type of a C++ module.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum ModuleType {
    Library,
    Binary,
}