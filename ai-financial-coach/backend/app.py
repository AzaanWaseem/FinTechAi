from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from nessie_client import NessieClient
from gemini_client import GeminiClient
from mediastack_client import MediastackClient
from apscheduler.schedulers.background import BackgroundScheduler
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global session state for prototype
# In a production environment, this would be stored in a database per user
user_session_state = {
    "customer_id": None,        # Nessie API customer ID
    "account_id": None,         # Nessie API account ID  
    "savings_goal": 0,          # Monthly savings goal in dollars
    "monthly_budget": 0,        # Monthly budget in dollars
    "saved_stocks": []          # List of saved stocks: [{symbol, name}]
}
user_session_state.setdefault('removed_transactions', {})

# Initialize clients
nessie_client = NessieClient()
gemini_client = GeminiClient()
mediastack_client = MediastackClient()

def analyze_spending():
    """
    Analyze user spending patterns using AI categorization.
    
    Fetches transactions from Nessie API or uses mock data, categorizes them
    as 'Needs' vs 'Wants' using Gemini AI, and generates personalized
    financial recommendations.
    
    Returns:
        dict: Analysis results containing:
            - needsTotal: Total spending on needs
            - wantsTotal: Total spending on wants  
            - monthlyBudget: User's monthly budget
            - savingsGoal: User's savings goal
            - recommendation: AI-generated advice
            - categorizedTransactions: List of categorized transactions
    """
    try:
        account_id = user_session_state.get("account_id")
        savings_goal = user_session_state.get("savings_goal", 0)
        
        if not account_id:
            return {"error": "No account found. Please complete onboarding first."}
        
        # Get transactions (prefer Nessie; fall back to synthesized mock if Nessie unavailable
        transactions = []
        try:
            if nessie_client._test_api_connection():
                transactions = nessie_client.get_transactions(account_id)
            else:
                # Use synthesized mock transactions when Nessie is down/unreachable
                mock_base = [nessie_client._normalize_tx(tx, source='mock') for tx in nessie_client._get_mock_transactions()]
                transactions = mock_base
        except Exception:
            # Hard fallback to synthesized transactions if fetching failed
            mock_base = [nessie_client._normalize_tx(tx, source='mock') for tx in nessie_client._get_mock_transactions()]
            transactions = mock_base
        # Merge any in-memory mock transactions the user added via UI
        mock_tx = user_session_state.get('mock_transactions', {}).get(account_id, [])
        if mock_tx:
            # Ensure mock txs have id and source
            merged = []
            for m in mock_tx:
                if not isinstance(m, dict):
                    continue
                tx_id = m.get('id')
                if not tx_id:
                    import uuid as _uuid
                    tx_id = str(_uuid.uuid4())
                merged.append({
                    'id': tx_id,
                    'description': m.get('description', ''),
                    'amount': float(m.get('amount', 0)),
                    'source': m.get('source', 'added')
                })
            transactions = transactions + merged

        # Filter out any transactions the user removed/hidden
        removed_tx = user_session_state.get('removed_transactions', {}).get(account_id, [])
        if removed_tx:
            removed_ids = set([r for r in removed_tx if isinstance(r, str)])
            removed_pairs = [r for r in removed_tx if isinstance(r, dict)]

            def is_removed(tx):
                # If tx has an id and id is in removed_ids
                try:
                    if tx.get('id') and str(tx.get('id')) in removed_ids:
                        return True
                except:
                    pass
                # Fallback: match by description+amount for dict entries
                try:
                    tx_desc = (tx.get('description') or '').strip().lower()
                    tx_amount = float(tx.get('amount') or 0)
                except:
                    return False
                for r in removed_pairs:
                    try:
                        r_desc = (r.get('description') or '').strip().lower()
                        r_amount = float(r.get('amount') or 0)
                    except:
                        continue
                    if tx_desc == r_desc and tx_amount == r_amount:
                        return True
                return False

            transactions = [tx for tx in transactions if not is_removed(tx)]
        if not transactions:
            return {"error": "No transactions found."}
        
        # Format transaction descriptions for AI analysis
        transaction_descriptions = [tx.get('description', '') for tx in transactions]
        
        # Categorize transactions using Gemini
        categorized_result = gemini_client.categorize_transactions(transaction_descriptions)
        
        if not categorized_result or 'transactions' not in categorized_result:
            # Fallback categorization
            categorized_transactions = []
            for i, tx in enumerate(transactions):
                description = tx.get('description', '').lower()
                if any(word in description for word in ['grocery', 'food', 'gas', 'rent', 'utility', 'insurance', 'medical']):
                    category = 'Need'
                else:
                    category = 'Want'
                categorized_transactions.append({
                    'id': tx.get('id'),
                    'description': tx.get('description', ''),
                    'amount': tx.get('amount', 0),
                    'category': category
                })
        else:
            # Use AI categorization
            categorized_transactions = []
            for i, tx in enumerate(transactions):
                if i < len(categorized_result['transactions']):
                    category = categorized_result['transactions'][i]
                else:
                    category = 'Want'  # Default fallback
                categorized_transactions.append({
                    'id': tx.get('id'),
                    'description': tx.get('description', ''),
                    'amount': tx.get('amount', 0),
                    'category': category
                })
        
        # Calculate totals
        needs_total = sum(tx['amount'] for tx in categorized_transactions if tx['category'] == 'Need')
        wants_total = sum(tx['amount'] for tx in categorized_transactions if tx['category'] == 'Want')

        # Get AI recommendation
        # Provide detailed want transactions (description + amount) so AI can make
        # transaction-specific suggestions.
        want_transactions = [f"{tx.get('description','')} (${tx.get('amount',0):.2f})" for tx in categorized_transactions if tx['category'] == 'Want']
        recommendation = gemini_client.get_recommendation(needs_total, wants_total, savings_goal, want_transactions)

        if not recommendation:
            # Fallback recommendation
            if wants_total > savings_goal * 0.5:
                recommendation = f"Consider reducing your 'Want' spending of ${wants_total:.2f} to better meet your ${savings_goal} savings goal!"
            else:
                recommendation = f"Great job! You're on track with your ${savings_goal} savings goal. Keep it up!"

        return {
            "needsTotal": needs_total,
            "wantsTotal": wants_total,
            "totalSpending": needs_total + wants_total,
            "monthlyBudget": user_session_state.get("monthly_budget", 0),
            "savingsGoal": savings_goal,
            "recommendation": recommendation,
            "categorizedTransactions": categorized_transactions
        }
        
        
    except Exception as e:
        logger.error(f"Error in analyze_spending: {e}")
        return {"error": "Analysis failed. Please try again."}

