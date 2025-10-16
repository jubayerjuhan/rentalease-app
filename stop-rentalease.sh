#!/bin/bash

# RentalEase CRM Stop Script
# This script stops all running services

echo "🛑 Stopping RentalEase CRM System..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to stop process on port
stop_port() {
    local port=$1
    local service_name=$2
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}🛑 Stopping $service_name on port $port (PID: $pid)${NC}"
        kill -TERM $pid 2>/dev/null
        sleep 3
        
        # Check if process is still running
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Force killing $service_name (PID: $pid)${NC}"
            kill -9 $pid 2>/dev/null
        fi
        
        echo -e "${GREEN}✅ $service_name stopped${NC}"
    else
        echo -e "${BLUE}ℹ️  $service_name is not running on port $port${NC}"
    fi
}

# Stop all services
echo -e "${BLUE}🔧 Stopping all services...${NC}"
stop_port 4000 "Backend_API"
stop_port 5173 "Frontend_CRM"
stop_port 3000 "Marketing_Website"

# Wait a moment for processes to fully terminate
sleep 2

# Final verification
echo ""
echo -e "${BLUE}🔍 Final status check...${NC}"
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}❌ Backend is still running on port 4000${NC}"
else
    echo -e "${GREEN}✅ Backend stopped${NC}"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}❌ Frontend CRM is still running on port 5173${NC}"
else
    echo -e "${GREEN}✅ Frontend CRM stopped${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}❌ Marketing Website is still running on port 3000${NC}"
else
    echo -e "${GREEN}✅ Marketing Website stopped${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo -e "${YELLOW}💡 To start services again, run: ./start-rentalease.sh${NC}"