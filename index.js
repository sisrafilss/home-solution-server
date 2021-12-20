const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.quv1r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("home_solution");
    const topProjectCollection = database.collection("topProjects");
    const upcoomingProjectsCollection = database.collection("upcommingProjects");
    const testimonialCollection = database.collection("testimonials");

    // GET API - Get Top projects
    app.get("/top-projects", async (req, res) => {
      const cursor = topProjectCollection.find({});
      const topProjects = await cursor.limit(4).toArray();
      res.json(topProjects);
    });

    // GET API - Get Upcomming projects
    app.get("/upcomming-projects", async (req, res) => {
        const cursor = upcoomingProjectsCollection.find({});
        const upcommingProjectsd = await cursor.limit(4).toArray();
        res.json(upcommingProjectsd);
      });

      // GET API - Get Testimonials
    app.get("/testimonials", async (req, res) => {
        const cursor = testimonialCollection.find({});
        const testimonials = await cursor.toArray();
        res.json(testimonials);
      });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Simple Express Server is Running");
});

app.listen(port, () => {
  console.log("Server has started at port:", port);
});
