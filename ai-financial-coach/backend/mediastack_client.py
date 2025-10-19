import os
import requests
from dotenv import load_dotenv

load_dotenv()


class MediastackClient:
    """
    Lightweight client for Mediastack news API to fetch a short, timely reason
    (headline) for a stock symbol/company. Free tier supports HTTP only.
    """

    def __init__(self):
        self.api_key = os.getenv("MEDIASTACK_API_KEY")
        self.base_url = "http://api.mediastack.com/v1/news"

    def _enabled(self):
        return bool(self.api_key)

    def get_top_headline(self, query: str):
        """
        Return the latest business headline matching the query or None.
        """
        if not self._enabled():
            return None
        try:
            params = {
                "access_key": self.api_key,
                "languages": "en",
                "sort": "published_desc",
                "limit": 1,
                "categories": "business",
                "keywords": query,
            }
            resp = requests.get(self.base_url, params=params, timeout=6)
            if resp.status_code != 200:
                return None
            data = resp.json() if resp.content else {}
            items = data.get("data") or []
            if not items:
                return None
            top = items[0]
            title = (top.get("title") or "").strip()
            if title:
                return title
            desc = (top.get("description") or "").strip()
            return desc or None
        except Exception:
            return None

    def get_reason_for_stock(self, symbol: str, name: str = None):
        """
        Build a short 'reason' string for a stock using the latest headline.
        Prefer company name + symbol as query; fall back to symbol alone.
        """
        query_parts = []
        if name:
            query_parts.append(str(name))
        if symbol:
            query_parts.append(str(symbol))
        query = " ".join(query_parts).strip() or str(symbol or "")

        headline = self.get_top_headline(query)
        if headline:
            return f"Latest headline: {headline}"
        return None
