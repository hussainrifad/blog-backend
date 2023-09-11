const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

// Here is the function to verify the jwt 

function verifyJwt(req, res, next){
    
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(403).send({accessToken : 'user is not authorized'})
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({accessToken : 'user is not authorized'})    
        }
        req.decoded = decoded;
        next();
    })
}

const run = async () => {
    try {

        const catagories = client.db('DailyBlogs').collection('catagories');
        const blogs = client.db('DailyBlogs').collection('blogs');
        const userCollection = client.db('DailyBlogs').collection('users');

        // json web token API to validate the user to access the route 
        
        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const isUserExist = await userCollection.findOne({email : email});

            if(isUserExist){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
                return res.send({accessToken : token});
            }

            res.status(403).send({accessToken : 'unauthorized access'})
        })

        //

        // API to show the message that "Server is working well"
        // So you can skip it 

        app.get('/', async(req, res) => {
            const message = ' Server is running';
            res.send(message)
        })
        //

        // API to get all the Catagories 

        app.get('/catagories', async(req, res) => {
            const data = catagories.find({});
            const result = await data.toArray();
            res.send(result);
        })
        //

        // API to save all the user in the Database 

        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })
        
        app.post('/postblogs', async(req, res) => {
            const post = req.body;
            console.log(post);
            const result = await blogs.insertOne(post);
            res.send(result)
        })

        app.get('/blogs', async(req, res) => {
            let query = {};
            
            if(req.query.catagory){
                const value = (req.query.catagory);
                query ={catagory: value}
                console.log(value);
            }

            const cursor = blogs.find(query);
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        })

        app.get('/blog/:id', async(req, res) => {
            const id = req.params.id;
            const blog = await blogs.findOne({_id : new ObjectId(id)});
            console.log(blog);
            res.send(blog)
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