@app.route('/api/onboard', methods=['POST'])
def onboard():
    """Create a new customer and account, seed with transactions"""
    try:
        # Quick pre-checks for helpful errors: API key present and Nessie reachable
        if not getattr(nessie_client, 'api_key', None):
            return jsonify({"error": "Nessie API key is not configured. Copy backend/env_template.txt to .env and add NESSIE_API_KEY."}), 400

        # Attempt to use Nessie; if unreachable, fall back to mock onboarding so users can continue
        use_mock = False
        try:
            if not nessie_client._test_api_connection():
                use_mock = True
        except Exception:
            use_mock = True

        if use_mock:
            # Create a mock customer/account and seed in-memory transactions so the app works offline
            try:
                customer_id, account_id = nessie_client._create_mock_customer_and_account()
            except Exception:
                # very defensive: ensure ids exist
                customer_id, account_id = ("mock_customer", "mock_account")
            user_session_state["customer_id"] = customer_id
            user_session_state["account_id"] = account_id
            # seed synthesized transactions into the in-memory store for this account
            try:
                synth = [nessie_client._normalize_tx(tx, source='mock') for tx in nessie_client._get_mock_transactions()]
                user_session_state.setdefault('mock_transactions', {})
                user_session_state['mock_transactions'][account_id] = synth
            except Exception as e:
                logger.error(f"Error generating mock transactions: {e}")
            return jsonify({
                "customerId": customer_id,
                "accountId": account_id,
                "warning": "Using mock data because Nessie API is unreachable."
            }), 200

        # Real Nessie path
        customer_id, account_id = nessie_client.create_customer_and_account()

        if customer_id and account_id:
            user_session_state["customer_id"] = customer_id
            user_session_state["account_id"] = account_id
            try:
                nessie_client.seed_transactions(account_id)
            except Exception as e:
                logger.error(f"Error during seeding: {e}")
                # still return customer/account so user can proceed, but warn
                return jsonify({"customerId": customer_id, "accountId": account_id, "warning": "Account created but seeding transactions failed."}), 200

            return jsonify({
                "customerId": customer_id,
                "accountId": account_id
            })
        else:
            return jsonify({"error": "Failed to create account"}), 500

    except Exception as e:
        logger.error(f"Error in onboard: {e}")
        # return the exception message to help debugging in dev environments
        return jsonify({"error": f"Failed to create your financial account: {str(e)}"}), 500

