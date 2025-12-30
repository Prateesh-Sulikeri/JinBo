#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   JinBo Chatbot Setup Script          ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js found: ${NODE_VERSION}${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm found: ${NPM_VERSION}${NC}"
echo ""

# Create directory structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p public
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Verify knowledge base exists
if [ ! -f "knowledge-base.json" ]; then
    echo -e "${RED}❌ knowledge-base.json not found!${NC}"
    echo -e "${YELLOW}Please create knowledge-base.json before continuing${NC}"
    exit 1
fi
echo -e "${GREEN}✓ knowledge-base.json found${NC}"

# Verify server.js exists
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ server.js not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ server.js found${NC}"

# Verify public/index.html exists
if [ ! -f "public/index.html" ]; then
    echo -e "${RED}❌ public/index.html not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Chat UI found${NC}"
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cat > .env << EOF
PORT=3000
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping${NC}"
fi
echo ""

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${BLUE}🔧 Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: JinBo chatbot setup"
    echo -e "${GREEN}✓ Git repository initialized${NC}"
else
    echo -e "${YELLOW}⚠ Git repository already exists, skipping${NC}"
fi
echo ""

echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     Setup Complete! 🎉                 ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "1. Start the server:"
echo -e "   ${GREEN}npm start${NC}"
echo ""
echo -e "2. Or run in development mode:"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""
echo -e "3. Test the bot:"
echo -e "   ${GREEN}npm test${NC}"
echo ""
echo -e "4. Access the chat UI:"
echo -e "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "5. Check health:"
echo -e "   ${GREEN}http://localhost:3000/health${NC}"
echo ""
echo -e "${YELLOW}For deployment instructions, see DEPLOYMENT.md${NC}"
echo ""