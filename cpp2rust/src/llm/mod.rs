use std::time::Duration;

pub struct LLMOptions {
    /// The LLM model to be used.
    pub model: String,

    /// The endpoint URL for the LLM OpenAI API.
    pub endpoint: String,

    /// The API key for the LLM OpenAI API.
    pub api_key: String,

    /// The API timeout for requests.
    pub api_timeout: Duration,
}
