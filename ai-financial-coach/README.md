# AI-Powered Financial Coach 💰

A prototype financial coaching application that uses AI to analyze spending patterns and provide personalized recommendations.

## 🚀 Features

- **Mock Financial Data**: Creates realistic sample transactions using Nessie API
- **AI-Powered Analysis**: Uses Google Gemini to categorize spending as "Needs" vs "Wants"
- **Interactive Dashboard**: Beautiful charts and visualizations showing spending breakdown
- **Personalized Recommendations**: AI-generated financial advice based on spending patterns
- **Savings Goal Tracking**: Set and monitor monthly savings goals
- **Investment Education**: Learn about basic investment concepts when goals are met

## 🛠️ Technology Stack

### Backend
- **Python 3.9+** with Flask
- **Nessie API** for mock financial data
- **Google Gemini AI** for transaction analysis
- **APScheduler** for automated analysis

### Frontend
- **React 18** with modern hooks
- **Recharts** for data visualization
- **Axios** for API communication
- **CSS3** with gradients and animations

## 📋 Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn
- Nessie API key (free from Capital One)
- Google Gemini API key (free from Google AI)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ai-financial-coach
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the `backend` directory:
```bash
cp env_template.txt .env
```

Edit `.env` and add your API keys:
```env
NESSIE_API_KEY="your_nessie_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 4. Start Backend Server
```bash
source venv/bin/activate
python app.py
```
Backend will run on `http://localhost:5002`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
Frontend will run on `http://localhost:3000`

## 🔑 Getting API Keys

### Nessie API (Free)
1. Visit [Capital One Nessie API](http://api.nessieisreal.com/)
2. Sign up for a free account
3. Get your API key from the dashboard

### Google Gemini API (Free)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key

## 📱 How to Use

1. **Onboarding**: Click "Start Your Journey" to create a mock financial account
2. **Set Goal**: Enter your monthly savings goal (e.g., $500)
3. **View Dashboard**: See your spending analysis with interactive charts
4. **Get Recommendations**: Read AI-generated financial advice
5. **Track Progress**: Monitor your savings goal progress

## 🏗️ Project Structure

```
ai-financial-coach/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── nessie_client.py    # Nessie API integration
│   ├── gemini_client.py    # Google Gemini AI integration
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables (not in git)
│   └── venv/              # Virtual environment (not in git)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main React app
│   │   └── index.js       # React entry point
│   ├── public/            # Static files
│   ├── package.json       # Node.js dependencies
│   └── node_modules/      # Dependencies (not in git)
└── README.md
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/onboard` | Create mock account and seed transactions |
| POST | `/api/set-goal` | Set monthly savings goal |
| GET | `/api/analysis` | Get spending analysis and recommendations |
| GET | `/api/investment-idea` | Get investment education (when goal met) |
| GET | `/api/health` | Health check endpoint |

## 🎯 Hackathon Features

- **Real-time AI Analysis**: Instant spending categorization
- **Beautiful UI**: Modern, responsive design
- **Mock Data**: No real financial data required
- **Educational**: Teaches basic financial concepts
- **Scalable**: Easy to extend with more features

## 🚀 Future Enhancements

- Real bank account integration (Plaid)
- User authentication and persistence
- Advanced investment recommendations
- Budget planning tools
- Mobile app version
- Real-time notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Backend Issues
- Make sure Python virtual environment is activated
- Check that `.env` file exists with valid API keys
- Ensure port 5002 is not in use

### Frontend Issues
- Make sure Node.js dependencies are installed
- Check that backend is running on port 5002
- Clear browser cache if needed

### API Issues
- Verify API keys are correct and active
- Check internet connection
- Review API rate limits

## 📞 Support

For questions or issues, please open a GitHub issue or contact the team.

---

**Built with ❤️ for HackTX 2025**
