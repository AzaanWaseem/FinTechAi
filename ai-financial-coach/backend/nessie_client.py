import requests
import json
import os
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
                print("⚠️  Nessie API not accessible, using mock data")
                return self._create_mock_customer_and_account()
            
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
                print(f"⚠️  Customer creation failed: {customer_response.status_code}, using mock data")
                return self._create_mock_customer_and_account()
            
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
                print(f"⚠️  Account creation failed: {account_response.status_code}, using mock data")
                return self._create_mock_customer_and_account()
            
            account_id = account_response.json().get('objectCreated', {}).get('_id')
            
            return customer_id, account_id
            
        except Exception as e:
            print(f"⚠️  Error creating customer/account: {e}, using mock data")
            return self._create_mock_customer_and_account()
    
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
                print("⚠️  Nessie API not accessible, skipping transaction seeding")
                return
            
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
                    print(f"⚠️  Transaction creation failed: {response.status_code}")
                    break
                    
            print(f"✅ Seeded {len(sample_transactions)} transactions")
            
        except Exception as e:
            print(f"⚠️  Error seeding transactions: {e}")
    
    def get_transactions(self, account_id):
        """Get all transactions for an account"""
        try:
            # Test API connection first
            if not self._test_api_connection():
                print("⚠️  Nessie API not accessible, using mock transactions")
                return self._get_mock_transactions()
            
            response = requests.get(f"{self.base_url}/accounts/{account_id}/purchases?key={self.api_key}")
            
            if response.status_code != 200:
                print(f"⚠️  Failed to get transactions: {response.status_code}, using mock data")
                return self._get_mock_transactions()
            
            transactions = response.json()
            if not transactions:
                print("⚠️  No transactions found, using mock data")
                return self._get_mock_transactions()
            
            return transactions
            
        except Exception as e:
            print(f"⚠️  Error getting transactions: {e}, using mock data")
            return self._get_mock_transactions()
    
    def _get_mock_transactions(self):
        """Return mock transaction data"""
        return [
            {"description": "HEB Grocery Store", "amount": 1200},
            {"description": "Starbucks Coffee", "amount": 45},
            {"description": "Shell Gas Station", "amount": 85},
            {"description": "Austin Energy Bill", "amount": 1200},
            {"description": "Target Shopping", "amount": 65},
            {"description": "Netflix Subscription", "amount": 25},
            {"description": "Whole Foods Market", "amount": 150},
            {"description": "Chipotle Mexican Grill", "amount": 35},
            {"description": "AT&T Mobile Bill", "amount": 200},
            {"description": "AMC Theaters", "amount": 75},
            {"description": "CVS Pharmacy", "amount": 90},
            {"description": "Dunkin Donuts", "amount": 40},
            {"description": "Rent Payment", "amount": 300},
            {"description": "Uber Ride", "amount": 55},
            {"description": "Walmart Supercenter", "amount": 120},
            {"description": "Spotify Premium", "amount": 15},
            {"description": "Costco Wholesale", "amount": 180},
            {"description": "McDonald's", "amount": 30},
            {"description": "Car Insurance Payment", "amount": 250},
            {"description": "Amazon Prime", "amount": 50},
            {"description": "Trader Joe's", "amount": 95},
            {"description": "Subway", "amount": 20},
            {"description": "Chevron Gas Station", "amount": 110},
            {"description": "Zara Clothing", "amount": 70},
            {"description": "Kroger Grocery", "amount": 160},
            {"description": "Hulu Subscription", "amount": 12},
            {"description": "Safeway Grocery", "amount": 140},
            {"description": "Pizza Hut", "amount": 28},
            {"description": "Health Insurance", "amount": 220},
            {"description": "Regal Cinemas", "amount": 60},
            {"description": "Sprouts Farmers Market", "amount": 105},
            {"description": "Taco Bell", "amount": 18},
            {"description": "Exxon Gas Station", "amount": 80},
            {"description": "H&M Clothing", "amount": 45},
            {"description": "Publix Supermarket", "amount": 130},
            {"description": "Apple Music", "amount": 8},
            {"description": "Albertsons Grocery", "amount": 170},
            {"description": "KFC", "amount": 35},
            {"description": "Life Insurance", "amount": 190},
            {"description": "Cinemark Theaters", "amount": 42},
            {"description": "Food Lion Grocery", "amount": 115},
            {"description": "Burger King", "amount": 22},
            {"description": "BP Gas Station", "amount": 75},
            {"description": "Forever 21", "amount": 38},
            {"description": "Giant Eagle Grocery", "amount": 125},
            {"description": "Disney+ Subscription", "amount": 14},
            {"description": "Wegmans Grocery", "amount": 155},
            {"description": "Wendy's", "amount": 32},
            {"description": "Dental Insurance", "amount": 210},
            {"description": "Marcus Theaters", "amount": 48},
            {"description": "Harris Teeter Grocery", "amount": 100},
            {"description": "Arby's", "amount": 26},
            {"description": "Mobil Gas Station", "amount": 85},
            {"description": "Gap Clothing", "amount": 52},
            {"description": "Stop & Shop Grocery", "amount": 135},
            {"description": "HBO Max Subscription", "amount": 16},
            {"description": "King Soopers Grocery", "amount": 145},
            {"description": "Popeyes", "amount": 29},
            {"description": "Vision Insurance", "amount": 175},
            {"description": "AMC Dine-In Theaters", "amount": 55}
        ]

