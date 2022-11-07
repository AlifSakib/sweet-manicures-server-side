const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const services = await cursor.toArray();
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

//listen
app.listen(port, () => {
  console.log(`Server is listening to port ${port}`);
});
