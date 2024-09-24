from entities.chat import Chat
from flask import jsonify, Blueprint, request, Response

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/retrieve", methods=["POST"])
def retrieve():
    message = request.json.get("message")
    chat = Chat(query=message)
    return jsonify(chat.retrieve()), 200


@chat_bp.route("/inference", methods=["POST"])
def inference():
    message = request.json.get("message")
    context = request.json.get("context")
    chat = Chat(query=message)

    def generate():
        for output in chat.inference(context):
            yield output

    return Response(generate(), content_type='text/plain')
