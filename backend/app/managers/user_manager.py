from app.models import db, User as UserModel
from app.exceptions.errors import NotFoundError, DBCommitError
from uuid import UUID


class User:
    def __init__(self, user_model: UserModel):
        self.id = user_model.id
        self.email = user_model.email
        self.plan = user_model.plan
        self.daily_message_count = user_model.daily_message_count
        self.created_at = user_model.created_at


class UserManager:

    @staticmethod
    def get_user_by_id(user_id: UUID):
        user = UserModel.query.get(user_id)
        if user is None:
            return None
        return User(user)
    
    @staticmethod
    def get_user_by_email(email: str):
        user = UserModel.query.filter_by(email=email).one_or_none()
        if user is None:
            return None
        return User(user)

    @classmethod
    def create_user(cls, user_id: UUID, email: str):
        new_user = UserModel(id=user_id, email=email)
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as e:
            raise DBCommitError(f"Error registering user: {e}")
    
    @classmethod
    def can_send_message(cls, user_id: UUID):
        user = cls.get_user_by_id(user_id=user_id)
        if user is None:
            raise NotFoundError(f"User {user_id} not found.")
        if user.plan == "Basic" and user.daily_message_count >= 10:
            return False
        return True

    @staticmethod
    def reset_all_user_message_counts():
        try:
            UserModel.query.update({UserModel.daily_message_count: 0})
            db.session.commit()
        except Exception as e:
            raise DBCommitError(f"Error resetting user message counts: {e}")
