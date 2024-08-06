import re


def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    text = re.sub(r"\n+", " ", text)
    return text