@app.route('/api/set-goal', methods=['POST'])
def set_goal():
    """Set the user's monthly savings goal and budget"""
    try:
        data = request.get_json()
        goal = data.get('goal', 0)
        budget = data.get('budget', 0)
        
        if goal <= 0:
            return jsonify({"error": "Goal must be greater than 0"}), 400
        
        if budget <= 0:
            return jsonify({"error": "Budget must be greater than 0"}), 400
            
        if goal > budget:
            return jsonify({"error": "Savings goal cannot be greater than budget"}), 400
        
        user_session_state["savings_goal"] = goal
        user_session_state["monthly_budget"] = budget
        return jsonify({
            "status": "success",
            "goalSet": goal,
            "budgetSet": budget
        })
        
    except Exception as e:
        print(f"Error in set_goal: {e}")
        return jsonify({"error": "Failed to set goal"}), 500

@app.route('/api/analysis', methods=['GET'])
def analysis():
    """Get spending analysis and recommendations"""
    try:
        result = analyze_spending()
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in analysis: {e}")
        return jsonify({"error": "Analysis failed"}), 500

@app.route('/api/investment-idea', methods=['GET'])
def investment_idea():
    """Get investment education if savings goal is met"""
    try:
        savings_goal = user_session_state.get("savings_goal", 0)
        
        # Get current analysis to check if goal is met
        analysis_result = analyze_spending()
        if "error" in analysis_result:
            return jsonify(analysis_result), 400
        
        wants_total = analysis_result.get("wantsTotal", 0)
        
        # Check if goal is met (simplified: if wants spending is less than half the goal)
        if wants_total <= savings_goal * 0.5:
            investment_concept = gemini_client.get_investment_concept(savings_goal)
            return jsonify(investment_concept)
        else:
            return jsonify({
                "title": "Keep Saving!",
                "explanation": f"You're making progress toward your ${savings_goal} goal. Keep up the good work!"
            })
            
    except Exception as e:
        print(f"Error in investment_idea: {e}")
        return jsonify({"error": "Failed to get investment idea"}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "AI Financial Coach API is running"})


@app.route('/api/nessie-health', methods=['GET'])
def nessie_health():
    """Check Nessie API key and connectivity"""
    try:
        if not getattr(nessie_client, 'api_key', None):
            return jsonify({"status": "error", "message": "NESSIE_API_KEY not set in backend .env"}), 400
        ok = False
        try:
            ok = nessie_client._test_api_connection()
        except Exception as e:
            return jsonify({"status": "error", "message": f"Connectivity test failed: {str(e)}"}), 502

        if ok:
            return jsonify({"status": "ok", "message": "Nessie reachable"})
        else:
            return jsonify({"status": "error", "message": "Nessie API not reachable"}), 502
    except Exception as e:
        return jsonify({"status": "error", "message": f"Unexpected error: {str(e)}"}), 500


