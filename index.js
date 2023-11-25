const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
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

    const trainerCollection = client.db("auraFlexDB").collection("trainer");

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