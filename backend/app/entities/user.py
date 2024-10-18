from models import db, User as UserModel, Search as SearchModel, Chat as ChatModel
from entities.search import Search
from uuid import UUID
from exceptions.errors import NotFoundError, DBCommitError, PermissionDeniedError
from typing import List
from datetime import datetime


class User:
    def __init__(self, user_id: UUID = None, email: str = None):
        self.id: UUID = user_id
        self.email: str = email
        self.plan: str = "Basic"
        self.created_at: datetime = None

    @classmethod
    def get_by_id(cls, user_id: UUID):
        user_query = UserModel(user_id)

        if user_query is None:
            raise NotFoundError(f"User with id {user_id} not found.")

        user_instance = cls()
        user_instance.id = user_query.id
        user_instance.email = user_query.email
        user_instance.plan = user_query.plan
        user_instance.created_at = user_query.created_at

        return user_instance

    def register(self):
        new_user = UserModel(id=self.id, email=self.email)
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception:
            raise DBCommitError("Error registering user.")
    
    def create_chat(self, name: str):
        new_chat = ChatModel(user_id=self.id, name=name)
        try:
            db.session.add(new_chat)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise DBCommitError(f"Error creating chat.")
        
        chat = Chat.get_by_id(new_chat.id)
        return chat
    
    def delete_chat(self, chat_id: UUID):
        chat_to_delete = ChatModel.query.get(chat_id)
        if chat_to_delete is None:
            raise NotFoundError(f"Chat {chat_id} not found")
        
        if chat_to_delete.user_id != self.id:
            raise PermissionDeniedError("Unauthorized deletion attempt.")

        try:
            db.session.delete(chat_to_delete)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise DBCommitError(f"Error deleting chat: {e}")

    def create_search(self, ticker: str, days_ago: int):
        new_search = Search.generate_by_inference(
            user_id=self.id, ticker=ticker, days_ago=days_ago
        )
        self.daily_search_count += 1

        try:
            user_query = UserModel.query.get(self.id)
            user_query.daily_search_count = self.daily_search_count
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise DBCommitError(
                f"Error saving search {new_search.id} to user {self.id}."
            )

        return new_search

    def delete_search(self, search_id: UUID):
        search = Search.get_by_id(search_id=search_id)
        search.delete()

        try:
            user_query = UserModel.query.get(self.id)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise DBCommitError(
                f"Error deleting search {search_id} from user {self.id}."
            )

    def can_perform_search(self):
        if self.plan == "Basic" and self.daily_search_count >= 10:
            return False
        return True

    def get_search_history(self, page: int, limit: int):
        searches_query = (
            SearchModel.query.filter(SearchModel.id.in_(self.search_ids))
            .order_by(SearchModel.created_at.desc())
            .paginate(page=page, per_page=limit)
        )

        searches = searches_query.items

        return {"searches": searches, "has_more": searches_query.has_next}
