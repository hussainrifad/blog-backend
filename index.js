const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());

const uri = process.env.URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const port = process.env.port  || 3000;

const run = async () => {
    try {

        const products = client.db('ema-john-ecomerce').collection('products');

        app.get('/', async(req, res) => {
            const message = ' Server is running';
            res.send(message)
        })

        app.get('/products', async(req, res) => {
            const query = {};
            const cursor = products.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        
    } 
    finally{
        
    }
}
run().catch(error => {
    console.log(error)
})

app.listen(port, () => {
    console.log(`server is running at ${port}`);
})