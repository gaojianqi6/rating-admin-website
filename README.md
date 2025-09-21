# RateEverything 🌟

RateEverything is your all-in-one platform for rating and reviewing various types of media and experiences. Whether you're a movie buff, bookworm, music enthusiast, or foodie, RateEverything provides a unified space to share your opinions and discover new favorites.

## 🌟 Features

- **Unified Rating System**: Rate and review multiple media types in one place:
  - Movies
  - TV Series
  - Variety Shows
  - Books
  - Music
  - Podcasts
  - (Coming soon: Physical establishments like stores and restaurants)

- **Cross-Media Recommendations**: Get personalized suggestions based on your ratings across different media types
- **Single Profile**: Manage all your ratings and reviews with one account
- **Modern UI**: Clean and intuitive interface built with Shadcn UI and Tailwind CSS

## 🛠️ Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: 
  - Shadcn UI
  - Tailwind CSS
- **State Management**: 
  - Jotai
  - Zustand
- **Routing**: @tanstack/react-router
- **Data Fetching**: 
  - @tanstack/react-query
  - Ky
- **Code Quality**: ESLint

## 🚀 Getting Started

Rating admin api: https://rating-admin-api.onrender.com/api/v1/data-sources

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd rating-admin-website
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## 📝 Project Focus

RateEverything aims to solve the fragmentation in rating platforms by providing:
- A unified platform for all types of ratings
- Seamless cross-media recommendations
- Consistent user experience across different media types
- Easy-to-use interface for rating and reviewing
- Comprehensive statistics and insights

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

[Add your license information here]