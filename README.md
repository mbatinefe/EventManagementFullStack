# Event Management Full Stack

## Overview
The Event Management Full Stack project is a comprehensive web-based application designed to facilitate the efficient management of events. Built using Vue.js for both front-end and back-end components, this system provides an intuitive interface for users to create, organize, and monitor events effectively.

---

## Technology Stack
- **Front-End**: Vue.js
- **Back-End**: Express.js (Node.js)
- **Database**: MongoDB
- **Additional Tools**: Vue Router, Vuex, Axios

---

## Features
- **User Authentication**: Secure mechanisms for user registration and login.
- **Event Creation and Management**: Allows users to create, edit, and delete events while tracking participant details.
- **Responsive Design**: Adaptable to various screen sizes for optimal user experience on both desktops and mobile devices.
- **API Integration**: Establishes seamless interaction between front-end and back-end via RESTful APIs.

---

## System Requirements
- **Node.js**: Version 16.x or later
- **NPM**: Version 8.x or later
- **MongoDB**: A running MongoDB instance

---

## Installation and Setup

### Step 1: Clone the Repository
git clone https://github.com/mbatinefe/event-management-full-stack.git  
cd event-management-full-stack

### Step 2: Install Dependencies

#### Back-End:
cd project-back-express  
npm install  

#### Front-End:
cd ../project-front-vue  
npm install  

### Step 3: Configure Environment Variables
Create a `.env` file in the `project-back-express` directory with the following:

MONGO_URI=your_mongodb_connection_string  
PORT=5000  

---

## Execution

### Running the Back-End Server
cd project-back-express  
npm start  

### Running the Front-End Application
cd ../project-front-vue  
npm run serve  

### Accessing the Application
Open your web browser and navigate to:  
http://localhost:8080  

---

## Project Structure

### Back-End (`project-back-express`)
- **`routes/`**: Defines API endpoints.
- **`models/`**: MongoDB schema definitions for users and events.
- **`controllers/`**: Implements the business logic for API requests.

### Front-End (`project-front-vue`)
- **`src/components/`**: Reusable Vue.js components.
- **`src/pages/`**: Main application pages.
- **`src/store/`**: Vuex-based state management.

---

## License
This project is licensed under the terms of the [GNU General Public License v3.0 (GPL-3.0)](https://github.com/mbatinefe/event-management-full-stack/blob/main/LICENSE).
