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
    //await client.connect();

    const userCollection = client.db("auraFlexDB").collection("users");
    const trainerCollection = client.db("auraFlexDB").collection("trainer");
    const featureCollection = client.db("auraFlexDB").collection("feature");
    const galleryCollection = client.db("auraFlexDB").collection("gallery");
    const subscriberCollection = client.db("auraFlexDB").collection("subscriber");
    const classCollection = client.db("auraFlexDB").collection("class");
    const forumCollection = client.db("auraFlexDB").collection("forum");

    // JWT API
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h"
      });
      res.send({ token });
    })

    //middlewares
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    //verify admin after verifyToken
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = user?.role === 'admin';
      if(!isAdmin) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    }

    //user API
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      console.log(req.headers);
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
       admin = user?.role === 'admin';
      }
      res.send({ admin });
    })

    app.post("/users", async (req, res) => {
      const user = req.body;
      //insert email if user doesn't exists
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.send(result);
    })

    app.patch("/users/admin/:id", verifyAdmin, verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete("/users/:id", verifyAdmin, verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    //features
    app.get("/feature", async (req, res) => {
      const cursor = featureCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //gallery
    app.get("/gallery", async (req, res) => {
      const cursor = galleryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

     //classes
     app.get("/class", async (req, res) => {
      const cursor = classCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/class", async (req, res) => {
      const classes = req.body;
      const result = await classCollection.insertOne(classes);
      console.log(result);
      res.send(result);
    })
      //forums
      app.get("/forum", async (req, res) => {
        const cursor = forumCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
  
      app.post("/forum", async (req, res) => {
        const forums = req.body;
        const result = await forumCollection.insertOne(forums);
        console.log(result);
        res.send(result);
      })


    //subscribers
    app.get("/subscriber", async (req, res) => {
      const cursor = subscriberCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/subscriber", async (req, res) => {
      const subscriber = req.body;
      const result = await subscriberCollection.insertOne(subscriber);
      console.log(result);
      res.send(result);
    })


    //trainers
    app.get("/trainer", async (req, res) => {
      const cursor = trainerCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/trainer", async (req, res) => {
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

    app.patch("/trainer/trainer/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'trainer'
        }
      }
      const result = await trainerCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    //send ping
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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