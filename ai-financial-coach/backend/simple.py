from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return 'Hello from AI Financial Coach Backend!'

if __name__ == '__main__':
    app.run(port=5002)
