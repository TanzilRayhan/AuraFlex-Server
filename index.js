const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5001;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7cdn1bn.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
  try {
    await client.connect();

    const userCollection = client.db("auraFlexDB").collection("users");
    const trainerCollection = client.db("auraFlexDB").collection("trainer");
    const featureCollection = client.db("auraFlexDB").collection("feature");

    //user API
    app.get("/users", async (req, res)=>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.post("/users", async (req, res)=>{
      const user = req.body;
      //insert email if user doesn't exists
      const query = {email: user.userEmail}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.send(result);
    })

    app.patch("/users/admin/:id", async (req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete("/users/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    //features
    app.get("/feature", async (req, res)=>{
      const cursor = featureCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //trainers
    app.get("/trainer", async (req, res)=>{
      const cursor = trainerCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/trainer", async(req, res)=>{
      const trainer = req.body;
      const result = await trainerCollection.insertOne(trainer);
      console.log(result);
      res.send(result);
    })

    app.get("/trainer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await trainerCollection.findOne(query);
      res.send(result);
    })

    //send ping
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


// Ping route
app.get('/', (req, res) => {
  res.send('AuraFlex server is running');
});

// Start server
app.listen(port, () => {
  console.log(`AuraFlex is running on port: ${port}`);
});