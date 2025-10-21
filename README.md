# AI-Powered Financial Coach 💰

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)

An intelligent financial coaching application that leverages AI to analyze spending patterns, provide personalized recommendations, and help users achieve their financial goals. Built for educational purposes and personal finance management.

## ✨ Features

- **🤖 AI-Powered Analysis**: Uses Google Gemini AI to intelligently categorize spending as "Needs" vs "Wants"
- **📊 Interactive Dashboard**: Beautiful charts and visualizations powered by Recharts
- **🎯 Goal Tracking**: Set and monitor personalized monthly savings goals
- **💡 Smart Recommendations**: AI-generated financial advice based on your spending patterns
- **📈 Investment Education**: Learn about investment concepts and get stock recommendations
- **💳 Credit Card Suggestions**: Get personalized credit card recommendations
- **🔒 Privacy-First**: Uses mock data - no real financial information required
- **📱 Responsive Design**: Modern, mobile-friendly interface

## 🛠️ Technology Stack

### Backend
- **Python 3.9+** - Core backend language
- **Flask 2.3+** - Web framework with CORS support
- **Google Gemini AI** - AI-powered transaction analysis and recommendations
- **Capital One Nessie API** - Mock financial data generation
- **APScheduler** - Background task scheduling
- **python-dotenv** - Environment variable management

### Frontend
- **React 18** - Modern UI framework with hooks
- **Recharts 2.8+** - Interactive data visualization
- **Axios** - HTTP client for API communication
- **Tailwind CSS** - Utility-first CSS framework
- **Modern CSS3** - Gradients, animations, and responsive design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### API Keys (Free)
- **Capital One Nessie API Key** - [Get it here](http://api.nessieisreal.com/)
- **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- **Mediastack API Key** (Optional) - [Get it here](https://mediastack.com/)

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
cd backend
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# Required: Capital One Nessie API Key
CAPITAL_ONE_KEY=your_nessie_api_key_here

# Required: Google Gemini API Key  
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Mediastack API Key (for news features)
MEDIASTACK_API_KEY=your_mediastack_api_key_here
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

## 🔑 API Keys Setup

### Capital One Nessie API (Free)
1. Visit [Capital One Nessie API](http://api.nessieisreal.com/)
2. Click "Get API Key" and create an account
3. Copy your API key from the dashboard
4. Add to `.env` as `CAPITAL_ONE_KEY`

### Google Gemini API (Free)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" 
4. Add to `.env` as `GEMINI_API_KEY`

### Mediastack API (Optional)
1. Visit [Mediastack](https://mediastack.com/)
2. Sign up for a free account (1000 requests/month)
3. Get your API key from the dashboard
4. Add to `.env` as `MEDIASTACK_API_KEY`

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

## 🔧 API Documentation

### Core Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/onboard` | Create mock account and seed transactions | `{"monthly_budget": number}` |
| POST | `/api/set-goal` | Set monthly savings goal | `{"goal": number}` |
| GET | `/api/analysis` | Get spending analysis and AI recommendations | None |
| GET | `/api/investment-idea` | Get investment education content | None |
| GET | `/api/health` | Health check endpoint | None |

### Additional Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/add-transaction` | Add custom transaction | `{"description": string, "amount": number}` |
| POST | `/api/remove-transaction` | Remove/hide transaction | `{"id": string}` |
| GET | `/api/trending-stocks` | Get trending stock recommendations | None |
| POST | `/api/rate-stocks` | Get AI stock analysis | `{"stocks": [{"symbol": string, "name": string}]}` |
| GET | `/api/best-credit-cards` | Get personalized credit card recommendations | None |

### Response Format
All endpoints return JSON with the following structure:
```json
{
  "success": true,
  "data": {...},
  "error": null
}
```

## 🎯 Hackathon Features

- **Real-time AI Analysis**: Instant spending categorization
- **Beautiful UI**: Modern, responsive design
- **Mock Data**: No real financial data required
- **Educational**: Teaches basic financial concepts
- **Scalable**: Easy to extend with more features

## 🚀 Future Enhancements

- 🏦 **Real Bank Integration**: Connect with Plaid API for live transaction data
- 🔐 **User Authentication**: Multi-user support with secure login
- 💾 **Data Persistence**: Database integration for saving user data
- 📊 **Advanced Analytics**: More detailed spending insights and trends
- 📱 **Mobile App**: React Native mobile application
- 🔔 **Smart Notifications**: Goal reminders and spending alerts
- 🤖 **Enhanced AI**: More sophisticated financial recommendations
- 🌐 **Multi-language**: Internationalization support

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/ai-financial-coach.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** thoroughly
6. **Commit** your changes: `git commit -m 'Add amazing feature'`
7. **Push** to the branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Types of Contributions
- 🐛 **Bug Fixes**: Report and fix bugs
- ✨ **New Features**: Add new functionality
- 📚 **Documentation**: Improve docs and examples
- 🎨 **UI/UX**: Enhance user interface and experience
- 🧪 **Testing**: Add tests and improve coverage
- 🔧 **DevOps**: Improve build and deployment processes

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Keep commits focused and well-documented
- Be respectful in discussions and reviews

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Capital One** for the Nessie API providing mock financial data
- **Google** for the Gemini AI API enabling intelligent analysis
- **HackTX 2025** for the inspiration and development opportunity
- **React** and **Flask** communities for excellent documentation
- All contributors who help improve this project

## 📊 Project Stats

- **Languages**: Python, JavaScript, CSS
- **Framework**: React + Flask
- **AI Integration**: Google Gemini
- **Visualization**: Recharts
- **Styling**: Tailwind CSS
- **API**: RESTful with JSON responses

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
