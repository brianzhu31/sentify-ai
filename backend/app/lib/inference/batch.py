from typing import List, Callable
import os
import json


def create_jsonl_batch_file(
        articles: List,
        output_dir: str,
        file_name: str,
        prompt_function: Callable,
        prompt_args: List[str],
        output_json: bool = False
    ):
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, file_name)

    with open(output_file, 'w') as file:
        for i, article in enumerate(articles):
            prompt_data = {arg: getattr(article, arg) for arg in prompt_args}
            prompt_content = prompt_function(**prompt_data)

            post_data = {
                "custom_id": str(i),
                "method": "POST",
                "url": "/v1/chat/completions",
                "body": {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt_content
                        }
                    ],
                    "temperature": 0.2,
                    "top_p": 0.9
                }
            }

            if output_json:
                post_data["body"]["response_format"] = { "type": "json_object" }

            file.write(json.dumps(post_data) + '\n')
