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
            
            prompt = f"""You are a friendly, encouraging, and insightful financial coach. Your goal is to provide a single, short, actionable recommendation to a user based on their weekly spending summary. Be positive and avoid shaming language.

**User's Financial Context:**
- Monthly Savings Goal: ${goal}
- Total spent on 'Needs' this period: ${needs_total}
- Total spent on 'Wants' this period: ${wants_total}
- A detailed list of their 'Want' transactions is: {want_transactions_list}

**Your Task:**
Based on the context, provide one specific and actionable piece of advice.
- If 'Want' spending is high relative to their goal, identify the largest category of 'Want' spending (e.g., coffee, shopping, dining out) from the provided list and suggest a small, manageable change. For example, "I noticed a few coffee shop visits! Maybe try making coffee at home a couple of days next week to see how much you can save?"
- If they are on track to meet their goal, congratulate them and offer encouragement. For example, "You're doing a great job keeping your 'Want' spending in check! Keep up the fantastic work towards your ${goal} goal."
- Keep the recommendation to 2-3 sentences. Start with a friendly and positive tone."""

            response = self.model.generate_content(prompt)
            return response.text.strip()
            
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

