const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
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
    const upcoomingProjectsCollection =
      database.collection("upcommingProjects");
    const topProjectCollection = database.collection("topProjects");
    const testimonialCollection = database.collection("testimonials");
    const saleFlatCollection = database.collection("saleFlats");
    const rentedFlatCollection = database.collection("rentedFlats");
    const userCollection = database.collection("users");
    const orderCollection = database.collection("orders");

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

    // GET API - Sale Flats
    app.get("/sale-flats", async (req, res) => {
      const cursor = saleFlatCollection.find({});
      const saleFlats = await cursor.toArray();
      res.json(saleFlats);
    });

    // GET API - Top Sale Flats
    app.get("/top-sale-flats", async (req, res) => {
      const cursor = saleFlatCollection.find({});
      const topSaleFlats = await cursor.limit(4).toArray();
      res.json(topSaleFlats);
    });

    // GET API - Single Flat Details
    app.get("/sale-flats/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const flatDetail = await saleFlatCollection.findOne(query);
      res.json(flatDetail);
    });

    // GET API - Top Rented Flats
    app.get("/top-rented-flats", async (req, res) => {
      const cursor = rentedFlatCollection.find({});
      const topRentedFlats = await cursor.limit(4).toArray();
      res.json(topRentedFlats);
    });

    // GET API - Rented Flats
    app.get("/rented-flats", async (req, res) => {
      const cursor = rentedFlatCollection.find({});
      const rentedFlats = await cursor.toArray();
      res.json(rentedFlats);
    });
    app.get("/rented-flats/:id", async (req, res) => {
      // GET API - Single Rented Flat Detail
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const flatDetail = await rentedFlatCollection.findOne(query);
      res.json(flatDetail);
    });

    // POST - Add user data to Database
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.json(result);
      console.log(result);
    });

    // PUT - Update user data to database for third party login system
    app.put("/users", async (req, res) => {
      const userData = req.body;
      const filter = { email: userData.email };
      const options = { upsert: true };
      const updateDoc = { $set: userData };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // GET - Admin Status
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
        res.json({ admin: isAdmin });
      } else {
        res.json({ admin: isAdmin });
      }
    });

    // POST - Place order
    app.post("/place-order", async (req, res) => {
      const order = req.body;
      order["status"] = "Pending";
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // GET - Orders for specific user
    app.get("/my-orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      if ((await cursor.count()) > 0) {
        const orders = await cursor.toArray();
        res.json(orders);
      } else {
        res.json({ message: "Product Not Found!" });
      }
    });

    // Delete - an order by user
    app.delete("/my-orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json({ deletedCount: result.deletedCount, deletedId: id });
    });

    // POST - User Review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await testimonialCollection.insertOne(review);
      res.send(result);
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
