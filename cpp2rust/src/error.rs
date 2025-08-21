use thiserror::Error;
use ai::Error as LLMError;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO Error: {0}")]
    IO(#[from] Box<std::io::Error>),

    #[error("Internal error: {0}")]
    InternalError(String),

    #[error("URL error: {0}")]
    Url(#[from] url::ParseError),

    #[error("LLM error: {0}")]
    LLM(#[from] LLMError),

    #[error("Not a directory: {0}")]
    NotADirectory(std::path::PathBuf),

    #[error("No CMakeLists.txt found")]
    NoCMakeListsFound,
}

/// The result type used in this crate.
pub type Result<T> = std::result::Result<T, Error>;
