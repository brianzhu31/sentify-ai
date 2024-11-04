from managers.company_manager import CompanyManager
import requests
from urllib.parse import urlencode
import os
from datetime import datetime, timedelta
from typing import Dict, List
from copy import deepcopy

TWELVEDATA_API_KEY = os.getenv("TWELVEDATA_API_KEY")


class StockClient:
    BASE_URL = "https://api.twelvedata.com/"

    def _is_time_series_updated(self, ticker: str):
        last_updated = CompanyManager.get_time_series_last_updated(ticker=ticker)
        time_now = datetime.utcnow()

        threshold_time = time_now - timedelta(hours=1)
        if last_updated is None or last_updated < threshold_time:
            return False
        else:
            return True
    
    def _is_stock_price_updated(self, ticker: str):
        last_updated = CompanyManager.get_stock_price_last_updated(ticker=ticker)
        time_now = datetime.utcnow()

        threshold_time = time_now - timedelta(minutes=60)
        if last_updated is None or last_updated < threshold_time:
            return False
        else:
            return True

    def _call_stock_api(self, endpoint: str, params: Dict):
        url = f"{self.BASE_URL}{endpoint}?{urlencode(params)}"
        response = requests.get(url)
        print(response)
        return response.json()

    def _fetch_and_format_time_series(self, ticker: str, interval: str, days: int):
        current_date = datetime.utcnow()
        end_date = current_date + timedelta(days=1)
        start_date = current_date - timedelta(days=days)
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")

        api_response = self._call_stock_api(
            endpoint="time_series",
            params={
                "symbol": ticker,
                "interval": interval,
                "start_date": start_date_str,
                "end_date": end_date_str,
                "apikey": TWELVEDATA_API_KEY,
            },
        )

        formatted_values = []
        min_price = 9999999999
        max_price = 0
        values = api_response.get("values", [])
        for value in values:
            price = float(value["close"])
            timestamp = value["datetime"]
            if price > max_price:
                max_price = price
            elif price < min_price:
                min_price = price

            if len(timestamp) == 19:
                timestamp = timestamp[:-3]
            formatted_values.append({
                "price": price,
                "datetime": timestamp
            })

        ascending_formatted_values = list(reversed(formatted_values))
        return {
            "values": ascending_formatted_values,
            "min_price": min_price,
            "max_price": max_price
        }

    def _trim_time_period(self, time_series: Dict, days: int):
        new_time_series = deepcopy(time_series)
        threshold_date = datetime.now() - timedelta(days=days)

        cutoff_index = 0
        for i, day_result in enumerate(new_time_series["values"]):
            date_str = day_result["datetime"]
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            if date_obj >threshold_date:
                cutoff_index = i
                break

        trimmed_time_series_values = new_time_series["values"][cutoff_index:]

        new_time_series["values"] = trimmed_time_series_values
        return new_time_series

    def _get_all_time_series_periods(self, ticker: str):
        five_day_period = self._fetch_and_format_time_series(
            ticker=ticker, interval="1h", days=5
        )
        one_year_period = self._fetch_and_format_time_series(
            ticker=ticker, interval="1day", days=365
        )

        all_times_series_periods = {
            "5day": five_day_period,
            "month": self._trim_time_period(time_series=one_year_period, days=30),
            "6month": self._trim_time_period(time_series=one_year_period, days=180),
            "1year": one_year_period,
        }

        return all_times_series_periods

    def _get_stock_price(self, ticker: str):
        price_response = self._call_stock_api(
            endpoint="price",
            params={
                "symbol": ticker,
                "apikey": TWELVEDATA_API_KEY,
            },
        )
        float_price = float(price_response.get("price", 0))
        return float_price

    def _update_stock_price(self, ticker: str):
        price = self._get_stock_price(ticker=ticker)
        CompanyManager.update_stock_price(ticker=ticker, price=price)

    def _update_time_series(self, ticker: str):
        time_series_options = self._get_all_time_series_periods(ticker=ticker)
        CompanyManager.update_time_series(ticker=ticker, time_series=time_series_options)


    def get_time_series_options(self, ticker: str):
        if not self._is_time_series_updated(ticker=ticker):
            self._update_time_series(ticker=ticker)

        return CompanyManager.get_time_series(ticker=ticker)

    def get_stock_price(self, ticker: str):
        if not self._is_stock_price_updated(ticker=ticker):
            self._update_stock_price(ticker=ticker)

        return CompanyManager.get_stock_price(ticker=ticker)
