use ai::Error as LLMError;
use thiserror::Error;

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

    #[error("CMake files are not valid UTF-8: {0}")]
    CMakeNotUtf8(#[from] std::string::FromUtf8Error),
}

/// The result type used in this crate.
pub type Result<T> = std::result::Result<T, Error>;

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::IO(Box::new(err))
    }
}
