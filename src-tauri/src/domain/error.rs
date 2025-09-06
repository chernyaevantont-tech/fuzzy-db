use std::error::Error as StdError;
use std::fmt;

#[derive(Debug)]
pub enum DomainError {
    NotFound(String),
    Validation(String),
    Data(String),
    Internal(String),
}

impl fmt::Display for DomainError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DomainError::NotFound(msg) => write!(f, "Not found: {}", msg),
            DomainError::Validation(msg) => write!(f, "Validation error: {}", msg),
            DomainError::Data(msg) => write!(f, "Data error: {}", msg),
            DomainError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl StdError for DomainError {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        match self {
            _ => None,
        }
    }
}
