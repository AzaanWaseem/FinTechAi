# Contributing to AI-Powered Financial Coach

Thank you for your interest in contributing to the AI-Powered Financial Coach! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions of all kinds:

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new functionality  
- 🔧 **Code Contributions**: Submit bug fixes and new features
- 📚 **Documentation**: Improve README, comments, and guides
- 🎨 **UI/UX Improvements**: Enhance the user interface and experience
- 🧪 **Testing**: Add tests and improve test coverage

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** and **Node.js 16+**
- **Git** for version control
- API keys for Gemini AI and Nessie API (see README)

### Setup Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/HackTx2025.git
   cd HackTx2025/ai-financial-coach
   ```

3. **Install dependencies**:
   ```bash
   # Backend dependencies
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Run the application**:
   ```bash
   # Terminal 1: Backend
   cd backend
   source venv/bin/activate
   python app.py
   
   # Terminal 2: Frontend  
   cd frontend
   npm start
   ```

## 📝 Development Guidelines

### Code Style

#### Python (Backend)
- Follow **PEP 8** style guidelines
- Use **type hints** where appropriate
- Write **docstrings** for functions and classes
- Use **logging** instead of print statements
- Keep functions focused and well-named

```python
def analyze_spending(user_id: str) -> dict:
    """
    Analyze user spending patterns using AI.
    
    Args:
        user_id: Unique identifier for the user
        
    Returns:
        dict: Analysis results with spending breakdown
    """
    logger.info(f"Starting analysis for user {user_id}")
    # Implementation here
```

#### JavaScript/React (Frontend)
- Use **functional components** with hooks
- Write **JSDoc comments** for complex functions
- Use **async/await** for API calls
- Handle errors gracefully
- Use meaningful variable names

```javascript
/**
 * Fetch user's financial analysis from the backend
 * @returns {Promise<Object>} Analysis data with spending breakdown
 */
const fetchAnalysis = async () => {
  try {
    const response = await axios.get('/api/analysis');
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch analysis:', error);
    throw error;
  }
};
```

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add credit card recommendation feature
fix: resolve transaction deletion bug
docs: update API documentation
style: improve dashboard responsive design
test: add unit tests for spending analysis
refactor: simplify authentication flow
```

### Branch Naming

Use descriptive branch names:
- `feature/add-investment-tracking`
- `fix/transaction-sync-issue`
- `docs/api-documentation`
- `ui/improve-mobile-layout`

## 🧪 Testing

### Running Tests

```bash
# Backend tests (when available)
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Writing Tests

- Write unit tests for new functions
- Test both success and error cases
- Mock external API calls
- Test React components with user interactions

## 📦 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test your changes** thoroughly:
   - Run the application locally
   - Test all affected functionality
   - Ensure no existing features are broken

4. **Update documentation** if needed:
   - Update README for new features
   - Add JSDoc/docstrings for new functions
   - Update API documentation

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**:
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All existing tests pass

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🐛 Reporting Issues

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Environment details** (OS, Python/Node versions)
5. **Error messages** and logs
6. **Screenshots** if applicable

### Bug Report Template

```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Python Version: [e.g., 3.9.0]
- Node Version: [e.g., 16.0.0]
- Browser: [e.g., Chrome, Firefox]

**Additional Context**
Any other relevant information.
```

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** or approach
4. **Consider the scope** and complexity
5. **Think about the user experience**

## 🏗️ Architecture Overview

### Backend Structure
```
backend/
├── app.py              # Main Flask application
├── nessie_client.py    # Nessie API integration
├── gemini_client.py    # Google Gemini AI client
├── requirements.txt    # Python dependencies
└── .env.example       # Environment variables template
```

### Frontend Structure
```
frontend/src/
├── App.js             # Main React application
├── components/        # React components
│   ├── Dashboard.js   # Main dashboard
│   ├── Onboarding.js  # User onboarding
│   └── ...           # Other components
└── index.js          # Application entry point
```

## 📋 Project Roadmap

Current priorities:

1. **Enhanced AI Features**: More sophisticated spending analysis
2. **Real Bank Integration**: Connect with Plaid API
3. **User Authentication**: Multi-user support
4. **Mobile App**: React Native implementation
5. **Advanced Analytics**: Detailed spending trends
6. **Investment Tools**: Portfolio tracking and recommendations

## 💬 Community Guidelines

- **Be respectful** and inclusive in all interactions
- **Help newcomers** and answer questions patiently  
- **Provide constructive feedback** in code reviews
- **Focus on the code**, not the person
- **Celebrate contributions** and thank contributors

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and ideas
- **Code Review**: Ask for feedback on complex changes

## 🙏 Recognition

Contributors will be recognized in:
- README acknowledgments section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to the AI-Powered Financial Coach! 🚀
