import re
import math


def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    text = re.sub(r"[^a-zA-Z0-9\s\.,!?-]", "", text)
    return text


def create_batches(items, max_batch_size):
    total_items = len(items)

    if total_items <= max_batch_size:
        return [items]

    num_batches = math.ceil(total_items / max_batch_size)
    base_batch_size = total_items // num_batches
    remainder = total_items % num_batches

    batches = []
    start_idx = 0

    for i in range(num_batches):
        batch_size = base_batch_size
        if i < remainder:
            batch_size += 1
        batches.append(items[start_idx:start_idx + batch_size])
        start_idx += batch_size

    return batches
