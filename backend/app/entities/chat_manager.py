from models import db, Message as MessageModel, Chat as ChatModel
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from exceptions.errors import NotFoundError, DBCommitError, PermissionDeniedError

class ChatManager:
    def __init__(self):
        self.db = db
        self.chat_model = ChatModel
    
    def _check_permission(self, chat_id: str, user_id: str):
        if chat_id != user_id:
            raise PermissionDeniedError("Unauthorized request")

    def get_chat_by_id(self, chat_id):
        chat = self.chat_model.query.get(chat_id)
        if chat is None:
            raise NotFoundError(f"Chat {chat_id} not found.")
        return chat

    def create_chat(self, user_id, name):
        new_chat = self.chat_model(user_id=user_id, name=name)
        try:
            self.db.session.add(new_chat)
            self.db.session.commit()
            return new_chat
        except Exception:
            self.db.session.rollback()
            raise DBCommitError("Error creating chat.")

    def delete_chat(self, chat_id):
        try:
            chat = self.get_chat_by_id(chat_id)
            self.db.session.delete(chat)
            self.db.session.commit()
        except Exception:
            self.db.session.rollback()
            raise DBCommitError("Error deleting chat")
            

    def edit_name(self, chat_id, new_name):
        try:
            chat = self.get_chat_by_id(chat_id)
            chat.name = new_name
            self.db.session.commit()
            return chat
        except:
            self.db.session.rollback()
            raise DBCommitError("Error editing chat name")

    def create_message(self, chat_id, role, content):
        try:
            new_message = MessageModel(chat_id=chat_id, role=role, content=content)
            self.db.session.add(new_message)
            self.db.session.commit()
            return new_message
        except:
            self.db.session.rollback()
            raise DBCommitError("Error creating message.")
