import requests
import json
import os
import uuid
from dotenv import load_dotenv

load_dotenv()


class NessieClient:
    def __init__(self):
        self.api_key = os.getenv('NESSIE_API_KEY')
        self.base_url = 'http://api.nessieisreal.com'
        
    def _test_api_connection(self):
        """Test if the Nessie API is accessible"""
        try:
            response = requests.get(f"{self.base_url}/customers?key={self.api_key}", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def create_customer_and_account(self):
        """Create a new customer and checking account"""
        try:
            # Test API connection first
            if not self._test_api_connection():
                raise RuntimeError("Nessie API not accessible")
            
            # Create customer
            customer_data = {
                "first_name": "Demo",
                "last_name": "User",
                "address": {
                    "street_number": "123",
                    "street_name": "Demo Street",
                    "city": "Austin",
                    "state": "TX",
                    "zip": "78701"
                }
            }
            
            customer_response = requests.post(
                f"{self.base_url}/customers?key={self.api_key}",
                json=customer_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if customer_response.status_code != 201:
                raise RuntimeError(f"Nessie customer creation failed: {customer_response.status_code}")
            
            customer_id = customer_response.json().get('objectCreated', {}).get('_id')
            
            # Create checking account
            account_data = {
                "type": "Checking",
                "nickname": "Main Checking",
                "rewards": 0,
                "balance": 1000
            }
            
            account_response = requests.post(
                f"{self.base_url}/customers/{customer_id}/accounts?key={self.api_key}",
                json=account_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if account_response.status_code != 201:
                raise RuntimeError(f"Nessie account creation failed: {account_response.status_code}")
            
            account_id = account_response.json().get('objectCreated', {}).get('_id')
            
            return customer_id, account_id
            
        except Exception as e:
            print(f"⚠️  Error creating customer/account: {e}")
            raise
    
    def _create_mock_customer_and_account(self):
        """Create mock customer and account data"""
        import random
        customer_id = f"mock_customer_{random.randint(100000, 999999)}"
        account_id = f"mock_account_{random.randint(100000, 999999)}"
        return customer_id, account_id
    
    def seed_transactions(self, account_id):
        """Seed the account with sample transactions"""
        try:
            # Test API connection first
            if not self._test_api_connection():
                raise RuntimeError("Nessie API not accessible for seeding")
            
            # Get valid merchant IDs first
            merchants_response = requests.get(f"{self.base_url}/merchants?key={self.api_key}")
            valid_merchants = []
            if merchants_response.status_code == 200:
                merchants = merchants_response.json()
                valid_merchants = [m.get('_id') for m in merchants[:10] if m.get('_id')]
            
            # Sample transactions with realistic data
            sample_transactions = [
                {"merchant_id": valid_merchants[0] if valid_merchants else "merchant_1", "medium": "balance", "amount": 1200, "description": "HEB Grocery Store"},
                {"merchant_id": valid_merchants[1] if len(valid_merchants) > 1 else "merchant_2", "medium": "balance", "amount": 45, "description": "Starbucks Coffee"},
                {"merchant_id": valid_merchants[2] if len(valid_merchants) > 2 else "merchant_3", "medium": "balance", "amount": 85, "description": "Shell Gas Station"},
                {"merchant_id": valid_merchants[3] if len(valid_merchants) > 3 else "merchant_4", "medium": "balance", "amount": 1200, "description": "Austin Energy Bill"},
                {"merchant_id": valid_merchants[4] if len(valid_merchants) > 4 else "merchant_5", "medium": "balance", "amount": 65, "description": "Target Shopping"},
                {"merchant_id": valid_merchants[5] if len(valid_merchants) > 5 else "merchant_6", "medium": "balance", "amount": 25, "description": "Netflix Subscription"},
                {"merchant_id": valid_merchants[6] if len(valid_merchants) > 6 else "merchant_7", "medium": "balance", "amount": 150, "description": "Whole Foods Market"},
                {"merchant_id": valid_merchants[7] if len(valid_merchants) > 7 else "merchant_8", "medium": "balance", "amount": 35, "description": "Chipotle Mexican Grill"},
                {"merchant_id": valid_merchants[8] if len(valid_merchants) > 8 else "merchant_9", "medium": "balance", "amount": 200, "description": "AT&T Mobile Bill"},
                {"merchant_id": valid_merchants[9] if len(valid_merchants) > 9 else "merchant_10", "medium": "balance", "amount": 75, "description": "AMC Theaters"},
                {"merchant_id": valid_merchants[0] if valid_merchants else "merchant_1", "medium": "balance", "amount": 90, "description": "CVS Pharmacy"},
                {"merchant_id": valid_merchants[1] if len(valid_merchants) > 1 else "merchant_2", "medium": "balance", "amount": 40, "description": "Dunkin Donuts"},
                {"merchant_id": valid_merchants[2] if len(valid_merchants) > 2 else "merchant_3", "medium": "balance", "amount": 300, "description": "Rent Payment"},
                {"merchant_id": valid_merchants[3] if len(valid_merchants) > 3 else "merchant_4", "medium": "balance", "amount": 55, "description": "Uber Ride"},
                {"merchant_id": valid_merchants[4] if len(valid_merchants) > 4 else "merchant_5", "medium": "balance", "amount": 120, "description": "Walmart Supercenter"},
                {"merchant_id": valid_merchants[5] if len(valid_merchants) > 5 else "merchant_6", "medium": "balance", "amount": 15, "description": "Spotify Premium"},
                {"merchant_id": valid_merchants[6] if len(valid_merchants) > 6 else "merchant_7", "medium": "balance", "amount": 180, "description": "Costco Wholesale"},
                {"merchant_id": valid_merchants[7] if len(valid_merchants) > 7 else "merchant_8", "medium": "balance", "amount": 30, "description": "McDonald's"},
                {"merchant_id": valid_merchants[8] if len(valid_merchants) > 8 else "merchant_9", "medium": "balance", "amount": 250, "description": "Car Insurance Payment"},
                {"merchant_id": valid_merchants[9] if len(valid_merchants) > 9 else "merchant_10", "medium": "balance", "amount": 50, "description": "Amazon Prime"},
                {"merchant_id": valid_merchants[0] if valid_merchants else "merchant_1", "medium": "balance", "amount": 95, "description": "Trader Joe's"},
                {"merchant_id": valid_merchants[1] if len(valid_merchants) > 1 else "merchant_2", "medium": "balance", "amount": 20, "description": "Subway"},
                {"merchant_id": valid_merchants[2] if len(valid_merchants) > 2 else "merchant_3", "medium": "balance", "amount": 110, "description": "Chevron Gas Station"},
                {"merchant_id": valid_merchants[3] if len(valid_merchants) > 3 else "merchant_4", "medium": "balance", "amount": 70, "description": "Zara Clothing"},
                {"merchant_id": valid_merchants[4] if len(valid_merchants) > 4 else "merchant_5", "medium": "balance", "amount": 160, "description": "Kroger Grocery"},
                {"merchant_id": valid_merchants[5] if len(valid_merchants) > 5 else "merchant_6", "medium": "balance", "amount": 12, "description": "Hulu Subscription"},
                {"merchant_id": valid_merchants[6] if len(valid_merchants) > 6 else "merchant_7", "medium": "balance", "amount": 140, "description": "Safeway Grocery"},
                {"merchant_id": valid_merchants[7] if len(valid_merchants) > 7 else "merchant_8", "medium": "balance", "amount": 28, "description": "Pizza Hut"},
                {"merchant_id": valid_merchants[8] if len(valid_merchants) > 8 else "merchant_9", "medium": "balance", "amount": 220, "description": "Health Insurance"},
                {"merchant_id": valid_merchants[9] if len(valid_merchants) > 9 else "merchant_10", "medium": "balance", "amount": 60, "description": "Regal Cinemas"},
                {"merchant_id": valid_merchants[0] if valid_merchants else "merchant_1", "medium": "balance", "amount": 105, "description": "Sprouts Farmers Market"},
                {"merchant_id": valid_merchants[1] if len(valid_merchants) > 1 else "merchant_2", "medium": "balance", "amount": 18, "description": "Taco Bell"},
                {"merchant_id": valid_merchants[2] if len(valid_merchants) > 2 else "merchant_3", "medium": "balance", "amount": 80, "description": "Exxon Gas Station"},
                {"merchant_id": valid_merchants[3] if len(valid_merchants) > 3 else "merchant_4", "medium": "balance", "amount": 45, "description": "H&M Clothing"},
                {"merchant_id": valid_merchants[4] if len(valid_merchants) > 4 else "merchant_5", "medium": "balance", "amount": 130, "description": "Publix Supermarket"},
                {"merchant_id": valid_merchants[5] if len(valid_merchants) > 5 else "merchant_6", "medium": "balance", "amount": 8, "description": "Apple Music"},
                {"merchant_id": valid_merchants[6] if len(valid_merchants) > 6 else "merchant_7", "medium": "balance", "amount": 170, "description": "Albertsons Grocery"},
                {"merchant_id": valid_merchants[7] if len(valid_merchants) > 7 else "merchant_8", "medium": "balance", "amount": 35, "description": "KFC"},
                {"merchant_id": valid_merchants[8] if len(valid_merchants) > 8 else "merchant_9", "medium": "balance", "amount": 190, "description": "Life Insurance"},
                {"merchant_id": valid_merchants[9] if len(valid_merchants) > 9 else "merchant_10", "medium": "balance", "amount": 42, "description": "Cinemark Theaters"},
                {"merchant_id": valid_merchants[0] if valid_merchants else "merchant_1", "medium": "balance", "amount": 115, "description": "Food Lion Grocery"},
                {"merchant_id": valid_merchants[1] if len(valid_merchants) > 1 else "merchant_2", "medium": "balance", "amount": 22, "description": "Burger King"},
                {"merchant_id": valid_merchants[2] if len(valid_merchants) > 2 else "merchant_3", "medium": "balance", "amount": 75, "description": "BP Gas Station"},
                {"merchant_id": valid_merchants[3] if len(valid_merchants) > 3 else "merchant_4", "medium": "balance", "amount": 38, "description": "Forever 21"},
                {"merchant_id": valid_merchants[4] if len(valid_merchants) > 4 else "merchant_5", "medium": "balance", "amount": 125, "description": "Giant Eagle Grocery"},
                {"merchant_id": valid_merchants[5] if len(valid_merchants) > 5 else "merchant_6", "medium": "balance", "amount": 14, "description": "Disney+ Subscription"},
                {"merchant_id": valid_merchants[6] if len(valid_merchants) > 6 else "merchant_7", "medium": "balance", "amount": 155, "description": "Wegmans Grocery"},
                {"merchant_id": valid_merchants[7] if len(valid_merchants) > 7 else "merchant_8", "medium": "balance", "amount": 32, "description": "Wendy's"},
                {"merchant_id": valid_merchants[8] if len(valid_merchants) > 8 else "merchant_9", "medium": "balance", "amount": 210, "description": "Dental Insurance"},
                {"merchant_id": valid_merchants[9] if len(valid_merchants) > 9 else "merchant_10", "medium": "balance", "amount": 48, "description": "Marcus Theaters"},
                {"merchant_id": valid_merchants[0] if valid_merchants else "merchant_1", "medium": "balance", "amount": 100, "description": "Harris Teeter Grocery"},
                {"merchant_id": valid_merchants[1] if len(valid_merchants) > 1 else "merchant_2", "medium": "balance", "amount": 26, "description": "Arby's"},
                {"merchant_id": valid_merchants[2] if len(valid_merchants) > 2 else "merchant_3", "medium": "balance", "amount": 85, "description": "Mobil Gas Station"},
                {"merchant_id": valid_merchants[3] if len(valid_merchants) > 3 else "merchant_4", "medium": "balance", "amount": 52, "description": "Gap Clothing"},
                {"merchant_id": valid_merchants[4] if len(valid_merchants) > 4 else "merchant_5", "medium": "balance", "amount": 135, "description": "Stop & Shop Grocery"},
                {"merchant_id": valid_merchants[5] if len(valid_merchants) > 5 else "merchant_6", "medium": "balance", "amount": 16, "description": "HBO Max Subscription"},
                {"merchant_id": valid_merchants[6] if len(valid_merchants) > 6 else "merchant_7", "medium": "balance", "amount": 145, "description": "King Soopers Grocery"},
                {"merchant_id": valid_merchants[7] if len(valid_merchants) > 7 else "merchant_8", "medium": "balance", "amount": 29, "description": "Popeyes"},
                {"merchant_id": valid_merchants[8] if len(valid_merchants) > 8 else "merchant_9", "medium": "balance", "amount": 175, "description": "Vision Insurance"},
                {"merchant_id": valid_merchants[9] if len(valid_merchants) > 9 else "merchant_10", "medium": "balance", "amount": 55, "description": "AMC Dine-In Theaters"}
            ]
            
            # Create transactions
            for transaction in sample_transactions:
                response = requests.post(
                    f"{self.base_url}/accounts/{account_id}/purchases?key={self.api_key}",
                    json=transaction,
                    headers={'Content-Type': 'application/json'}
                )
                if response.status_code != 201:
                    raise RuntimeError(f"Transaction creation failed: {response.status_code}")
            print(f"✅ Seeded {len(sample_transactions)} transactions")
            
        except Exception as e:
            print(f"⚠️  Error seeding transactions: {e}")
    
    def get_transactions(self, account_id):
        """Get all transactions for an account"""
        try:
            # Test API connection first
            if not self._test_api_connection():
                raise RuntimeError("Nessie API not accessible for fetching transactions")
            
            response = requests.get(f"{self.base_url}/accounts/{account_id}/purchases?key={self.api_key}")
            
            if response.status_code != 200:
                raise RuntimeError(f"Failed to get transactions: {response.status_code}")
            
            transactions = response.json()
            if not transactions:
                return []
            # Normalize Nessie transactions to a simple shape with id, description, amount
            normalized = [self._normalize_tx(tx, source='nessie') for tx in transactions]
            return normalized
            
        except Exception as e:
            print(f"⚠️  Error getting transactions: {e}")
            raise

    def delete_transaction(self, account_id, purchase_id):
        """Delete a purchase by its ID if supported by Nessie"""
        try:
            if not self._test_api_connection():
                raise RuntimeError("Nessie API not accessible for deletion")
            response = requests.delete(f"{self.base_url}/accounts/{account_id}/purchases/{purchase_id}?key={self.api_key}")
            if response.status_code in (200, 204):
                return True
            else:
                raise RuntimeError(f"Failed to delete purchase: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Error deleting transaction: {e}")
            raise
    
    def _get_mock_transactions(self):
        """Generate a modest set of realistic-looking mock transactions.

        We avoid a huge hard-coded list and instead synthesize transactions from
        a small merchant pool with randomized amounts and dates. Each generated
        transaction will be a dict with description and amount (the normalizer
        will attach an id when returned to callers).
        """
        import random
        from datetime import datetime, timedelta

        merchants = [
            "HEB Grocery", "Starbucks", "Shell Gas", "Austin Energy", "Target",
            "Netflix", "Whole Foods", "Chipotle", "AT&T", "AMC Theaters",
            "CVS Pharmacy", "Uber", "Walmart", "Spotify", "Costco",
            "McDonald's", "Amazon", "Trader Joe's", "Chevron", "Zara"
        ]

        # Produce between 20 and 40 transactions across the last 60 days
        count = random.randint(20, 35)
        transactions = []
        for i in range(count):
            merchant = random.choice(merchants)
            # skew amounts depending on merchant type
            if any(k in merchant.lower() for k in ['grocery', 'whole', 'costco', 'trader']):
                amount = round(random.uniform(30, 250), 2)
            elif any(k in merchant.lower() for k in ['starbucks', 'coffee', "mc"]):
                amount = round(random.uniform(3, 25), 2)
            elif any(k in merchant.lower() for k in ['netflix', 'spotify', 'hbo', 'amazon']):
                amount = round(random.uniform(8, 20), 2)
            elif any(k in merchant.lower() for k in ['shell', 'chevron', 'bp', 'mobil']):
                amount = round(random.uniform(25, 120), 2)
            elif 'energy' in merchant.lower() or 'insurance' in merchant.lower():
                amount = round(random.uniform(80, 300), 2)
            else:
                amount = round(random.uniform(10, 160), 2)

            # include a short descriptor (mimics merchant + optional note)
            descriptor = merchant + (" Store" if random.random() < 0.3 else "")

            # random past date for realism (not used by analyzer now, but helpful)
            days_ago = random.randint(1, 60)
            date = (datetime.utcnow() - timedelta(days=days_ago)).isoformat()

            transactions.append({"description": descriptor, "amount": amount, "date": date})

        return transactions

    def _normalize_tx(self, tx, source='mock'):
        """Return transaction in standard shape: {id, description, amount, source}"""
        # Nessie returns objects with '_id', 'description', 'amount' or similar
        tx_id = None
        if isinstance(tx, dict):
            tx_id = tx.get('_id') or tx.get('id')
            description = tx.get('description') or tx.get('merchant') or ''
            amount = tx.get('amount') or tx.get('purchase_amount') or 0
        else:
            description = ''
            amount = 0

        if not tx_id:
            tx_id = str(uuid.uuid4())

        try:
            amount = float(amount)
        except:
            amount = 0.0

        return {
            'id': tx_id,
            'description': description,
            'amount': amount,
            'source': source
        }

    def create_transaction(self, account_id, tx):
        """Create a transaction in Nessie if available. Returns normalized tx with id or None if failed."""
        try:
            if not self._test_api_connection():
                print("⚠️  Nessie API not accessible, cannot create transaction")
                return None

            # Build minimal purchase payload
            payload = {
                'medium': 'balance',
                'amount': tx.get('amount', 0),
                'description': tx.get('description', '')
            }
            response = requests.post(
                f"{self.base_url}/accounts/{account_id}/purchases?key={self.api_key}",
                json=payload,
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code in (200, 201):
                created = response.json()
                return self._normalize_tx(created, source='nessie')
            else:
                print(f"⚠️  Failed to create transaction: {response.status_code}")
                return None
        except Exception as e:
            print(f"⚠️  Error creating transaction: {e}")
            return None

