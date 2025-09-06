use crate::domain::{
    entities::problem::Problem, error::DomainError, repository::ProblemRepository,
};

pub struct CreateProblemUseCase<'a> {
    problem_repository: &'a dyn ProblemRepository,
}

impl<'a> CreateProblemUseCase<'a> {
    pub fn new(problem_repository: &'a dyn ProblemRepository) -> Self {
        Self {
            problem_repository: problem_repository,
        }
    }

    pub fn execute(&self, problem: &Problem) -> Result<(i64, Option<i64>), DomainError> {
        if problem.name.is_empty() {
            return Err(DomainError::Validation("Name cannot be empty".to_string()));
        }

        self.problem_repository.create(problem)
    }
}