@app.route('/api/seed-transactions', methods=['POST'])
def seed_transactions():
    """Seed mock transactions for the current account"""
    try:
        account_id = user_session_state.get("account_id")
        if not account_id:
            return jsonify({"error": "No account found. Please complete onboarding first."}), 400
        try:
            # If Nessie is reachable, seed via API; otherwise, seed local in-memory list
            if nessie_client._test_api_connection():
                nessie_client.seed_transactions(account_id)
            else:
                synth = [nessie_client._normalize_tx(tx, source='mock') for tx in nessie_client._get_mock_transactions()]
                user_session_state.setdefault('mock_transactions', {})
                user_session_state['mock_transactions'][account_id] = synth
            return jsonify({"status": "success", "message": "Transactions seeded"})
        except Exception as e:
            print(f"Error seeding transactions: {e}")
            return jsonify({"error": "Failed to seed transactions"}), 500
    except Exception as e:
        print(f"Error seeding transactions: {e}")
        return jsonify({"error": "Failed to seed transactions"}), 500


@app.route('/api/stocks-trending', methods=['GET'])
def stocks_trending():
    """Get 3 trending buy and 3 sell stock ideas with descriptions via Gemini.
    Supports optional refresh parameters:
      - avoid: comma-separated symbols to avoid repeating
      - seed: arbitrary string/number to inject into prompt for variety
      - temperature: float to increase diversity
    This is general information, not financial advice.
    """
    try:
        avoid = request.args.get('avoid', '')
        avoid_symbols = [s.strip().upper() for s in avoid.split(',') if s.strip()] if avoid else []
        seed = request.args.get('seed', None)
        temperature = request.args.get('temperature', None)
        reset_history = str(request.args.get('reset', 'false')).lower() in ('1', 'true', 'yes')
        temp_val = None
        try:
            if temperature is not None:
                temp_val = float(temperature)
        except Exception:
            temp_val = None

        # Maintain a history of shown symbols to strongly avoid repeats
        if reset_history:
            user_session_state['trending_history'] = {'seen': []}
        hist = user_session_state.get('trending_history', {'seen': []})
        seen_list = hist.get('seen') or []
        seen_set = set([str(s).upper() for s in seen_list])

        # Also avoid the immediately previous set
        last = user_session_state.get('last_trending', {"buys": [], "sells": []})
        last_symbols = [s.get('symbol') for s in (last.get('buys') or [])] + [s.get('symbol') for s in (last.get('sells') or [])]
        last_symbols = [str(s or '').upper() for s in last_symbols if s]

        # Build merged avoidance list (provided avoid + last + seen history)
        merged_avoid = sorted(set((avoid_symbols or []) + last_symbols + list(seen_set))) or None

        import time as _time

        def to_upper_list(items):
            return [str(x or '').upper() for x in items if x]

        # Attempt multiple times to gather unseen candidates
        buys_pool = []
        sells_pool = []
        max_attempts = 4
        base_temp = temp_val if temp_val is not None else 0.95
        current_avoid = set(merged_avoid or [])
        for i in range(max_attempts):
            s = seed if i == 0 and seed is not None else f"{seed or 'seed'}-{_time.time_ns()}-{i}"
            t = min(1.0, base_temp + i * 0.02)
            data_try = gemini_client.get_trending_stocks(
                avoid_symbols=sorted(current_avoid) if current_avoid else None,
                seed=s,
                temperature=t
            )
            try:
                new_buys = [it for it in (data_try.get('buys') or []) if str((it.get('symbol') or '')).upper() not in seen_set]
                new_sells = [it for it in (data_try.get('sells') or []) if str((it.get('symbol') or '')).upper() not in seen_set]
            except Exception:
                new_buys, new_sells = [], []
            # Append unseen first
            buys_pool.extend(new_buys)
            sells_pool.extend(new_sells)
            # Expand avoid with everything we just saw to push variety
            try:
                current_avoid.update(to_upper_list([x.get('symbol') for x in (data_try.get('buys') or [])]))
                current_avoid.update(to_upper_list([x.get('symbol') for x in (data_try.get('sells') or [])]))
            except Exception:
                pass
            # Early exit if we already have enough unseen
            if len(buys_pool) >= 3 and len(sells_pool) >= 3:
                break

        # Deduplicate while preserving order
        def dedupe(items):
            seen_local = set()
            out = []
            for it in items:
                key = str((it.get('symbol') or '')).upper()
                if key and key not in seen_local:
                    out.append(it)
                    seen_local.add(key)
            return out

        buys_pool = dedupe(buys_pool)
        sells_pool = dedupe(sells_pool)

        # If still not enough unseen, try a final Gemini call and then fallback pool respecting avoid
        if len(buys_pool) < 3 or len(sells_pool) < 3:
            extra = gemini_client.get_trending_stocks(
                avoid_symbols=sorted(current_avoid) if current_avoid else None,
                seed=f"final-{_time.time_ns()}",
                temperature=1.0
            )
            try:
                buys_pool.extend([it for it in (extra.get('buys') or []) if str((it.get('symbol') or '')).upper() not in seen_set])
                sells_pool.extend([it for it in (extra.get('sells') or []) if str((it.get('symbol') or '')).upper() not in seen_set])
            except Exception:
                pass
            buys_pool = dedupe(buys_pool)
            sells_pool = dedupe(sells_pool)
        if len(buys_pool) < 3 or len(sells_pool) < 3:
            fb = gemini_client._fallback_trending_stocks(avoid_symbols=sorted(current_avoid) if current_avoid else None)
            try:
                buys_pool.extend(fb.get('buys', []))
                sells_pool.extend(fb.get('sells', []))
            except Exception:
                pass
            buys_pool = dedupe(buys_pool)
            sells_pool = dedupe(sells_pool)

        # Final selection: first 3 of each
        buys_out = buys_pool[:3] if len(buys_pool) >= 3 else (buys_pool + (last.get('buys') or []))[:3]
        sells_out = sells_pool[:3] if len(sells_pool) >= 3 else (sells_pool + (last.get('sells') or []))[:3]

        data = {
            'buys': buys_out,
            'sells': sells_out,
            'disclaimer': (last.get('disclaimer') if isinstance(last, dict) else None) or 'This content is for general informational purposes only and is not financial advice.'
        }

        # Persist current as last and update history
        try:
            user_session_state['last_trending'] = {'buys': buys_out[:], 'sells': sells_out[:]}
            new_seen = list(seen_set)
            for it in buys_out + sells_out:
                sym = str((it.get('symbol') or '')).upper()
                if sym and sym not in new_seen:
                    new_seen.append(sym)
            user_session_state['trending_history'] = {'seen': new_seen}
        except Exception:
            pass

        return jsonify(data)
    except Exception as e:
        print(f"Error in stocks_trending: {e}")
        return jsonify({
            "buys": [],
            "sells": [],
            "disclaimer": "Unable to retrieve ideas right now. Try again later."
        }), 500


