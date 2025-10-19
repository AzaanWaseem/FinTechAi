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

