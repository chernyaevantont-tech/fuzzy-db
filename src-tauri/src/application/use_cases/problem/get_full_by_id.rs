use crate::domain::{
    entities::problem::Problem, error::DomainError, repository::ProblemRepository,
};

pub struct GetFullByIdUseCase<'a> {
    problem_repository: &'a dyn ProblemRepository,
}

impl<'a> GetFullByIdUseCase<'a> {
    pub fn new(problem_repository: &'a dyn ProblemRepository) -> Self {
        Self {
            problem_repository: problem_repository,
        }
    }

    pub fn execute(&self, id: i64) -> Result<Problem, DomainError> {
        self.problem_repository.get_full_by_id(id)
    }
}
