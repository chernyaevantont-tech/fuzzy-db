use crate::domain::{
    entities::problem::Problem, error::DomainError, repository::ProblemRepository,
};

pub struct UpdateByIdUseCase<'a> {
    problem_repository: &'a dyn ProblemRepository,
}

impl<'a> UpdateByIdUseCase<'a> {
    pub fn new(problem_repository: &'a dyn ProblemRepository) -> Self {
        Self {
            problem_repository: problem_repository,
        }
    }

    pub fn execute(&self, id: i64, model: &Problem) -> Result<(), DomainError> {
        self.problem_repository.update_by_id(id, model)
    }
}
