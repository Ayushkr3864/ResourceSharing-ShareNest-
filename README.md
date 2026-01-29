# ResourceSharing-ShareNest-
 https://resourcesharing-sharenest.onrender.com/
📚 Resource Sharing Platform
A 🌐 collaborative web app designed to streamline the sharing and access of academic or informational resources within institutions or organizations.

🔧 Key Features:

📂 Upload & Download Resources: Notes, PDFs, Assignments

🔐 User Authentication: Secure login/signup with session or JWT support

💬 Interactive UI: Clean, responsive EJS-based interface

💬 Interactive Interface: Clean EJS-based frontend with flash messages

🛠️ Tech Stack:
MongoDB 🍃 | Express.js 🚂 | Node.js 🟢 | EJS 🎨


# Run Without Docker (Local Setup)
Prerequisites

Node.js (v16+ recommended)

MongoDB running locally

Steps
# Install dependencies
npm install

# Start the server
npm run dev


# ShareNest – Run with Docker (docker run)

Prerequisites
Docker installed on your machine
Steps
# Pull the Docker image
docker pull ayushkr3864/sharenest:1.0

# Run the Docker container
docker run -d -p 3000:3000 --name sharenest_container ayushkr3864/sharenest:1.0
# Access the application
Open your web browser and navigate to http://localhost:3000
# Stop the Docker container
docker stop sharenest_container

# Run using Docker Compose (docker-compose.yml) (Recommended)
Prerequisites
Docker and Docker Compose installed on your machine
Steps
# Clone the repository
git clone https://github.com/Ayushkr3864/ResourceSharing-ShareNest-.git
cd ResourceSharing-ShareNest-
# Create a .env file in the root directory and set the following environment variables
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
CLOUD_NAME = your_cloud_name
CLOUD_API_KEY = your_cloud_api_key
CLOUD_API_SECRET = your_cloud_api_secret
# Start the Docker containers
docker-compose up -d
# Access the application
Open your web browser and navigate to http://localhost:3000



