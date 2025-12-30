#!/bin/bash

# RentalEase CRM Startup Script
# This script starts all services with proper port configuration

echo "🚀 Starting RentalEase CRM System..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}🛑 Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Function to check if a port is in use
is_port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null
}

# Kill existing processes on required ports
echo -e "${BLUE}🔧 Cleaning up existing processes...${NC}"
kill_port 4000  # Backend
kill_port 5173  # Frontend CRM
kill_port 3000  # Marketing Website

# Wait a moment for processes to fully terminate
sleep 3

# Verify ports are available
echo -e "${BLUE}🔍 Verifying ports are available...${NC}"
if is_port_in_use 4000; then
    echo -e "${RED}❌ Port 4000 is still in use${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Port 4000 is available${NC}"
fi
if is_port_in_use 5173; then
    echo -e "${RED}❌ Port 5173 is still in use${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Port 5173 is available${NC}"
fi
if is_port_in_use 3000; then
    echo -e "${RED}❌ Port 3000 is still in use${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Port 3000 is available${NC}"
fi


# Function to start service
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    local port=$4
    
    echo -e "${BLUE}🚀 Starting $service_name on port $port...${NC}"
    cd "$directory"
    
    # Start the service in background
    if [ "$command" = "pnpm dev" ]; then
        pnpm dev > "../logs/${service_name}.log" 2>&1 &
    else
        $command > "../logs/${service_name}.log" 2>&1 &
    fi
    
    local pid=$!
    echo -e "${GREEN}✅ $service_name started with PID: $pid${NC}"
    
    # Wait a moment for service to start
    sleep 15
    
    # Check if service is running
    if is_port_in_use $port; then
        echo -e "${GREEN}✅ $service_name is running on port $port${NC}"
    else
        echo -e "${RED}❌ Failed to start $service_name${NC}"
        return 1
    fi
}

# Create logs directory
mkdir -p logs

# Start services
echo -e "${BLUE}🎯 Starting all services...${NC}"

# Start Backend (Port 4000)
start_service "Backend" "/Users/juhan/Developer/The_Digital_Dude/rentalease_crm/RentalEase-CRM-Server" "pnpm dev" 4000
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Backend${NC}"
    exit 1
fi

# Start Frontend CRM (Port 5173)
start_service "Frontend_CRM" "/Users/juhan/Developer/The_Digital_Dude/rentalease_crm/RentalEase-CRM" "pnpm dev" 5173
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Frontend CRM${NC}"
    exit 1
fi

# Start Marketing Website (Port 3000)
start_service "Marketing_Website" "/Users/juhan/Developer/The_Digital_Dude/rentalease_crm/rentalease_website" "pnpm dev" 3000
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Marketing Website${NC}"
    exit 1
fi

# Final status
echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo "=================================="
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "  🔧 Backend API:     ${GREEN}http://localhost:4000${NC}"
echo -e "  🖥️  Frontend CRM:    ${GREEN}http://localhost:5173${NC}"
echo -e "  🌐 Marketing Site:  ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}📝 Logs available in:${NC}"
echo -e "  📄 Backend:         ${YELLOW}logs/Backend.log${NC}"
echo -e "  📄 Frontend CRM:    ${YELLOW}logs/Frontend_CRM.log${NC}"
echo -e "  📄 Marketing Site:  ${YELLOW}logs/Marketing_Website.log${NC}"
echo ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo -e "  🏠 Marketing Site:  ${GREEN}http://localhost:3000${NC}"
echo -e "  💼 CRM Login:       ${GREEN}http://localhost:5173/login${NC}"
echo -e "  📚 API Health:      ${GREEN}http://localhost:4000/health${NC}"
echo ""
echo -e "${YELLOW}💡 To stop all services, run: ./stop-rentalease.sh${NC}"
echo -e "${YELLOW}💡 To view logs, run: tail -f logs/[service-name].log${NC}"