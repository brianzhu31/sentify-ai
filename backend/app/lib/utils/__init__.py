import re
import math
import json
from datetime import datetime, timezone
import pytz


def clean_text(text):
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    text = re.sub(r"[^a-zA-Z0-9\s\.,!?-]", "", text)
    return text


def jsonl_string_to_list(jsonl_string):
    lines = jsonl_string.strip().split('\n')
    dicts = [json.loads(line) for line in lines if line]
    
    return dicts


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


def datetime_to_unix(dt_obj: datetime):
    dt_obj = dt_obj.replace(tzinfo=timezone.utc)
    unix_timestamp = int(dt_obj.timestamp())
    return unix_timestamp


def convert_est_string_to_utc(date_string: str):
    date_format = '%Y-%m-%d %H:%M:%S' 
    est = pytz.timezone('America/New_York')
    naive_datetime = datetime.strptime(date_string, date_format)
    localized_datetime = est.localize(naive_datetime)
    utc_datetime = localized_datetime.astimezone(pytz.utc)
    return utc_datetime


def unix_to_formatted_string_est(unix_timestamp):
    dt_utc = datetime.utcfromtimestamp(unix_timestamp)
    est = pytz.timezone('America/New_York')
    dt_est = dt_utc.replace(tzinfo=pytz.utc).astimezone(est)
    formatted_time = dt_est.strftime("%B %d, %Y %I:%M %p")
    return formatted_time
