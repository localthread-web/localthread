#!/bin/bash

echo "🚀 LocalThread Backend Setup Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Check if MongoDB is running (optional)
echo "🔍 Checking MongoDB connection..."
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running."
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB:"
        echo "   mongod"
    fi
else
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use MongoDB Atlas."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start MongoDB (if using local database)"
echo "3. Run: npm run dev"
echo "4. Test the API: curl http://localhost:5000/api/health"
echo ""
echo "📚 Documentation:"
echo "- README.md - Complete setup and usage guide"
echo "- AUTHENTICATION_GUIDE.md - Detailed auth system explanation"
echo ""
echo "🔗 API Endpoints:"
echo "- Health check: http://localhost:5000/api/health"
echo "- Test endpoint: http://localhost:5000/api/test"
echo "- Auth endpoints: http://localhost:5000/api/auth/*"
echo "- User endpoints: http://localhost:5000/api/users/*" 