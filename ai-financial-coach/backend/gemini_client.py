import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

class GeminiClient:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
    
    def categorize_transactions(self, transaction_list):
        """Categorize transactions as 'Need' or 'Want' using Gemini AI"""
        try:
            if not self.model:
                print("⚠️  Gemini API key not configured, using fallback categorization")
                return None
            
            prompt = f"""You are a meticulous financial analyst AI. Your sole task is to categorize a list of bank transaction descriptions as either 'Need' or 'Want'.

**Definitions:**
- 'Needs' are essential for living and working: rent, utilities, essential groceries, transportation to work, insurance, and bill payments.
- 'Wants' are non-essential items that improve quality of life: restaurants, coffee shops, shopping for non-essential clothing, entertainment, subscriptions for entertainment, and impulse buys.

**Examples (Few-shot learning):**
- "AUSTIN ENERGY BILL" -> "Need"
- "HEB" -> "Need" (Groceries)
- "Chevron Gas" -> "Need" (Transportation)
- "Starbucks" -> "Want"
- "Zara" -> "Want"
- "Netflix Subscription" -> "Want"
- "AMC Theaters" -> "Want"

**Instructions:**
Analyze the following list of transactions. Return your response as a single, valid JSON object and nothing else. Do not include any introductory text, explanations, or markdown formatting like ```json. The JSON object must conform to this exact structure:
{{
  "transactions": ["Need", "Want", "Need", ...]
}}

Here is the list of transactions to categorize:
{json.dumps(transaction_list)}"""

            response = self.model.generate_content(prompt)
            
            # Parse the JSON response
            response_text = response.text.strip()
            
            # Remove any markdown formatting if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            result = json.loads(response_text)
            return result
            
        except Exception as e:
            print(f"⚠️  Error categorizing transactions: {e}")
            return None
    
    def get_recommendation(self, needs_total, wants_total, goal, want_transactions_list):
        """Generate personalized financial recommendation"""
        try:
            if not self.model:
                print("⚠️  Gemini API key not configured, using fallback recommendation")
                return self._get_fallback_recommendation(needs_total, wants_total, goal, want_transactions_list)

            # Structured prompt: ask for JSON with top wants and a short actionable suggestion
            prompt = f"""
You are an expert, friendly financial coach. Given the user's spending context, return a single JSON object (and nothing else) with these fields:

{{
  "top_want_transactions": [
    {{"description": "<text>", "amount": <number>}},
    ... up to 3 items ...
  ],
  "top_categories": ["coffee", "dining", "shopping"],
  "suggestion": "A short (1-2 sentence) actionable suggestion for the user",
  "reason": "One short sentence explaining why this will help"
}}

User context:
- monthly_savings_goal: ${goal}
- needs_total: ${needs_total}
- wants_total: ${wants_total}
- want_transactions (detailed): {want_transactions_list}

Constraints:
- Return ONLY the JSON object, nothing else (no prose, no backticks).
- Keep suggestion to 1-2 sentences. Focus on small, actionable changes (e.g., "make coffee at home 3 days this week").
"""

            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Strip markdown fences if present
            if response_text.startswith('```'):
                # remove leading fence
                parts = response_text.split('```')
                if len(parts) >= 2:
                    response_text = parts[1].strip()

            # Try to parse JSON
            try:
                data = json.loads(response_text)
            except Exception:
                # Fallback: ask for a plain-text recommendation
                try:
                    # Attempt to extract a plain-text suggestion
                    return response_text.split('\n')[0][:500]
                except:
                    return self._get_fallback_recommendation(needs_total, wants_total, goal, want_transactions_list)

            # Build a concise human-readable recommendation string from structured data
            suggestion = data.get('suggestion') or ''
            reason = data.get('reason') or ''
            top = data.get('top_want_transactions', [])
            cats = data.get('top_categories', [])

            # Format top wants summary
            top_summary = ''
            if top:
                items = [f"{t.get('description','').strip()} (${float(t.get('amount',0)):.2f})" for t in top]
                top_summary = 'Top wants: ' + ', '.join(items) + '.'

            cat_summary = ''
            if cats:
                cat_summary = 'Major categories: ' + ', '.join(cats) + '. '

            final = ' '.join(p for p in [suggestion, reason, top_summary, cat_summary] if p).strip()
            return final or self._get_fallback_recommendation(needs_total, wants_total, goal, want_transactions_list)

        except Exception as e:
            print(f"⚠️  Error getting recommendation: {e}")
            return self._get_fallback_recommendation(needs_total, wants_total, goal, want_transactions_list)
    
    def get_investment_concept(self, goal):
        """Generate educational investment concept"""
        try:
            if not self.model:
                print("⚠️  Gemini API key not configured, using fallback investment concept")
                return self._get_fallback_investment_concept(goal)
            
            prompt = f"""You are a financial educator AI. Your role is to explain complex financial concepts in a simple, easy-to-understand way. You are NOT a financial advisor and must not give financial advice.

**User Context:**
My user has successfully reached their savings goal of ${goal}! They are now curious about what to do with their savings.

**Your Task:**
Explain the concept of "investing a percentage of savings into a low-cost index fund that tracks a broad market like the S&P 500."

**CRITICAL CONSTRAINTS:**
- **DO NOT** recommend any specific stock, ETF, or mutual fund ticker (e.g., absolutely DO NOT mention VOO, SPY, VTI, etc.).
- **DO NOT** use language that could be interpreted as a directive or advice to buy, sell, or hold any security. Avoid phrases like "you should," "consider buying," or "a good option is."
- **DO** explain that an index fund is a collection or bundle of many stocks, which helps with diversification and is generally considered a foundational long-term investment strategy compared to picking individual stocks.
- **DO** frame the entire explanation as general educational information, not a personal recommendation.
- **DO** conclude with a warm, encouraging message congratulating them on hitting their goal and suggesting they celebrate their achievement with a small, well-deserved treat.

Return your response as a JSON object with "title" and "explanation" fields."""

            response = self.model.generate_content(prompt)
            
            # Try to parse as JSON first
            try:
                result = json.loads(response.text.strip())
                return result
            except:
                # If not JSON, create a structured response
                return {
                    "title": "Congratulations on Reaching Your Goal! 🎉",
                    "explanation": response.text.strip()
                }
            
        except Exception as e:
            print(f"⚠️  Error getting investment concept: {e}")
            return self._get_fallback_investment_concept(goal)
    
    def _get_fallback_recommendation(self, needs_total, wants_total, goal, want_transactions_list):
        """Fallback recommendation when AI is not available"""
        if wants_total > goal * 0.6:
            return f"Great job tracking your spending! I noticed you spent ${wants_total:.2f} on 'wants' this period. Consider reducing discretionary spending to better meet your ${goal} savings goal. Small changes like making coffee at home or cooking more meals can add up quickly!"
        else:
            return f"Excellent work! You're doing a great job managing your spending and staying on track with your ${goal} savings goal. Keep up the fantastic work!"
    
    def _get_fallback_investment_concept(self, goal):
        """Fallback investment concept when AI is not available"""
        return {
            "title": "Congratulations on Reaching Your Goal! 🎉",
            "explanation": f"Congratulations on successfully reaching your ${goal} savings goal! This is a fantastic achievement that shows great financial discipline. As you continue building your savings, you might want to learn about index funds - these are investment vehicles that hold many different stocks, providing diversification and typically lower risk compared to individual stock picking. This is general educational information, and you should always do your own research or consult with a qualified financial advisor before making investment decisions. Celebrate this milestone - you've earned it! 🎊"
        }

    def get_trending_stocks(self, avoid_symbols=None, seed=None, temperature=0.9):
        """Ask Gemini for 3 trending 'buy now' and 3 'sell now' stocks with short descriptions.
        Returns a dict: {"buys": [{symbol, name, reason}], "sells": [...], "disclaimer": str}

        Parameters:
        - avoid_symbols: list[str] of symbols to avoid repeating if possible (used for refreshes)
        - seed: optional value injected into the prompt to encourage variety
        - temperature: float, higher values increase output diversity
        """
        try:
            # If model not available, provide a static fallback
            if not self.model:
                return self._fallback_trending_stocks(avoid_symbols=avoid_symbols)

            avoid_list = ', '.join(sorted(set((avoid_symbols or []))))
            seed_text = f"Seed: {seed}" if seed is not None else "Seed: none"

            prompt = (
                "You are a market news summarizer. Identify the three most currently trending US-listed stocks to 'Buy Now' "
                "and three to 'Sell Now' based on recent news, momentum, earnings, or sentiment. "
                "Return ONLY a strict JSON object with this exact schema and nothing else (no prose, no backticks):\n"
                "{\n"
                "  \"buys\": [ { \"symbol\": \"AAPL\", \"name\": \"Apple Inc.\", \"reason\": \"1-2 sentence rationale\" }, ... 3 items total ... ],\n"
                "  \"sells\": [ { \"symbol\": \"XXX\", \"name\": \"Company\", \"reason\": \"1-2 sentence rationale\" }, ... 3 items total ... ],\n"
                "  \"disclaimer\": \"Short general-information disclaimer (not financial advice).\"\n"
                "}\n\n"
                "Constraints:\n"
                "- Use only US-listed common stocks (avoid funds/ETFs).\n"
                "- Keep each 'reason' to 1-2 sentences.\n"
                "- Do not include price targets or guarantee outcomes.\n"
                "- Today's date is dynamically understood by you.\n"
                "- If possible, avoid repeating any of these symbols in your picks: [" + avoid_list + "]\n"
                "- If avoidance is not possible due to market context, you may include some overlap.\n\n"
                f"{seed_text}"
            )

            # Prefer a slightly higher temperature to encourage variety
            try:
                response = self.model.generate_content(prompt, generation_config={"temperature": float(temperature)})
            except Exception:
                # Fallback: call without config if SDK doesn't accept generation_config dict
                response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                parts = text.split('```')
                if len(parts) >= 2:
                    text = parts[1].strip()
            try:
                data = json.loads(text)
                # basic validation
                if not isinstance(data.get('buys', []), list) or not isinstance(data.get('sells', []), list):
                    return self._fallback_trending_stocks(avoid_symbols=avoid_symbols)
                return data
            except Exception:
                return self._fallback_trending_stocks(avoid_symbols=avoid_symbols)
        except Exception as e:
            print(f"⚠️  Error getting trending stocks: {e}")
            return self._fallback_trending_stocks(avoid_symbols=avoid_symbols)

    def _fallback_trending_stocks(self, avoid_symbols=None):
        import random
        avoid = set((avoid_symbols or []))
        # A small pool to create variety in fallback
        pool_buys = [
            {"symbol": "AAPL", "name": "Apple Inc.", "reason": "Strong ecosystem lock-in and recent product refresh sustain demand; services revenue continues to grow."},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "reason": "Cloud momentum and AI integration underpin steady revenue growth and operating leverage."},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "reason": "Leadership in AI accelerators and data center demand maintains elevated growth outlook."},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "reason": "Search and cloud resilience with ongoing AI monetization opportunities."},
            {"symbol": "AMZN", "name": "Amazon.com, Inc.", "reason": "Retail optimization and AWS growth support long-term margin expansion."}
        ]
        pool_sells = [
            {"symbol": "XYZ", "name": "XYZ Corp.", "reason": "Recent earnings miss and weak forward guidance suggest near-term pressure."},
            {"symbol": "ABC", "name": "ABC Inc.", "reason": "Deteriorating margins and rising competition could weigh on performance."},
            {"symbol": "DEF", "name": "DEF Co.", "reason": "Regulatory headwinds and execution risks increase uncertainty in the next quarter."},
            {"symbol": "GME", "name": "GameStop Corp.", "reason": "Volatility and uncertain fundamentals keep risks elevated."},
            {"symbol": "BBBYQ", "name": "Bed Bath & Beyond Inc.", "reason": "Bankruptcy-related risks overshadow near-term prospects."}
        ]

        def pick_three(pool):
            cand = [x for x in pool if x.get('symbol') not in avoid]
            random.shuffle(cand)
            out = cand[:3]
            if len(out) < 3:
                # fill any missing from original pool (may include avoided)
                extra = [x for x in pool if x not in out]
                random.shuffle(extra)
                out += extra[: 3 - len(out)]
            return out

        return {
            "buys": pick_three(pool_buys),
            "sells": pick_three(pool_sells),
            "disclaimer": "This content is for general informational purposes only and is not financial advice. Always do your own research."
        }

    def rate_stocks(self, stocks):
        """Ask Gemini to provide a buy/hold/sell verdict for a list of stocks.
        stocks: list of dicts with {symbol, name}
        Returns: {"ratings": [{symbol, name, verdict: "buy|hold|sell", reason}]}
        """
        try:
            if not self.model:
                return self._fallback_rate_stocks(stocks)
            # Build a compact, strict prompt for JSON output
            prompt = (
                "You are an objective market summarizer. For each US-listed common stock provided, "
                "return a concise classification: 'buy', 'hold', or 'sell' based on recent public news, momentum, earnings, or sentiment.\n"
                "Output ONLY a strict JSON object, no prose, with this schema:\n"
                "{\n  \"ratings\": [ { \"symbol\": \"AAPL\", \"name\": \"Apple Inc.\", \"verdict\": \"buy|hold|sell\", \"reason\": \"1 sentence\" }, ... ]\n}\n\n"
                f"Stocks: {json.dumps(stocks)}\n"
                "Constraints:\n- Keep each reason to one sentence.\n- No guarantees or price targets.\n- If uncertain, default to 'hold'."
            )
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                parts = text.split('```')
                if len(parts) >= 2:
                    text = parts[1].strip()
            try:
                data = json.loads(text)
                if not isinstance(data.get('ratings', []), list):
                    return self._fallback_rate_stocks(stocks)
                return data
            except Exception:
                return self._fallback_rate_stocks(stocks)
        except Exception as e:
            print(f"⚠️  Error rating stocks: {e}")
            return self._fallback_rate_stocks(stocks)

    def _fallback_rate_stocks(self, stocks):
        ratings = []
        for s in stocks or []:
            verdict = 'hold'
            reason = 'General information only. No current signal stands out.'
            ratings.append({
                'symbol': s.get('symbol'),
                'name': s.get('name'),
                'verdict': verdict,
                'reason': reason
            })
        return {'ratings': ratings}

    def recommend_credit_cards(self, transactions_list, approx_categories=None):
        """Return a ranked list of credit cards that best fit the user's spending.
        Input:
          - transactions_list: list of strings (transaction descriptions)
          - approx_categories: optional list like ["grocery", "dining", ...]
        Output JSON shape:
        {
          "cards": [
            {"name": "Card Name", "issuer": "Issuer", "rewards": ["% back ..."], "why": "short reason", "suitability": 0-100, "categoriesMatched": ["grocery", ...]},
            ...
          ],
          "disclaimer": "General information only..."
        }
        """
        try:
            if not self.model:
                return self._fallback_credit_cards(approx_categories)

            prompt = (
                "You are a neutral, factual summarizer. Analyze the user's recent spending descriptions "
                "and return ONLY a strict JSON object ranking 3-5 US consumer credit cards with rewards that match the user's patterns.\n"
                "Schema:\n"
                "{\n  \"cards\": [ { \"name\": \"...\", \"issuer\": \"...\", \"rewards\": [\"...\"], \"why\": \"1 sentence\", \"suitability\": 0-100, \"categoriesMatched\": [\"grocery\",\"dining\"] } ],\n  \"disclaimer\": \"Short disclaimer (general information, not financial advice).\"\n}\n\n"
                f"Spending descriptions (strings): {json.dumps(transactions_list[:50])}\n"
                f"Approx categories (optional): {json.dumps(approx_categories or [])}\n"
                "Constraints:\n"
                "- Base recommendations on commonly available rewards categories (grocery, dining, gas, travel, streaming, online).\n"
                "- No affiliate links. No guarantees. Keep 'why' to one sentence.\n"
                "- Use only US consumer cards.\n"
            )
            response = self.model.generate_content(prompt)
            text = (response.text or "").strip()
            if text.startswith('```'):
                parts = text.split('```')
                if len(parts) >= 2:
                    text = parts[1].strip()
            try:
                data = json.loads(text)
                if not isinstance(data.get('cards', []), list):
                    return self._fallback_credit_cards(approx_categories)
                return data
            except Exception:
                return self._fallback_credit_cards(approx_categories)
        except Exception as e:
            print(f"⚠️  Error recommending credit cards: {e}")
            return self._fallback_credit_cards(approx_categories)

    def _fallback_credit_cards(self, approx_categories=None):
        cats = [c.lower() for c in (approx_categories or [])]
        def match(*keys):
            return [k for k in keys if any(k in c for c in cats)] or list(keys)
        cards = [
            {
                "name": "Blue Cash Everyday",
                "issuer": "American Express",
                "rewards": ["3% back at U.S. supermarkets", "3% back on U.S. gas", "1% back other"],
                "why": "Strong everyday categories for groceries and gas.",
                "suitability": 82,
                "categoriesMatched": match("grocery", "gas")
            },
            {
                "name": "SavorOne",
                "issuer": "Capital One",
                "rewards": ["3% back dining", "3% back entertainment", "3% back popular streaming", "3% at grocery stores"],
                "why": "Well-rounded dining, entertainment, streaming, and grocery rewards.",
                "suitability": 80,
                "categoriesMatched": match("dining", "entertainment", "streaming", "grocery")
            },
            {
                "name": "Citi Custom Cash",
                "issuer": "Citi",
                "rewards": ["5% back on top eligible category (up to cap)", "1% back other"],
                "why": "Automatically adapts to your highest monthly category.",
                "suitability": 79,
                "categoriesMatched": match("dining", "gas", "grocery", "travel", "streaming")
            },
            {
                "name": "Discover it Cash Back",
                "issuer": "Discover",
                "rewards": ["5% rotating categories (activation)", "1% back other"],
                "why": "Quarterly rotating 5% categories can align with your spend.",
                "suitability": 75,
                "categoriesMatched": match("grocery", "gas", "online")
            }
        ]
        return {
            "cards": cards,
            "disclaimer": "General information only. Rewards vary by issuer and terms; always verify current offers. Not financial advice."
        }

