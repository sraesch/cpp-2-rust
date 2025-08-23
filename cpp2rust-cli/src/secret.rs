/// Wrapper for a string to manage a secret value.
#[derive(Clone, Default, PartialEq, Eq, Hash)]
pub struct Secret {
    inner: String,
}

impl Secret {
    /// Exposes the inner string.
    pub unsafe fn expose(&self) -> &str {
        &self.inner
    }
}

impl From<String> for Secret {
    fn from(s: String) -> Self {
        Secret { inner: s }
    }
}

impl std::fmt::Debug for Secret {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "[secret] {}", self)
    }
}

impl std::fmt::Display for Secret {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        if self.inner.len() < 7 {
            write!(f, "{}", "*".repeat(self.inner.len()))
        } else if self.inner.len() < 14 {
            write!(
                f,
                "{}{}{}",
                &self.inner[0..1],
                "*".repeat(self.inner.len() - 2),
                &self.inner[self.inner.len() - 1..]
            )
        } else {
            write!(
                f,
                "{}{}{}",
                &self.inner[0..2],
                "*".repeat(self.inner.len() - 4),
                &self.inner[self.inner.len() - 2..]
            )
        }
    }
}
