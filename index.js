const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

require("dotenv").config();
require("colors");
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;
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

//verify Jwt

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}

//services collections
const serviceCollection = client.db("Dlux").collection("services");
app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query).sort({ _id: -1 });
    const services = await cursor.limit(3).toArray();
    res.send({
      success: true,
      data: services,
    });
  } catch (error) {
    res.send({
      success: false,
    });
  }
});

app.get("/allservices", async (req, res) => {
  try {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    const count = await serviceCollection.estimatedDocumentCount();
    res.send({
      success: true,
      data: services,
      count: count,
    });
  } catch (error) {
    res.send({
      success: false,
    });
  }
});

app.post("/services", async (req, res) => {
  try {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    res.send({
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
    res.send({
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
    res.send({
      success: true,
      data: result,
    });
  } catch (error) {
    res.send({
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
    res.send({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.send({
      success: false,
    });
  }
});

app.get("/reviews", verifyJWT, async (req, res) => {
  const decoded = req.decoded;
  if (decoded.email !== req.query.email) {
    res.status(403).send({ message: "Unauthorized Access" });
  }
  try {
    let query = {};
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    }

    const cursor = reviewCollections.find(query);
    const reviews = await cursor.toArray();
    res.send({
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
    res.send({
      success: true,
      data: result,
    });
  } catch (error) {
    res.send({
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
    res.send({
      success: true,
    });
  } catch (error) {
    res.send({
      success: false,
    });
  }
});

//jwt

app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
  res.send({ token });
});

//listen
app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});
