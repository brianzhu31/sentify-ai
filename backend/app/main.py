from config import app
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from api.auth import auth_bp
from api.company import company_bp
from api.chat import chat_bp
from api.article import article_bp
from exceptions.handlers import errors_bp
from models import db
from tasks.inference_tasks import full_update

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(company_bp, url_prefix="/api/company")
app.register_blueprint(chat_bp, url_prefix="/api/chat")
app.register_blueprint(article_bp, url_prefix="/api/article")
app.register_blueprint(errors_bp)

scheduler = BackgroundScheduler()

trigger = CronTrigger(year="*", month="*", day="*", hour="22", minute="18", timezone="US/Eastern")

scheduler.add_job(
    id="full_inferece_job",
    func=full_update,
    trigger=trigger,
    misfire_grace_time=None,
)
scheduler.start()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # app.run(port=8000, debug=True)
    app.run(port=8000, debug=True, use_reloader=False)
