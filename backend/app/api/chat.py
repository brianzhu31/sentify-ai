from services.rag import RAGEngine
from entities.user import User
from managers.chat_manager import ChatManager
from lib.validation import token_required
from flask import jsonify, Blueprint, request, Response, g
from exceptions.errors import NotFoundError
from datetime import datetime
from uuid import UUID

chat_bp = Blueprint("chat", __name__)

chat_manager = ChatManager()

@chat_bp.route("/get/<uuid:chat_id>", methods=["GET"])
@token_required
def get_chat(chat_id: UUID):
    user_id = UUID(g.user["sub"])
    chat = ChatManager.get_chat_by_id(user_id=user_id, chat_id=chat_id)
    messages = ChatManager.get_all_chat_messages(user_id=user_id, chat_id=chat_id)

    chat_data = {
        "chat_id": chat.id,
        "user_id": chat.user_id,
        "name": chat.name,
        "created_at": chat.created_at,
        "last_accessed": chat.last_accessed,
        "messages": []
    }
    for message in messages:
        message_data = {
            "role": message.role,
            "content": message.content
        }
        if message.role == "assistant":
            message_data["sources"] = message.sources

        chat_data["messages"].append(message_data)

    return jsonify(chat_data), 200

@chat_bp.route("/get_chats", methods=["GET"])
@token_required
def get_all_chat_sessions():
    user_id = UUID(g.user["sub"])
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=30, type=int)

    if limit > 50:
        limit = 50

    paginated_chats = ChatManager.get_chat_sessions(user_id=user_id, page=page, limit=limit)
    chats = paginated_chats["chats"]
    has_more = paginated_chats["has_more"]

    formatted_chats = {
        "label": "Chats",
        "chats": [
            {
                "chat_id": chat.id,
                "name": chat.name,
                "href": f"/chat/{chat.id}",
                "last_accessed": chat.last_accessed
            }
            for chat in chats
        ],
        "has_more": has_more
    }

    return jsonify(formatted_chats), 200


@chat_bp.route("/delete/<uuid:chat_id>", methods=["DELETE"])
@token_required
def delete_chat(chat_id: UUID):
    user_id = UUID(g.user["sub"])
    chat = ChatManager.get_chat_by_id(user_id=user_id, chat_id=chat_id)
    ChatManager.delete_chat(user_id=user_id, chat_id=chat.id)

    return jsonify({"message": f"Chat {chat.id} successfully deleted."}), 200


@chat_bp.route("/rename/<uuid:chat_id>", methods=["PUT"])
@token_required
def rename_chat(chat_id: UUID):
    user_id = UUID(g.user["sub"])
    new_name = request.json.get("new_name")
    chat = ChatManager.get_chat_by_id(user_id=user_id, chat_id=chat_id)
    new_chat = ChatManager.edit_chat_name(user_id=user_id, chat_id=chat_id, new_name=new_name)

    return jsonify({"message": f"Chat renamed successfully."})


@chat_bp.route("/send", methods=["POST"])
@token_required
def send():
    user_id = UUID(g.user["sub"])
    message_content = request.json.get("message")
    chat_id = request.json.get("chat_id")

    rag_engine = RAGEngine()
    is_new_chat = True
    if chat_id is not None:
        is_new_chat = False

    query_validation = rag_engine.validate(query=message_content, is_new_chat=is_new_chat)
    if query_validation["status"] == -1:
        return jsonify({"message": query_validation["message"], "status": "not accepted"}), 200

    chat_name = ""
    timestamp = None
    if chat_id:
        chat = ChatManager.get_chat_by_id(user_id=user_id, chat_id=chat_id)
        chat_name = chat.name
        timestamp = chat.last_accessed
        ChatManager.create_message(user_id=user_id, chat_id=chat_id, role="user", content=message_content)
    else:
        chat_name = query_validation["message"]
        new_chat = ChatManager.create_chat(user_id=user_id, name=chat_name)
        ChatManager.create_message(user_id=user_id, chat_id=new_chat.id, role="user", content=message_content)
        chat_id = new_chat.id
        timestamp = new_chat.last_accessed

    return jsonify({"chat_name": chat_name, "chat_id": chat_id, "timestamp": timestamp, "status": "ok"}), 200


@chat_bp.route("/retrieve", methods=["POST"])
@token_required
def retrieve():
    message_content = request.json.get("message")
    rag_engine = RAGEngine()
    context = rag_engine.retrieve(query=message_content)

    return jsonify(context), 200


@chat_bp.route("/inference", methods=["POST"])
@token_required
def inference():
    user_id = UUID(g.user["sub"])
    query = request.json.get("message")
    context = request.json.get("context")
    chat_id = request.json.get("chat_id")

    messages = ChatManager.get_all_chat_messages(user_id=user_id, chat_id=chat_id)

    chat_session_history = ""
    for message in messages[:-1]:
        chat_session_history += f"{message.role}: {message.content}\n\n"

    rag_engine = RAGEngine()

    def generate():
        for output in rag_engine.inference(query=query, chat_session_history=chat_session_history, relevant_articles=context):
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
        sources_trimmed.append(source)

    ChatManager.create_message(user_id=user_id, chat_id=chat_id, role="assistant", content=message, sources=sources_trimmed)

    return {"message": "success"}
