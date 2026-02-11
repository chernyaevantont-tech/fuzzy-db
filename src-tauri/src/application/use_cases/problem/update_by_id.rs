use crate::domain::{
    entities::{image::Image, problem::Problem},
    error::DomainError,
    repository::ProblemRepository,
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

    pub fn execute(
        &self,
        id: i64,
        model: &Problem,
        delete_image: bool,
        new_image: Option<Image>,
    ) -> Result<Option<i64>, DomainError> {
        let mut problem = self.problem_repository.get_full_by_id(id)?;

        problem.name = model.name.clone();
        problem.description = model.description.clone();

        if delete_image || new_image.is_some() {
            // Delete old image is handled implicitly by setting image_id to new one or None
            // Wait, removing the old image record from 'image' table is NOT handled by update_by_id in repo normally.
            // But we should probably rely on repo logic or handle it here if repo exposes image deletion.
            // The repo `update_by_id` implementation I saw earlier just updates the `image_id` column.
            // It does NOT delete the old image row. That might be a resource leak.
            // However, `remove_problem_by_id` did manual deletion.
            // Ideally, we should clean up the old image.
            // But `ProblemRepository` trait doesn't have `remove_image_by_id`.
            // We can rely on `image` field in `Problem` model to signal the repo to do the work,
            // IF we update the repo implementation.
        }

        if let Some(img) = new_image {
             problem.image = Some(img);
             // When problem.image is Some, the repo implementation (if adapted) should create it.
             // BUT simpler:
             // The repo `create` handles `problem.image`.
             // `update_by_id` I saw earlier does NOT handle `problem.image` creation!
             // It only updates `image_id`.
             // So I MUST update the repo `update_by_id` to handle `problem.image` creation if present.
        } else if delete_image {
            problem.image = None;
            problem.image_id = None;
        }
        
        // Actually, let's pass the intent via `problem` object that the repo understands.
        // My previous analysis showed `update_by_id` in repo is naive.
        // I will update the repo implementation to handle `model.image` logic similar to `create`.
        
        self.problem_repository.update_by_id(id, &problem)
    }
}
