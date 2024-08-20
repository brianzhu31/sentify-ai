from config import app
from api.auth import auth_bp
from api.search import search_bp
from api.company import company_bp
from models import db

app.register_blueprint(search_bp, url_prefix="/api/search")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(company_bp, url_prefix="/api/company")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create tables in the database
    app.run(port=8000, debug=True)
