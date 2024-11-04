from openai import OpenAI
from lib.utils import jsonl_string_to_list
from typing import List, Callable
import os
import json
import time

OPENAI_KEY = os.getenv("OPENAI_KEY")

client = OpenAI(api_key=OPENAI_KEY)


def create_jsonl_batch_file(
    objects: List,
    output_dir: str,
    file_name: str,
    prompt_function: Callable,
    prompt_args: List[str],
    output_json: bool = False,
    custom_id_key: str = None,
    temperature: int = 0.2,
    top_p: int = 0.9
):
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, file_name)

    with open(output_file, "w") as file:
        for i, obj in enumerate(objects):
            prompt_data = {arg: getattr(obj, arg) for arg in prompt_args}
            prompt_content = prompt_function(**prompt_data)

            custom_id = getattr(obj, custom_id_key) if custom_id_key else str(i)

            post_data = {
                "custom_id": custom_id,
                "method": "POST",
                "url": "/v1/chat/completions",
                "body": {
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt_content}],
                    "temperature": temperature,
                    "top_p": top_p,
                },
            }

            if output_json:
                post_data["body"]["response_format"] = {"type": "json_object"}

            file.write(json.dumps(post_data) + "\n")


def create_jsonl_embedding_batch_file(
    texts: List[str],
    output_dir: str,
    file_name: str,
):
    os.makedirs(output_dir, exist_ok=True)

    output_file_path = os.path.join(output_dir, file_name)

    with open(output_file_path, "w") as f:
        for i, text in enumerate(texts):
            json_record = {
                "custom_id": str(i),
                "method": "POST",
                "url": "/v1/embeddings",
                "body": {
                    "input": text,
                    "model": "text-embedding-3-small",
                    "encoding_format": "float",
                },
            }
            f.write(json.dumps(json_record) + "\n")


def submit_batch(filepath: str, endpoint: str, job_description: str):
    batch_input_file = client.files.create(file=open(filepath, "rb"), purpose="batch")

    batch_input_file_id = batch_input_file.id
    new_batch = client.batches.create(
        input_file_id=batch_input_file_id,
        endpoint=endpoint,
        completion_window="24h",
        metadata={"description": job_description},
    )

    return new_batch.id


def get_batch_results(batch_id: str, output_dir: str, output_filename: str,):
    batch_success = False
    while True:
        batch = client.batches.retrieve(batch_id)
        if batch.status == "completed":
            batch_success = True
            break
        if batch.status in ["failed", "expired", "cancelled"]:
            break

        time.sleep(10)

    file_response = None
    batch = client.batches.retrieve(batch_id)
    if batch_success:
        file_response = client.files.content(batch.output_file_id)
        output_dir = output_dir
        output_file = os.path.join(output_dir, output_filename)

        with open(output_file, "w") as file:
            file.write(file_response.text)

        client.files.delete(batch.input_file_id)
        client.files.delete(batch.output_file_id)

    output = jsonl_string_to_list(file_response.text)

    return output
