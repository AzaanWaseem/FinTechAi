from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/onboard', methods=['POST'])
def create_onboard():
    return jsonify({"customerId": "test123", "accountId": "acc123"})

if __name__ == '__main__':
    print('🚀 Starting AI Financial Coach Backend...')
    app.run(debug=True, port=5002)
