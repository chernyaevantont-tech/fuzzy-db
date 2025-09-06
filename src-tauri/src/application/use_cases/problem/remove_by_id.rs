use crate::domain::{error::DomainError, repository::ProblemRepository};

pub struct RemoveByIdUseCase<'a> {
    problem_repository: &'a dyn ProblemRepository,
}

impl<'a> RemoveByIdUseCase<'a> {
    pub fn new(problem_repository: &'a dyn ProblemRepository) -> Self {
        Self {
            problem_repository: problem_repository,
        }
    }

    pub fn execute(&self, id: i64) -> Result<(), DomainError> {
        self.problem_repository.remove_by_id(id)
    }
}
