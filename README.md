# AI Evaluator 📚✨

An intelligent assignment evaluation system powered by Google Gemini AI that automates grading and provides personalized feedback through Google Classroom integration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 🌟 Features

### Core Functionality

- **Smart Evaluation & Grading**

  - One-click batch processing
  - AI-powered content analysis
  - Automated scoring system
  - Multi-format submission support

- **Google Classroom Integration**

  - Seamless authentication
  - Automatic grade syncing
  - Real-time updates
  - Bulk assignment handling

- **Personalized Feedback**
  - Detailed improvement suggestions
  - Strength/weakness analysis
  - Custom feedback templates
  - Multi-language support

### Analytics & Interface

- **Performance Tracking**

  - Progress monitoring
  - Class statistics
  - Individual student insights
  - Trend analysis

- **User-Friendly Design**
  - Intuitive dashboard
  - Mobile responsive
  - Dark/light themes
  - Accessibility features

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
MongoDB >= 6.0
```

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/ai-evaluator.git
cd ai-evaluator
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Add your configuration details
```

4. Run the development server

```bash
npm run dev
```

## 🛠️ Tech Stack

### Frontend

- Next.js 14
- TypeScript
- TailwindCSS
- Shadcn UI

### Backend

- Node.js
- Express.js
- MongoDB
- WebSocket

### AI/Integration

- Google Gemini API
- Google Classroom API
- Google OAuth 2.0
- Google Drive API

## 📊 System Architecture

```
Client Layer
   ↓
API Layer (REST + WebSocket)
   ↓
Authentication (Google OAuth)
   ↓
Service Layer (Assignment Processing)
   ↓
Database Layer (MongoDB)
```

## 🔜 Future Enhancements

- Enhanced AI Feedback System
- Advanced OCR with handwriting recognition
- AI Voice Assistant integration
- Smart YouTube lecture recommendations
- Multi-language support

## 💰 Pricing

### Free Tier Limits

- Google Classroom API: 1M reads & 100K writes/day
- Gemini API: 60 requests/minute
- MongoDB Atlas: 512MB storage
- Vercel Hobby: Basic hosting

### Minimum Costs (Beyond Free Tier)

- Estimated $30-40/month
- Custom domain: $10/year

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- [Developer Name] - Lead Developer
- [Designer Name] - UI/UX Designer
- [Your Name] - Project Manager

## 📞 Support

For support, email support@aievaluator.com or join our Discord channel.

---

Made with ❤️ for educators and students
