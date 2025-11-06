# Portfolio Agent

An intelligent, automated portfolio management system powered by AI. Built with the ROMA Framework and OpenDeepSearch for real-time analysis, risk management, and intelligent rebalancing of cryptocurrency portfolios.

**Built by [Kyozuro](https://github.com/Kyozuro111) for [Sentient](https://sentient.io/)**

---

## 🚀 Features

### Core Capabilities

- **🤖 AI-Powered Analysis**: Automated portfolio analysis with real-time risk metrics and health scores
- **📊 11+ Specialized Tools**: Comprehensive toolkit for portfolio management
- **🔄 Auto Rebalancing**: Intelligent rebalancing recommendations based on optimal allocation
- **📈 Predictive Analytics**: 7-day and 30-day portfolio forecasts
- **📰 Real-time News**: AI-analyzed news with sentiment analysis and portfolio impact scoring
- **💬 Portfolio Advisor Chat**: Interactive AI chat for portfolio questions and recommendations
- **🎯 Performance Attribution**: Identify which assets drive your portfolio performance
- **⚖️ Portfolio Optimization**: AI-driven optimization based on risk profiles
- **📉 Stress Testing**: Simulate extreme market scenarios
- **🔍 Opportunity Scanner**: Automatically scan markets for investment opportunities
- **🎙️ Natural Language Commands**: Control your portfolio using plain English
- **📱 Customizable Dashboard**: Personalize your dashboard with drag-and-drop widgets

### Advanced Features

- **Real-time Price Updates**: Live price ticker with 30-second refresh
- **Portfolio Snapshots**: Save and compare portfolio states over time
- **Export Functionality**: Export portfolio data in JSON or CSV format
- **Portfolio Comparison**: Compare performance against benchmarks (BTC, ETH, 60/40)
- **Voice Commands**: Use voice to control your portfolio (coming soon)

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15, React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Radix UI, shadcn/ui
- **AI Framework**: ROMA Agent Framework
- **News Research**: OpenDeepSearch (Serper + Jina + Tavily)
- **LLM Providers**: Fireworks, Groq, OpenRouter, AIML
- **Data Sources**: CoinGecko, CoinMarketCap, Birdeye
- **Deployment**: Vercel

---

## 📋 Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- API keys for various services (see Configuration)

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Kyozuro111/Portfolio-Agent-D.git
cd Portfolio-Agent-D
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# LLM Providers (at least one required)
FIREWORKS_API_KEY=your_fireworks_key
GROQ_API_KEY=your_groq_key
OPENROUTER_API_KEY=your_openrouter_key
AIML_API_KEY=your_aiml_key

# Price Data Providers (at least one recommended)
COINGECKO_API_KEY=your_coingecko_key
COINMARKETCAP_API_KEY=your_coinmarketcap_key
BIRDEYE_API_KEY=your_birdeye_key

# News Research Providers (at least one required for news feature)
SERPER_API_KEY=your_serper_key
JINA_API_KEY=your_jina_key
TAVILY_API_KEY=your_tavily_key
```

4. **Run the development server**

```bash
pnpm dev
# or
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Keys Configuration

### Required Keys

**Minimum Setup** (for basic functionality):
- At least **1 LLM API key** (Fireworks, Groq, OpenRouter, or AIML)
- At least **1 Price API key** (CoinGecko, CoinMarketCap, or Birdeye)
- At least **1 News API key** (Serper or Tavily) for news features

### Recommended Setup

**For Full Functionality**:
- **LLM**: Fireworks (primary) + Groq + OpenRouter + AIML (fallbacks)
- **Prices**: CoinGecko + CoinMarketCap + Birdeye (for Solana tokens)
- **News**: Serper + Jina (for content extraction) + Tavily (fallback)

### Getting API Keys

1. **Fireworks AI**: [https://fireworks.ai](https://fireworks.ai)
2. **Groq**: [https://groq.com](https://groq.com) (Free tier available)
3. **OpenRouter**: [https://openrouter.ai](https://openrouter.ai) (Free tier available)
4. **AIML**: [https://aimlapi.com](https://aimlapi.com) (Free tier available)
5. **CoinGecko**: [https://www.coingecko.com/api](https://www.coingecko.com/api) (Free tier available)
6. **CoinMarketCap**: [https://coinmarketcap.com/api](https://coinmarketcap.com/api)
7. **Birdeye**: [https://birdeye.so](https://birdeye.so) (For Solana tokens)
8. **Serper**: [https://serper.dev](https://serper.dev)
9. **Jina AI**: [https://jina.ai](https://jina.ai)
10. **Tavily**: [https://tavily.com](https://tavily.com)

---

## 📖 Usage

### Adding Your Portfolio

1. Click **"Get Started"** on the landing page
2. Add your holdings using the portfolio input form
3. Enter symbol, amount, and optional purchase price/date
4. Click **"Analyze Portfolio"** to run AI analysis

### Using AI Features

- **Portfolio Advisor Chat**: Click the chat widget (bottom-right) to ask questions
- **Natural Language Commands**: Use plain English to create conditional orders
- **Auto Rebalancing**: View recommendations in the Auto Rebalancing Advisor widget
- **News Impact**: Check the AI News Impact Analyzer for relevant news
- **Opportunity Scanner**: Scan for market opportunities automatically

### Customizing Dashboard

1. Click the settings icon (gear) in the top-right
2. Enable/disable widgets as needed
3. Drag and drop widgets to reorder
4. Your preferences are automatically saved

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git push origin main
```

2. **Import to Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository

3. **Configure Environment Variables**

- Go to Project Settings → Environment Variables
- Add all your API keys
- Redeploy the project

4. **Deploy**

Vercel will automatically deploy on every push to `main` branch.

### Other Platforms

The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

---

## 🏗️ Project Structure

```
portfolio-agent/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── agent/         # AI agent endpoints
│   │   ├── analyze/       # Analysis endpoints
│   │   ├── news/          # News research endpoint
│   │   └── prices/        # Price data endpoint
│   ├── docs/              # Documentation page
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── ...                # Feature components
├── lib/                   # Utility libraries
│   ├── agent/             # ROMA agent framework
│   │   ├── llm.ts         # LLM integration
│   │   ├── roma.ts        # ROMA runner
│   │   └── tools.ts       # Agent tools
│   └── keys.ts            # API key management
├── hooks/                 # React hooks
└── public/                # Static assets
```

---

## 🔧 Development

### Available Scripts

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting (recommended)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary. All rights reserved.

---

## 👤 Author

**Kyozuro**

- GitHub: [@Kyozuro111](https://github.com/Kyozuro111)
- Built for: [Sentient](https://sentient.io/)

---

## 🙏 Acknowledgments

- **ROMA Framework**: Plan-based execution system for intelligent agents
- **OpenDeepSearch**: Real-time news research with sentiment analysis
- **shadcn/ui**: Beautiful and accessible UI components
- **Vercel**: Hosting and deployment platform

---

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ by Kyozuro for the Sentient community**