@app.route('/api/stocks/save', methods=['POST'])
def save_stocks():
    """Save selected stocks (from buys/sells) into session for the user."""
    try:
        data = request.get_json() or {}
        items = data.get('stocks', [])
        if not isinstance(items, list):
            return jsonify({"error": "stocks must be a list"}), 400
        # Deduplicate by symbol
        existing = {s.get('symbol') for s in user_session_state.get('saved_stocks', [])}
        for it in items:
            sym = (it.get('symbol') or '').upper()
            name = it.get('name') or sym
            if sym and sym not in existing:
                user_session_state['saved_stocks'].append({'symbol': sym, 'name': name})
                existing.add(sym)
        return jsonify({"status": "saved", "count": len(user_session_state['saved_stocks'])})
    except Exception as e:
        print(f"Error in save_stocks: {e}")
        return jsonify({"error": "Failed to save stocks"}), 500


@app.route('/api/stocks/saved', methods=['GET'])
def get_saved_stocks():
    """Return saved stocks along with a buy/hold/sell verdict from Gemini."""
    try:
        saved = user_session_state.get('saved_stocks', [])
        ratings = gemini_client.rate_stocks(saved)
        ratings_list = ratings.get('ratings', [])
        saved_by_sym = {(s.get('symbol') or '').upper(): s for s in saved}
        # Enrich reasons using Mediastack headlines where possible
        enriched = []
        try:
            for r in ratings_list:
                sym = (r.get('symbol') or '').upper()
                name = (saved_by_sym.get(sym, {}).get('name')) or r.get('name') or sym
                reason = r.get('reason') or ''
                news_reason = mediastack_client.get_reason_for_stock(sym, name)
                if news_reason:
                    # Attach the news headline as an addendum for transparency
                    if reason:
                        reason = f"{reason} — {news_reason}"
                    else:
                        reason = news_reason
                enriched.append({**r, 'reason': reason})
        except Exception:
            # If anything fails, fall back to original ratings
            enriched = ratings_list

        return jsonify({'saved': saved, 'ratings': enriched})
    except Exception as e:
        print(f"Error in get_saved_stocks: {e}")
        return jsonify({'saved': [], 'ratings': []}), 500


