# OSS Discovery Engine

A modern web application for discovering healthy, beginner-friendly open source projects built with React, Tailwind CSS, Firebase, and the **GitHub API**.

## ⚡ GitHub API Integration (NEW!)

The application now fetches **real-time repository data** from GitHub:

- 🔍 **Live Search**: Real-time search with debounced queries (500ms)
- 🎯 **Smart Filtering**: Filter by language, stars, license, and more - all in real-time
- 📊 **Live Data**: Popular repos, trending repos, and personalized recommendations
- ⚡ **Performance**: 5-minute intelligent caching to reduce API calls
- 🔒 **Rate Limiting**: Automatic rate limiting to respect GitHub API limits
- 🎫 **Optional Token**: Without token: 60 req/hour, with token: 5000 req/hour

### Quick Setup for GitHub API (Optional but Recommended)

```bash
# Create .env file in project root
echo "VITE_GITHUB_TOKEN=your_github_token_here" > .env

# Get your token at: https://github.com/settings/tokens
# Only needs 'public_repo' scope
```

📖 See [GITHUB_API_SETUP.md](./GITHUB_API_SETUP.md) for detailed setup instructions.

## Features

### 🎯 Core Features

- **Live GitHub Search**: Real-time search of GitHub repositories with debouncing
- **Smart Filtering**: Filter by language, license, stars, health score, good first issues, and more (all real-time)
- **Health Score**: Proprietary algorithm to evaluate repository health based on activity, maintenance, and community engagement
- **Repository Cards**: Rich cards displaying:
  - Stars, forks, contributors, and active PRs
  - Good first issues count (highlighted for beginners)
  - License information
  - Last commit date
  - Issue activity sparkline graph
  - Tech stack tags
  - Bookmark/save functionality

### 📊 Widgets (Live from GitHub)

- **Most Popular Projects**: Top starred repositories on GitHub (live data)
- **Trending Projects**: Recently popular repositories gaining stars (live data)
- **Personalized Recommendations**: Suggested projects based on your tech stack preferences (live data)

### 🔐 Authentication

- Email/password authentication
- Google OAuth integration
- User profiles with tech stack preferences
- Saved repositories (persisted in Firebase)

### 🎨 User Experience

- **Light/Dark Theme**: Toggle between themes with preference persistence
- **Responsive Design**: Mobile-first design that works on all devices
- **Onboarding Flow**: Personalized setup for new users
- **Protected Routes**: Secure pages requiring authentication

## Tech Stack

- **Frontend**: React 18 with JSX
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router v6
- **API**: GitHub REST API v3 for live repository data
- **Authentication**: Firebase Auth (Email/Password + Google)
- **Database**: Firebase Firestore
- **Search**: GitHub API search + Fuse.js for fuzzy matching (fallback)
- **Charts**: Recharts for sparklines
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd oss
```

2. Install dependencies:

```bash
npm install
```

3. Set up Firebase:

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database
   - Copy your Firebase configuration

4. Configure environment variables:
   - Create a `.env` file in the project root
   - Add your Firebase configuration:

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# GitHub API Token (Optional but recommended)
# Increases rate limit from 60/hour to 5000/hour
VITE_GITHUB_TOKEN=your_github_token_here
```

5. Update Firebase config in `src/services/firebase.js`:

   - Replace the placeholder config with your actual Firebase configuration

6. (Optional) Get a GitHub token for better performance:
   - Visit https://github.com/settings/tokens
   - Create a token with `public_repo` scope
   - Add it to your `.env` file

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be created in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FilterSidebar.jsx
│   ├── Header.jsx
│   ├── ProtectedRoute.jsx
│   ├── RepoCard.jsx
│   ├── RepoGrid.jsx
│   └── SearchBar.jsx
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── data/              # Mock data (fallback)
│   └── mockRepos.js
├── hooks/             # Custom React hooks
│   └── useDebounce.js
├── pages/             # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── OnboardingPage.jsx
│   ├── ProfilePage.jsx
│   ├── SavedReposPage.jsx
│   ├── SearchPage.jsx
│   └── SignupPage.jsx
├── services/          # External services
│   ├── firebase.js    # Firebase integration
│   └── github.js      # GitHub API integration (NEW!)
├── utils/             # Utility functions
│   ├── healthScore.js
│   └── searchUtils.js
├── App.jsx           # Main app component with routing
├── main.jsx          # Application entry point
└── index.css         # Global styles with Tailwind
```

## Key Features Explained

### Health Score Algorithm

The health score (0-100) evaluates repositories based on:

- **Activity** (30 points): Recent commit frequency
- **Community** (25 points): Number of contributors and stars
- **Maintenance** (25 points): Recency of last commit
- **Issue Management** (20 points): Ratio of open issues to stars

### Search and Filtering

- Fuzzy search using Fuse.js with weighted fields
- Multi-criteria filtering:
  - Programming languages
  - Licenses
  - Star ranges
  - Health score thresholds
  - Good first issues
  - Sorting options

### Firebase Integration

- User authentication with email/password and Google
- Firestore for storing user profiles and saved repositories
- Real-time sync of saved repositories across devices

## Future Enhancements

- [x] GitHub API integration for live data ✅
- [ ] Ecosyste.ms API integration
- [ ] Advanced analytics dashboard
- [ ] Repository comparison feature
- [ ] Contribution tracking
- [ ] Email notifications for new issues
- [ ] Social features (follow contributors, share lists)
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Repository data structure inspired by GitHub API
- Health score concept inspired by various open source health metrics
- UI/UX inspired by modern web applications

---

Built with ❤️ for the open source community
