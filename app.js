const dotenv = require('dotenv');
const sql = require('mssql');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");

dotenv.config();

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(cors());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};

async function createDatabase() {
    try {
        const pool = await new sql.ConnectionPool(dbConfig).connect();
        const databaseName = 'CloudManagementPortal';
        const tableName = 'HealthDeclaration';

        await pool.query(`IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${databaseName}')
                       CREATE DATABASE ${databaseName}`);
        console.log('Database created or already exists.');

        dbConfig.database = databaseName;
        await pool.query(`USE ${databaseName}`);

        await pool.query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${tableName}')
        CREATE TABLE ${tableName} (
          ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), 
          Name NVARCHAR(255) NOT NULL,
          Temperature DECIMAL(10, 2) NOT NULL,
          HasSymptoms BIT NOT NULL,
          CloseContact BIT NOT NULL
        )`);
        console.log('Table created or already exists.');

        pool.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

async function connectToDatabase() {
    try {
        await createDatabase();

        const pool = await new sql.ConnectionPool(dbConfig);
        console.log('Connected to the database and table.');

        try {
            await pool.connect();
            console.log('SQL Server connection pool is ready.');
        } catch (err) {
            console.error('Error initializing SQL Server connection pool:', err);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.post('/health-declaration', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const { name, temperature, hasSymptoms, isCloseContact } = req.body;

        const request = pool.request();
        request.input('Name', sql.NVarChar(255), name);
        request.input('Temperature', sql.Decimal(10, 2), temperature);
        request.input('HasSymptoms', sql.Bit, hasSymptoms ? 1 : 0);
        request.input('CloseContact', sql.Bit, isCloseContact ? 1 : 0);

        const query = `
            INSERT INTO dbo.HealthDeclaration (Name, Temperature, HasSymptoms, CloseContact)
            VALUES (@Name, @Temperature, @HasSymptoms, @CloseContact)
          `;

        await request.query(query);

        res.status(200).json({ message: 'Submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/health-declarations', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const columnInfoQuery = `
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'HealthDeclaration'
      `;

        const columnInfoResult = await pool.request().query(columnInfoQuery);

        const dataQuery = 'SELECT * FROM HealthDeclaration order by Name ASC';
        const dataResult = await pool.request().query(dataQuery);

        const response = {
            columns: columnInfoResult.recordset,
            data: dataResult.recordset,
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

connectToDatabase();

module.exports = app; 