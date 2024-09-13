import re

def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    text = re.sub(r"[^a-zA-Z0-9\s\.,!?-]", "", text)
    return text
