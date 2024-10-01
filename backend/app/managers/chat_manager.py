from models import db, Message as MessageModel, Chat as ChatModel
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from exceptions.errors import NotFoundError, DBCommitError, PermissionDeniedError
from uuid import UUID
from typing import Dict, List


class ChatManager:

    @classmethod
    def get_chat_by_id(cls, user_id: UUID, chat_id: UUID):
        chat = ChatModel.query.get(chat_id)
        if chat is None:
            raise NotFoundError(f"Chat {chat_id} not found.")
        if chat.user_id != user_id:
            raise PermissionDeniedError(f"Unauthorized request attempt on chat {chat_id}. User id: {chat.user_id}")
        return chat

    @classmethod
    def get_all_chat_messages(cls, user_id: UUID, chat_id: UUID):
        chat = cls.get_chat_by_id(user_id=user_id, chat_id=chat_id)

        chat.last_accessed = datetime.utcnow()
        db.session.commit()

        messages = MessageModel.query.filter_by(chat_id=chat_id).all()
        return messages

    @classmethod
    def create_chat(cls, user_id: UUID, name: str):
        new_chat = ChatModel(user_id=user_id, name=name)
        try:
            db.session.add(new_chat)
            db.session.commit()
            return new_chat
        except Exception:
            db.session.rollback()
            raise DBCommitError("Error creating chat.")

    @classmethod
    def delete_chat(cls, user_id: UUID, chat_id: UUID):
        chat = cls.get_chat_by_id(user_id=user_id, chat_id=chat_id)
        try:
            db.session.delete(chat)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise DBCommitError("Error deleting chat")

    @classmethod
    def edit_chat_name(cls, user_id: UUID, chat_id: UUID, new_name: str):
        chat = cls.get_chat_by_id(user_id=user_id, chat_id=chat_id)
        try:
            chat.name = new_name
            db.session.commit()
            return chat
        except:
            db.session.rollback()
            raise DBCommitError("Error editing chat name")

    @classmethod
    def create_message(cls, user_id: UUID, chat_id: UUID, role: str, content: str, sources: List = []):
        chat = cls.get_chat_by_id(user_id=user_id, chat_id=chat_id)
        try:
            new_message = MessageModel(chat_id=chat_id, role=role, content=content, sources=sources)
            db.session.add(new_message)
            db.session.commit()
            return new_message
        except:
            db.session.rollback()
            raise DBCommitError("Error creating message.")
