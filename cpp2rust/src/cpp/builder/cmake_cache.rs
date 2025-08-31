use std::{collections::BTreeMap, io::BufRead, str::FromStr};

use serde::{Deserialize, Serialize};

use crate::Error;

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

    #[serde(rename = "varType")]
    var_type: CMakeVariableType,
    value: String,
    advanced: bool,
}

impl std::fmt::Display for CMakeVariableType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            CMakeVariableType::Bool => "BOOL",
            CMakeVariableType::FilePath => "FILEPATH",
            CMakeVariableType::Path => "PATH",
            CMakeVariableType::String => "STRING",
            CMakeVariableType::Internal => "INTERNAL",
        };
        write!(f, "{}", s)
    }
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

impl FromStr for CMakeVariable {
    type Err = crate::Error;

    /// Creates an Option<CMakeVariable> from a string.
    fn from_str(s: &str) -> Result<Self, crate::Error> {
        let line = s.trim();
        if line.starts_with('#') || line.starts_with("//") || line.is_empty() {
            return Err(Error::CMakeVariableParseErrorCommentLine);
        }

        let (lhs, rhs) = line
            .split_once('=')
            .map(|(l, r)| (l.trim(), r.trim()))
            .ok_or(Error::CMakeVariableParseErrorAssignmentLine)?;
        if lhs.is_empty() {
            return Err(Error::CMakeVariableParseErrorMissingName);
        }

        // split left-hand side by :
        let (key, var_type_str) = lhs
            .split_once(':')
            .map(|(k, v)| (k.trim(), v.trim()))
            .ok_or(Error::CMakeVariableParseErrorMissingColon)?;
        if key.is_empty() || var_type_str.is_empty() {
            return Err(Error::CMakeVariableParseErrorMissingName);
        }

        // check if advanced has been set
        let advanced = key.ends_with("-ADVANCED");
        let name: String = if advanced {
            key[..key.len() - 9].to_string()
        } else {
            key.to_string()
        };

        let var_type = CMakeVariableType::from_str(var_type_str)?;

        Ok(CMakeVariable {
            name,
            var_type,
            value: rhs.to_string(),
            advanced,
        })
    }
}

impl std::fmt::Display for CMakeVariable {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if self.advanced {
            write!(f, "{}-ADVANCED:{}={}", self.name, self.var_type, self.value)
        } else {
            write!(f, "{}:{}={}", self.name, self.var_type, self.value)
        }
    }
}

impl CMakeCache {
    /// Parses a CMake cache file.
    /// Returns the parsed CMake cache.
    ///
    /// # Arguments
    /// * `reader` - The reader for the CMake cache file.
    pub fn parse<R: std::io::Read>(reader: R) -> Option<Self> {
        let mut cache: CMakeCache = CMakeCache::default();

        let reader = std::io::BufReader::new(reader);
        for line in reader.lines() {
            let line = line.unwrap_or_default();
            let variable = CMakeVariable::from_str(&line).ok();
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

    /// Patches the CMakeCache.txt given by `in_cmake_cache` and returns the patched CMakeCache.txt as string.
    /// All entries that are present in `patch` will be updated in the output cache.
    /// If new entries are present in `patch`, they will be added to the output cache.
    ///
    /// # Arguments
    /// * `in_cmake_cache` - The reader to read the original CMakeCache.txt.
    /// * `patch` - The CMake cache containing the patches to apply.
    pub fn patch_cmake_file<R>(&self, in_cmake_cache: R) -> crate::Result<String>
    where
        R: std::io::Read,
    {
        let reader = std::io::BufReader::new(in_cmake_cache);
        let mut result = String::new();
        for line in reader.lines() {
            let line = line?;

            if let Ok(var) = CMakeVariable::from_str(&line) {
                
            } else {
                result.push_str(&line);
                result.push('\n');
            }
        }

        Ok(result)
    }
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
            CMakeVariable::from_str("CMAKE_BUILD_TYPE:STRING=Debug").unwrap(),
            CMakeVariable {
                name: "CMAKE_BUILD_TYPE".to_string(),
                var_type: CMakeVariableType::String,
                value: "Debug".to_string(),
                advanced: false,
            }
        );
        assert_eq!(
            CMakeVariable::from_str("CMAKE_INSTALL_PREFIX:PATH=/usr/local").unwrap(),
            CMakeVariable {
                name: "CMAKE_INSTALL_PREFIX".to_string(),
                var_type: CMakeVariableType::Path,
                value: "/usr/local".to_string(),
                advanced: false,
            }
        );
        assert_eq!(
            CMakeVariable::from_str("CMAKE_VERBOSE_MAKEFILE:BOOL=ON").unwrap(),
            CMakeVariable {
                name: "CMAKE_VERBOSE_MAKEFILE".to_string(),
                var_type: CMakeVariableType::Bool,
                value: "ON".to_string(),
                advanced: false,
            }
        );
        assert_eq!(
            CMakeVariable::from_str("CMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON").unwrap(),
            CMakeVariable {
                name: "CMAKE_EXPORT_COMPILE_COMMANDS".to_string(),
                var_type: CMakeVariableType::Bool,
                value: "ON".to_string(),
                advanced: false,
            }
        );
        assert_eq!(
            CMakeVariable::from_str("CMAKE_ADDR2LINE-ADVANCED:INTERNAL=1").unwrap(),
            CMakeVariable {
                name: "CMAKE_ADDR2LINE".to_string(),
                var_type: CMakeVariableType::Internal,
                value: "1".to_string(),
                advanced: true,
            }
        );
        assert!(CMakeVariable::from_str("# INTERNAL cache entries").is_err());
    }

    #[test]
    fn test_display_cmake_variable() {
        let cmake_strings = [
            "CMAKE_BUILD_TYPE:STRING=Debug",
            "CMAKE_INSTALL_PREFIX:PATH=/usr/local",
            "CMAKE_VERBOSE_MAKEFILE:BOOL=ON",
            "CMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON",
            "CMAKE_ADDR2LINE-ADVANCED:INTERNAL=1",
        ];

        for s in &cmake_strings {
            let var = CMakeVariable::from_str(s).unwrap();
            assert_eq!(format!("{}", var), *s);
        }
    }

    #[test]
    fn test_parse_cmake_cache() {
        let cmake_cache_content = include_bytes!("../../../test_data/CMakeCache.txt");
        let cache = CMakeCache::parse(&cmake_cache_content[..]).unwrap();

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
