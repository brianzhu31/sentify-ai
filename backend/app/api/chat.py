from app.services.rag import RAGEngine
from entities.user import User
from models import db, Chat as ChatModel, Message as MessageModel
from managers.chat_manager import ChatManager
from lib.validation import token_required
from flask import jsonify, Blueprint, request, Response, g
from exceptions.errors import NotFoundError
from datetime import datetime
from uuid import UUID

chat_bp = Blueprint("chat", __name__)

chat_manager = ChatManager()


@chat_bp.route("/send", methods=["POST"])
@token_required
def send():
    user_id = UUID(g.user["sub"])
    message_content = request.json.get("message")
    chat_id = request.json.get("chat_id")

    if chat_id:
        ChatManager.create_message(user_id=user_id, chat_id=chat_id, role="user", content=message_content)
    else:
        new_chat = ChatManager.create_chat(user_id=user_id, name="New Chat")
        ChatManager.create_message(user_id=user_id, chat_id=new_chat.id, role="user", content=message_content)
        chat_id = new_chat.id

    chat_response = {
        "data": RAGEngine(query=message_content).retrieve(),
        "chat_id": chat_id
    }

    return jsonify(chat_response), 200


@chat_bp.route("/inference", methods=["POST"])
def inference():
    message = request.json.get("message")
    context = request.json.get("context")
    chat = RAGEngine(query=message)

    def generate():
        for output in chat.inference(context):
            yield output

    return Response(generate(), content_type="text/plain")


@chat_bp.route("/save_output", methods=["POST"])
@token_required
def save_output():
    user_id = UUID(g.user["sub"])
    message = request.json.get("message")
    chat_id = request.json.get("chat_id")
    sources = request.json.get("sources")
    
    sources_trimmed = []
    for source in sources:
        sources_trimmed.append({
            "article_title": source["metadata"]["article_title"],
            "article_url": source["metadata"]["article_url"]
        })

    ChatManager.create_message(user_id=user_id, chat_id=chat_id, role="assistant", content=message, sources=sources_trimmed)

    return {"message": "success"}
