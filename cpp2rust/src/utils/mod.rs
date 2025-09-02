use std::path::{Path, PathBuf};

use log::error;

use crate::Error;

/// Makes a path absolute by prepending the current working directory if necessary.
///
/// # Arguments
/// * `path` - The path to be made absolute.
pub fn make_absolute(path: &Path) -> Result<PathBuf, Error> {
    if path.is_absolute() {
        Ok(path.to_path_buf())
    } else {
        let current_dir = std::env::current_dir().map_err(|e| {
            error!("Failed to get current directory: {}", e);
            Error::IO(Box::new(e))
        })?;
        Ok(current_dir.join(path))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_make_absolute() {
        let absolute_path = Path::new("/absolute/path/to/file");
        assert!(absolute_path.is_absolute());
        let absolute_path2 = make_absolute(absolute_path).unwrap();
        assert!(absolute_path2.is_absolute());
        assert_eq!(absolute_path, absolute_path2);

        let relative_path = Path::new("some/relative/path");
        assert!(!relative_path.is_absolute());

        // manually set the current working directory
        let absolute_path = make_absolute(relative_path).unwrap();
        assert!(absolute_path.is_absolute());

        println!("Relative path: {}", relative_path.display());
        println!("Current directory: {}", std::env::current_dir().unwrap().display());
        println!("Absolute path: {}", absolute_path.display());
    }
}