const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.129hgrr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const toyCollection = client.db("toysSet").collection("toys");

    app.post("/add-toys", async (req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(result);
    });


    app.delete('/toy/:id', async(req, res) =>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    app.put('/toyUpdate/:id', async(req, res) =>{
      const id = req.params.id;
      const body = req.body;
      const query = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedToy = {
       $set: {
        toyImg: body.toyImg,
        toyName: body.toyName,
        sellerName: body.sellerName,
        sellerEmail: body.sellerEmail,
        subCategory: body.subCategory,
        price: body.price,
        rating:rating,
        quantity: body.quantity,
        details: body.details,
        date: body.date,
       },
      };
      const result = await toyCollection.updateOne(query, updatedToy, options);
      res.send(result)
    })


    //get all toys
    app.get("/alltoys", async (req, res) => {
      const toys = await toyCollection.find().toArray();
      res.send(toys);
    });

    //get single toy by id
    app.get("/singleToys/:id", async (req, res) => {
      const toys = await toyCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(toys);
    });

    //search implementation
    app.get("/search/:text", async (req, res) => {
      const query = req.params.text;
      const data = await toyCollection
        .find({ toyName: { $regex: query, $options: "i" } })
        .toArray();
        res.json(data);
    });

    //get data by subCategory
    app.get("/alltoys/:subCategory", async (req, res) => {
      const { subCategory } = req.params;
      const toys = await toyCollection.find({ subCategory }).toArray();
      res.json(toys);
    });

    // get 20 data
    app.get("/twentyToys", async (req, res) => {
      const data = await toyCollection.find().limit(20).toArray();
      res.send(data);
    });

    //get data by email
    app.get("/myToys/:sellerEmail", async (req, res) => {
      const { sellerEmail } = req.params;
      const toys = await toyCollection.find({ sellerEmail }).toArray();
      res.json(toys);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy server is running");
});

app.listen(port, () => {
  console.log(`Toy Serve is running on the port: ${port}`);
});
