import os


class Config:
    FLASK_ENV = os.getenv("FLASK_ENV", "development")

    SUPABASE_URI = os.getenv("SUPABASE_URI")
    SQLALCHEMY_DATABASE_URI = f"{SUPABASE_URI}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")

    SCHEDULER_API_ENABLED = True

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "connect_args": {
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
    }

    PROPAGATE_EXCEPTIONS = True
