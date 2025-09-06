use crate::domain::{
    entities::problem::Problem, error::DomainError, repository::ProblemRepository,
};

pub struct GetAllByPrevProblemIdUseCase<'a> {
    problem_repository: &'a dyn ProblemRepository,
}

impl<'a> GetAllByPrevProblemIdUseCase<'a> {
    pub fn new(problem_repository: &'a dyn ProblemRepository) -> Self {
        Self {
            problem_repository: problem_repository,
        }
    }

    pub fn execute(&self, prev_problem_id: Option<i64>) -> Result<Vec<Problem>, DomainError> {
        self.problem_repository
            .get_all_by_prev_problem_id(prev_problem_id)
    }
}