@app.route('/api/credit-cards', methods=['GET'])
def recommend_credit_cards():
    """Recommend top credit cards based on user's spending (uses Gemini with safe fallback)."""
    try:
        # Reuse current analysis to derive categories and recent transaction descriptions
        analysis_result = analyze_spending()
        if 'error' in analysis_result:
            # proceed with minimal info if possible
            tx_desc = []
            cats = []
        else:
            txs = analysis_result.get('categorizedTransactions', [])
            # favor wants/needs categories to infer rewards usefulness
            tx_desc = [t.get('description', '') for t in txs[-40:]]  # last 40 for relevance
            # approximate categories present
            cats = list({(t.get('category') or '').lower() for t in txs if t.get('category')})

        data = gemini_client.recommend_credit_cards(tx_desc, approx_categories=cats)
        return jsonify(data)
    except Exception as e:
        print(f"Error in recommend_credit_cards: {e}")
        return jsonify({
            "cards": [],
            "disclaimer": "Unable to retrieve recommendations right now. Try again later."
        }), 500


@app.route('/api/add-transaction', methods=['POST'])
def add_transaction():
    """Add a single mock transaction to the in-memory store for the account"""
    try:
        data = request.get_json() or {}
        description = data.get('description')
        amount = data.get('amount')

        if not description or amount is None:
            return jsonify({"error": "description and amount are required"}), 400

        account_id = user_session_state.get('account_id')

        # ensure amount is numeric
        try:
            amount = float(amount)
        except:
            return jsonify({"error": "Invalid amount"}), 400

        # If there's no Nessie account yet, fall back to an in-memory store so users
        # can add transactions (useful during onboarding or when Nessie is unreachable)
        if not account_id:
            import uuid as _uuid
            mock_tx = {
                'id': str(_uuid.uuid4()),
                'description': description,
                'amount': amount,
                'source': 'local'
            }
            user_session_state.setdefault('mock_transactions', {})
            user_session_state['mock_transactions'].setdefault('local', [])
            user_session_state['mock_transactions']['local'].append(mock_tx)
            return jsonify({"status": "success", "transaction": mock_tx})

        # Attempt to create transaction in Nessie for persistence
        try:
            created = nessie_client.create_transaction(account_id, {"description": description, "amount": amount})
        except Exception as e:
            created = None

        # If Nessie creation failed, fall back to in-memory for this account
        if not created:
            import uuid as _uuid
            mock_tx = {
                'id': str(_uuid.uuid4()),
                'description': description,
                'amount': amount,
                'source': 'local'
            }
            user_session_state.setdefault('mock_transactions', {})
            user_session_state['mock_transactions'].setdefault(account_id, [])
            user_session_state['mock_transactions'][account_id].append(mock_tx)
            return jsonify({"status": "success", "transaction": mock_tx})

        return jsonify({"status": "success", "transaction": created})
    except Exception as e:
        print(f"Error in add_transaction: {e}")
        return jsonify({"error": "Failed to add transaction"}), 500


