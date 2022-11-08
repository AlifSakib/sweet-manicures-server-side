const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

require("dotenv").config();
require("colors");

const port = process.send.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

//test
app.get("/", (req, res) => {
  res.send("server is Ok");
});

//database setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4mqdriq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbConnect() {
  try {
    await client.connect();
    console.log("Database Connected".cyan);
  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect();

//services collections
const serviceCollection = client.db("Dlux").collection("services");
app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.limit(3).toArray();
    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.json({
      success: false,
    });
  }
});

app.get("/services/all", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    const count = await serviceCollection.estimatedDocumentCount();
    res.json({
      success: true,
      data: services,
      count: count,
    });
  } catch (error) {
    res.json({
      success: false,
    });
  }
});

app.post("/services", async (req, res) => {
  try {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    res.json({
      success: true,
    });
  } catch (error) {
    success: false;
  }
});

app.get("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    success: false;
  }
});

const reviewCollections = client.db("Dlux").collection("reviews");
app.post("/reviews", async (req, res) => {
  try {
    const review = req.body;
    const result = await reviewCollections.insertOne(review);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.json({
      success: false,
    });
  }
});

app.get("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { service_id: id };
    const cursor = reviewCollections.find(query).sort({ _id: -1 });
    const reviews = await cursor.toArray();
    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.json({
      success: false,
    });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    let query = {};
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    }

    const cursor = reviewCollections.find(query);
    const reviews = await cursor.toArray();
    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    success: false;
  }
});

app.delete("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollections.deleteOne(query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.json({
      success: false,
    });
  }
});
app.get("/review/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const review = await reviewCollections.findOne(query);
  res.send(review);
});

app.patch("/editReview/:id", async (req, res) => {
  try {
    const review = req.body;
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const option = { upsert: true };
    const updateReview = {
      $set: {
        img: review.image,
        message: review.message,
      },
    };
    const result = await reviewCollections.updateOne(
      filter,
      updateReview,
      option
    );
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
    });
  }
});

//listen
app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});
