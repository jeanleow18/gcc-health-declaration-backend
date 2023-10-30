# Health Declaration API

This is a Node.js application for managing health declarations using SQL Server as the backend database. The application provides RESTful API endpoints for creating and reading health declarations.

## Prerequisites

Before you start using this application, make sure you have the following prerequisites installed:

- Node.js
- SQL Server (with necessary permissions and configurations)
- A .env file with the following variables:
  - DB_USER: Your SQL Server username
  - DB_PASSWORD: Your SQL Server password
  - DB_SERVER: Your SQL Server instance name
  - DB_DATABASE: The name of the database to be used by the application
  - PORT: the port number
- NPM (Node Package Manager)

## Installation

1. Clone this repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Run the following command to install the required dependencies:

```bash
npm install
```

## Configuration

Before running the application, ensure that you have set up the necessary environment variables in a .env file as described in the Prerequisites section.

## Usage

To start the application, run the following command:

```bash
npm start
```

The application will start and listen on the specified port (default is 8080). You can change the port by setting the `PORT` environment variable in your .env file.

## API Endpoints

# 1. Create Health Declaration

- Endpoint: POST /health-declaration
- Description: Create a new health declaration entry.
- Request Body: JSON object with the following fields:
  - Name (String): The name of the person making the declaration.
  - Temperature (Decimal): The temperature of the person.
  - HasSymptoms (Boolean): Do you have any of the following symptoms now or within the last 14 days:  Cough, smell/test impairment, fever, breathing difficulties, body aches, headaches, fatigue, sore throat, diarrhea, runny nose(even if your symptoms are mild (true/false).
  - CloseContact (Boolean): Have you been in contact with anyone who is suspected to have/ has been diagnosed with Covid-19 within the last 14 days? (true/false).

# 2. Get Health Declarations

- Endpoint: GET /health-declarations
- Description: Retrieve a list of all health declaration entries.
- Response: JSON object:
  - data: An array of health declaration entries.