@app.route('/api/remove-transaction', methods=['POST'])
def remove_transaction():
    """Mark a transaction as removed/hidden in the in-memory store for the account"""
    try:
        data = request.get_json() or {}
        tx_id = data.get('id')
        if not tx_id:
            return jsonify({"error": "id is required for removal"}), 400

        account_id = user_session_state.get('account_id')
        # If no account exists, try to remove from the local mock store
        if not account_id:
            local_list = user_session_state.get('mock_transactions', {}).get('local', [])
            before = len(local_list)
            local_list = [t for t in local_list if str(t.get('id')) != str(tx_id)]
            user_session_state.setdefault('mock_transactions', {})['local'] = local_list
            if len(local_list) < before:
                return jsonify({"status": "success", "removed": {"id": tx_id}})
            else:
                # mark as removed for safety
                user_session_state.setdefault('removed_transactions', {}).setdefault('local', []).append(str(tx_id))
                return jsonify({"status": "success", "removed": {"id": tx_id}})

        # Try to delete from Nessie; if it fails, fall back to marking removed in memory
        try:
            try:
                success = nessie_client.delete_transaction(account_id, tx_id)
            except Exception:
                success = False

            if success:
                return jsonify({"status": "success", "removed": {"id": tx_id}})

            # Fallback: remove from mock_transactions for this account if present
            acct_list = user_session_state.get('mock_transactions', {}).get(account_id, [])
            before = len(acct_list)
            acct_list = [t for t in acct_list if str(t.get('id')) != str(tx_id)]
            user_session_state.setdefault('mock_transactions', {})[account_id] = acct_list
            if len(acct_list) < before:
                return jsonify({"status": "success", "removed": {"id": tx_id}})

            # Otherwise mark id as removed so analysis will filter it
            user_session_state.setdefault('removed_transactions', {}).setdefault(account_id, []).append(str(tx_id))
            return jsonify({"status": "success", "removed": {"id": tx_id}})
        except Exception as e:
            print(f"Error deleting transaction: {e}")
            return jsonify({"error": "Failed to delete transaction"}), 500
    except Exception as e:
        print(f"Error in remove_transaction: {e}")
        return jsonify({"error": "Failed to remove transaction"}), 500

def run_scheduled_analysis():
    """Scheduled function to run analysis and send notifications"""
    try:
        result = analyze_spending()
        if "error" not in result:
            print(f"📊 Weekly Analysis Complete:")
            print(f"   Needs: ${result.get('needsTotal', 0):.2f}")
            print(f"   Wants: ${result.get('wantsTotal', 0):.2f}")
            print(f"   Recommendation: {result.get('recommendation', 'N/A')}")
        else:
            print(f"❌ Analysis failed: {result.get('error')}")
    except Exception as e:
        print(f"❌ Scheduled analysis error: {e}")

# Configure scheduler (start only once; avoid double-start with Flask reloader)
scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(run_scheduled_analysis, 'interval', days=7)

if __name__ == '__main__':
    print("🚀 Starting AI Financial Coach Backend...")
    print("📊 Scheduler configured for weekly analysis")
    print("🔑 Make sure to set NESSIE_API_KEY and GEMINI_API_KEY in .env file")
    try:
        if not scheduler.running:
            scheduler.start()
    except Exception as e:
        print(f"⚠️  Scheduler start skipped: {e}")
    # Disable the debug reloader to avoid double imports that can re-start the scheduler
    app.run(debug=True, port=5002, use_reloader=False)