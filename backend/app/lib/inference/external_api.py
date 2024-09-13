from typing import List, Dict, Any, Callable
import aiohttp
import asyncio
from exceptions.errors import ExternalAPITimeoutError, ExternalAPIError

async def call_model_api_async(
    session: aiohttp.ClientSession, url: str, body: Dict[str, Any], headers: Dict[str, str]
) -> Dict[str, Any]:
    try:
        async with session.post(url, json=body, headers=headers) as response:
            if response.status != 200:
                error_message = await response.text()
                raise aiohttp.ClientResponseError(
                    status=response.status,
                    message=error_message,
                    headers=response.headers
                )

            result = await response.json()
            return result

    except (aiohttp.ServerTimeoutError, asyncio.TimeoutError) as e:
        raise ExternalAPITimeoutError("Calling external API timed out. Please try again.")

    except Exception:
        raise ExternalAPIError("Error fetching data from external API.")


async def create_parallel_request(
    func: Callable[[aiohttp.ClientSession, Any], Any],
    data: List[Any],
    ssl: bool = False,
    **kwargs: Dict[str, Any]
) -> List[Any]:
    timeout = aiohttp.ClientTimeout(total=30)
    connector = aiohttp.TCPConnector(ssl=ssl, limit_per_host=30)
    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        tasks = []
        for item in data:
            task = func(session, **item, **kwargs)
            tasks.append(task)

        results = await asyncio.gather(*tasks)
        return results
