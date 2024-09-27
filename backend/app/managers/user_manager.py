from models import db, User as UserModel, Chat as ChatModel
from managers.chat_manager import ChatManager
from uuid import UUID
from exceptions.errors import NotFoundError, DBCommitError, PermissionDeniedError
from typing import List
from datetime import datetime

class UserManager:

    @classmethod
    def get_user_by_id(cls, user_id: UUID):
        user = UserModel.query.get(user_id)
        if user is None:
            raise NotFoundError(f"User with id {user_id} not found.")
        return user

    @classmethod
    def create_user(cls, user_id: UUID, email: str):
        new_user = UserModel(id=user_id, email=email)
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception:
            raise DBCommitError("Error registering user.")
