#!/bin/bash

# GitHub API Token Setup Script
echo "🔧 Setting up GitHub API token for OSS Discovery Engine"
echo ""

# Check if .env file already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    echo "Current content:"
    cat .env
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

echo "📝 To get a GitHub token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "3. Give it a name like 'OSS Discovery Engine'"
echo "4. Select 'public_repo' scope (for public repositories only)"
echo "5. Click 'Generate token'"
echo "6. Copy the token immediately (you won't see it again!)"
echo ""

read -p "Enter your GitHub token (or press Enter to skip): " github_token

if [ -z "$github_token" ]; then
    echo "⚠️  No token provided. You'll be limited to 60 requests/hour."
    echo "💡 You can add the token later by creating a .env file with:"
    echo "   VITE_GITHUB_TOKEN=your_token_here"
else
    echo "🔑 Creating .env file with your token..."
    cat > .env << EOF
# GitHub API Configuration
VITE_GITHUB_TOKEN=${github_token}

# Note: With this token, you get 5,000 requests/hour instead of 60
EOF
    echo "✅ .env file created successfully!"
    echo "🚀 Restart your dev server to use the token:"
    echo "   npm run dev"
fi

echo ""
echo "🎉 Setup complete!"
echo "📖 For more info, see: GITHUB_API_SETUP.md"
