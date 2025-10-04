#!/bin/bash

# GitHub Token Setup Helper
# This script helps you add your GitHub token to the .env file

echo "🔑 GitHub Token Setup Helper"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Check current token
CURRENT_TOKEN=$(grep "^VITE_GITHUB_TOKEN=" .env | cut -d '=' -f2)

if [ "$CURRENT_TOKEN" == "YOUR_GITHUB_TOKEN_HERE" ] || [ -z "$CURRENT_TOKEN" ]; then
    echo "⚠️  No GitHub token configured yet"
    echo ""
    echo "📝 To get a token:"
    echo "   1. Visit: https://github.com/settings/tokens"
    echo "   2. Click 'Generate new token (classic)'"
    echo "   3. Select scope: 'public_repo'"
    echo "   4. Copy the generated token"
    echo ""
    echo "Need detailed instructions? Read: GET_GITHUB_TOKEN.md"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "📋 Paste your GitHub token here: " NEW_TOKEN
    
    if [ -z "$NEW_TOKEN" ]; then
        echo ""
        echo "❌ No token provided. Exiting..."
        exit 1
    fi
    
    # Validate token format (should start with ghp_ or github_pat_)
    if [[ ! "$NEW_TOKEN" =~ ^(ghp_|github_pat_) ]]; then
        echo ""
        echo "⚠️  Warning: This doesn't look like a valid GitHub token"
        echo "   GitHub tokens usually start with 'ghp_' or 'github_pat_'"
        read -p "   Continue anyway? (y/n): " CONTINUE
        if [ "$CONTINUE" != "y" ]; then
            echo "Exiting..."
            exit 1
        fi
    fi
    
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/VITE_GITHUB_TOKEN=.*/VITE_GITHUB_TOKEN=$NEW_TOKEN/" .env
    else
        # Linux
        sed -i "s/VITE_GITHUB_TOKEN=.*/VITE_GITHUB_TOKEN=$NEW_TOKEN/" .env
    fi
    
    echo ""
    echo "✅ Token added successfully!"
    echo ""
else
    echo "✅ GitHub token is already configured"
    echo ""
    echo "Current token: ${CURRENT_TOKEN:0:10}...${CURRENT_TOKEN: -4}"
    echo ""
    read -p "Do you want to replace it? (y/n): " REPLACE
    
    if [ "$REPLACE" == "y" ]; then
        echo ""
        read -p "📋 Paste your new GitHub token here: " NEW_TOKEN
        
        if [ -z "$NEW_TOKEN" ]; then
            echo ""
            echo "❌ No token provided. Keeping existing token."
            exit 1
        fi
        
        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/VITE_GITHUB_TOKEN=.*/VITE_GITHUB_TOKEN=$NEW_TOKEN/" .env
        else
            # Linux
            sed -i "s/VITE_GITHUB_TOKEN=.*/VITE_GITHUB_TOKEN=$NEW_TOKEN/" .env
        fi
        
        echo ""
        echo "✅ Token updated successfully!"
        echo ""
    fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Next Steps:"
echo ""
echo "1. Restart your dev server:"
echo "   Press Ctrl+C to stop it, then run:"
echo "   npm run dev"
echo ""
echo "2. Check if it's working:"
echo "   You should see: '✅ GitHub token configured'"
echo ""
echo "3. Test your rate limit:"
echo "   open API_TEST.html"
echo "   Should show: 5,000 requests/hour"
echo ""
echo "🎉 Done! You now have 5,000 API requests per hour!"
echo ""

