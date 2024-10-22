from models import db, Message as MessageModel, Chat as ChatModel
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from exceptions.errors import NotFoundError, DBCommitError, PermissionDeniedError
from uuid import UUID
from typing import Dict, List


class Chat:
    def __init__(self, chat_model: ChatModel):
        self.id = chat_model.id
        self.user_id = chat_model.user_id
        self.name = chat_model.name
        self.created_at = chat_model.created_at
        self.last_accessed = chat_model.last_accessed


class Message:
    def __init__(self, message_model: MessageModel):
        self.id = message_model.id
        self.chat_id = message_model.chat_id
        self.role = message_model.role
        self.content = message_model.content
        self.sources = message_model.sources
        self.timestamp = message_model.timestamp


class ChatManager:

    @staticmethod
    def get_chat_by_id(user_id: UUID, chat_id: UUID):
        chat = ChatModel.query.get(chat_id)
        if chat is None:
            raise NotFoundError(f"Chat {chat_id} not found.")
        if chat.user_id != user_id:
            raise PermissionDeniedError(f"Unauthorized request attempt on chat {chat_id}. User id: {chat.user_id}")
        return Chat(chat)

    @classmethod
    def get_all_chat_messages(cls, user_id: UUID, chat_id: UUID):
        chat = cls.get_chat_by_id(user_id=user_id, chat_id=chat_id)
        messages = MessageModel.query.filter_by(chat_id=chat.id).all()
        return [Message(message) for message in messages]

    @staticmethod
    def create_chat(user_id: UUID, name: str):
        new_chat = ChatModel(user_id=user_id, name=name)
        try:
            db.session.add(new_chat)
            db.session.commit()
            return Chat(new_chat)
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
            return Chat(chat)
        except:
            db.session.rollback()
            raise DBCommitError("Error editing chat name")

    @classmethod
    def create_message(cls, user_id: UUID, chat_id: UUID, role: str, content: str, sources: List = []):
        chat = cls.get_chat_by_id(user_id=user_id, chat_id=chat_id)
        chat.last_accessed = datetime.utcnow()
        try:
            new_message = MessageModel(chat_id=chat_id, role=role, content=content, sources=sources)
            db.session.add(new_message)
            db.session.commit()
            return Message(new_message)
        except:
            db.session.rollback()
            raise DBCommitError("Error creating message.")

    @staticmethod
    def get_chat_sessions(user_id: UUID, page: int, limit: int):
        chats_query = (
            ChatModel.query.filter_by(user_id=user_id)
            .order_by(ChatModel.last_accessed.desc())
            .paginate(page=page, per_page=limit)
        )

        chats = chats_query.items
        return {"chats": chats, "has_more": chats_query.has_next}
