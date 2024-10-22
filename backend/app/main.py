from config import app, scheduler
from api.auth import auth_bp
from api.search import search_bp
from api.company import company_bp
from api.chat import chat_bp
from api.article import article_bp
from exceptions.handlers import errors_bp
from models import db
from tasks.article_tasks import process_articles

app.register_blueprint(search_bp, url_prefix="/api/search")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(company_bp, url_prefix="/api/company")
app.register_blueprint(chat_bp, url_prefix="/api/chat")
app.register_blueprint(article_bp, url_prefix="/api/article")
app.register_blueprint(errors_bp)

scheduler.add_job(
    id='process_articles_job',
    func=process_articles,
    trigger='cron',
    hour=18,
    minute=51,
    timezone='US/Eastern',
    misfire_grace_time=None
)
scheduler.start()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(port=8000, debug=True)
    # app.run(port=8000, debug=True, use_reloader=False)
