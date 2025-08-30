use std::{collections::BTreeMap, io::BufRead, str::FromStr};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Copy, Clone, Debug, PartialEq, Eq, Hash)]
pub enum CMakeVariableType {
    Bool,
    FilePath,
    Path,
    String,
    Internal,
}

/// Represents a CMake cache file.
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Hash)]
pub struct CMakeCache {
    source_dir: Option<String>,
    build_dir: Option<String>,
    generator: Option<String>,
    variables: BTreeMap<String, CMakeVariable>,
}

/// Represents a CMake variable.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub struct CMakeVariable {
    name: String,
    var_type: CMakeVariableType,
    value: String,
    advanced: bool,
}

impl FromStr for CMakeVariableType {
    type Err = crate::Error;

    /// Creates a CMakeVariableType from a string.
    fn from_str(s: &str) -> Result<Self, crate::Error> {
        match s {
            "BOOL" => Ok(CMakeVariableType::Bool),
            "FILEPATH" => Ok(CMakeVariableType::FilePath),
            "PATH" => Ok(CMakeVariableType::Path),
            "STRING" => Ok(CMakeVariableType::String),
            "INTERNAL" => Ok(CMakeVariableType::Internal),
            _ => Err(crate::Error::CMakeVariableTypeUnknown(s.to_string())),
        }
    }
}

/// Parses a CMake variable from a line of text.
/// Returns The parsed CMake variable or null if parsing failed.
///
/// # Arguments
/// * `line` - The line of text to parse.
pub fn parse_cmake_variable(line: &str) -> Option<CMakeVariable> {
    let line = line.trim();
    if line.starts_with('#') || line.starts_with("//") || line.is_empty() {
        return None;
    }

    let (lhs, rhs) = line.split_once('=').map(|(l, r)| (l.trim(), r.trim()))?;
    if lhs.is_empty() {
        return None;
    }

    // split left-hand side by :
    let (key, var_type_str) = lhs.split_once(':').map(|(k, v)| (k.trim(), v.trim()))?;
    if key.is_empty() || var_type_str.is_empty() {
        return None;
    }

    // check if advanced has been set
    let advanced = key.ends_with("-ADVANCED");
    let name: String = if advanced {
        key[..key.len() - 9].to_string()
    } else {
        key.to_string()
    };

    let var_type = CMakeVariableType::from_str(var_type_str).ok()?;

    Some(CMakeVariable {
        name,
        var_type,
        value: rhs.to_string(),
        advanced,
    })
}

/// Parses a CMake cache file.
/// Returns the parsed CMake cache.
///
/// # Arguments
/// * `reader` - The reader for the CMake cache file.
pub fn parse_cmake_cache<R: std::io::Read>(reader: R) -> Option<CMakeCache> {
    let mut cache: CMakeCache = CMakeCache::default();

    let reader = std::io::BufReader::new(reader);
    for line in reader.lines() {
        let line = line.unwrap_or_default();
        let variable = parse_cmake_variable(&line);
        if let Some(variable) = variable.as_ref() {
            if variable.name == "CMAKE_HOME_DIRECTORY" {
                cache.source_dir = Some(variable.value.clone());
            } else if variable.name == "CMAKE_CACHEFILE_DIR" {
                cache.build_dir = Some(variable.value.clone());
            } else if variable.name == "CMAKE_GENERATOR" {
                cache.generator = Some(variable.value.clone());
            }

            if variable.var_type == CMakeVariableType::Internal {
                continue;
            }

            cache
                .variables
                .insert(variable.name.clone(), variable.clone());
        }
    }
    Some(cache)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_parse_cmake_variable_type() {
        assert_eq!(
            CMakeVariableType::from_str("BOOL").unwrap(),
            CMakeVariableType::Bool
        );
        assert_eq!(
            CMakeVariableType::from_str("FILEPATH").unwrap(),
            CMakeVariableType::FilePath
        );
        assert_eq!(
            CMakeVariableType::from_str("PATH").unwrap(),
            CMakeVariableType::Path
        );
        assert_eq!(
            CMakeVariableType::from_str("STRING").unwrap(),
            CMakeVariableType::String
        );
        assert_eq!(
            CMakeVariableType::from_str("INTERNAL").unwrap(),
            CMakeVariableType::Internal
        );
        assert!(CMakeVariableType::from_str("UNKNOWN").is_err());
    }

    #[test]
    fn test_parse_cmake_variable() {
        assert_eq!(
            parse_cmake_variable("CMAKE_BUILD_TYPE:STRING=Debug"),
            Some(CMakeVariable {
                name: "CMAKE_BUILD_TYPE".to_string(),
                var_type: CMakeVariableType::String,
                value: "Debug".to_string(),
                advanced: false,
            })
        );
        assert_eq!(
            parse_cmake_variable("CMAKE_INSTALL_PREFIX:PATH=/usr/local"),
            Some(CMakeVariable {
                name: "CMAKE_INSTALL_PREFIX".to_string(),
                var_type: CMakeVariableType::Path,
                value: "/usr/local".to_string(),
                advanced: false,
            })
        );
        assert_eq!(
            parse_cmake_variable("CMAKE_VERBOSE_MAKEFILE:BOOL=ON"),
            Some(CMakeVariable {
                name: "CMAKE_VERBOSE_MAKEFILE".to_string(),
                var_type: CMakeVariableType::Bool,
                value: "ON".to_string(),
                advanced: false,
            })
        );
        assert_eq!(
            parse_cmake_variable("CMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON"),
            Some(CMakeVariable {
                name: "CMAKE_EXPORT_COMPILE_COMMANDS".to_string(),
                var_type: CMakeVariableType::Bool,
                value: "ON".to_string(),
                advanced: false,
            })
        );
        assert_eq!(
            parse_cmake_variable("CMAKE_ADDR2LINE-ADVANCED:INTERNAL=1"),
            Some(CMakeVariable {
                name: "CMAKE_ADDR2LINE".to_string(),
                var_type: CMakeVariableType::Internal,
                value: "1".to_string(),
                advanced: true,
            })
        );
        assert_eq!(parse_cmake_variable("# INTERNAL cache entries"), None);
    }

    #[test]
    fn test_parse_cmake_cache() {
        let cmake_cache_content = include_bytes!("../../../test_data/CMakeCache.txt");
        let cache = parse_cmake_cache(&cmake_cache_content[..]).unwrap();

        assert!(cache.source_dir.is_some());
        assert!(cache.build_dir.is_some());
        assert!(cache.generator.is_some());

        assert_eq!(
            cache.source_dir.as_deref(),
            Some("/home/jdoe/projects/temp")
        );

        assert_eq!(
            cache.build_dir.as_deref(),
            Some("/home/jdoe/projects/temp/build")
        );

        assert_eq!(cache.generator.as_deref(), Some("Unix Makefiles"));
        assert!(cache.variables.contains_key("CMAKE_BUILD_TYPE"));
    }
}
