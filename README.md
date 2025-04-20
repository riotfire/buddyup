# Answers NYC

AI-powered NYC travel insights and local recommendations.

## Features

- **AI Search**: Get instant answers to your NYC travel questions with citations
- **Weather Integration**: Real-time and 14-day weather forecasts
- **Personalization**: Save and organize your favorite places
- **Dynamic Content**: Curated recommendations across categories
- **Newsletter**: Stay updated with the latest NYC insights

## Tech Stack

- **Frontend**: Nuxt.js 3 (Vue 3)
- **Styling**: Bulma CSS Framework
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Search**: Tavily API
- **Weather**: OpenWeatherMap API

## Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- Supabase account
- Tavily API key
- OpenWeatherMap API key

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/answers-nyc.git
   cd answers-nyc
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file with your API keys:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   TAVILY_API_KEY=your_tavily_api_key
   WEATHER_API_KEY=your_weather_api_key
   ```

4. Set up your Supabase database:
   - Create a new project in Supabase
   - Run the SQL schema from `supabase/schema.sql`
   - Enable phone authentication in Supabase Auth settings

5. Start the development server:
   ```bash
   bun run dev
   ```

## Project Structure

```
├── assets/           # Static assets and styles
├── components/       # Vue components
│   ├── auth/        # Authentication components
│   ├── layout/      # Layout components
│   ├── search/      # AI search components
│   └── weather/     # Weather components
├── composables/     # Vue composables
├── pages/           # Nuxt pages
├── server/          # API routes
├── stores/          # State management
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## API Routes

- `/api/search` - AI-powered search using Tavily
- `/api/weather` - Weather data with caching

## Database Schema

### Tables

- `users` - User profiles
- `bookmarks` - Saved places and recommendations
- `settings` - User preferences
- `weather_data` - Cached weather information

## Deployment

1. Build the application:
   ```bash
   bun run build
   ```

2. Deploy to your preferred hosting platform (e.g., Vercel, Netlify)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Nuxt.js](https://nuxt.com/)
- [Bulma](https://bulma.io/)
- [Supabase](https://supabase.com/)
- [Tavily](https://tavily.com/)
- [OpenWeatherMap](https://openweathermap.org/)
