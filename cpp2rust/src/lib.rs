mod error;

pub use error::*;

/// A simple function to square a number
pub fn sqr(x: f64) -> f64 {
    x * x
}
