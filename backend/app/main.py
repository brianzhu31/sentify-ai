from config import app, db
from api.search import search_bp

app.register_blueprint(search_bp, url_prefix='/api')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(port=8000, debug=True)
