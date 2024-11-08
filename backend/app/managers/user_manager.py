from app.models import db, User as UserModel
from app.exceptions.errors import NotFoundError, DBCommitError
from uuid import UUID


class User:
    def __init__(self, user_model: UserModel):
        self.id = user_model.id
        self.email = user_model.email
        self.plan = user_model.plan
        self.created_at = user_model.created_at


class UserManager:

    @staticmethod
    def get_user_by_id(user_id: UUID):
        user = UserModel.query.get(user_id)
        if user is None:
            raise NotFoundError(f"User with id {user_id} not found.")
        return User(user)

    @staticmethod
    def create_user(user_id: UUID, email: str):
        new_user = UserModel(id=user_id, email=email)
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception:
            raise DBCommitError("Error registering user.")
