const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yohkm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('primary-school-erp');
        const studentCollection = database.collection('students');
        const usersCollection = database.collection('users');

        //get

        //GET ALL PRODUCTS
        app.get('/allStudents', async (req, res) => {
            const cursor = studentCollection.find({});
            const students = await cursor.toArray();
            res.json(students);
        });

        //GET ALL PRODUCTS
        app.get('/students', async (req, res) => {
            const studentClass = req.query.class;
            const year = req.query.year;

            const query = { class: parseInt(studentClass), year: parseInt(year) }

            const cursor = studentCollection.find(query);
            const students = await cursor.toArray();
            res.json(students);
        });

        //GET  PRODUCTS BY ID
        app.get('/manageProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query);
            res.json(product);
        });


        //GET  USERS WHO ARE ADMIN
        app.get('/users', async (req, res) => {
            const role = req.query.role;

            const query = { role: role }

            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.json(users);
        });

        //GET  USERS BY IS
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            console.log(user?.role);
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //POST

        //ADD NEW STUDENT
        app.post('/allStudents', async (req, res) => {
            const student = req.body;
            const result = await studentCollection.insertOne(student);
            res.json(result)
        });

        //ADD NEW USER
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        });


        //PUT

        //ADD NEW USER IF NOT HAVE
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //MAKE ADMIN
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })



        //UPDATE PRODUCT
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: { ...product }
            };
            const result = await productCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //DELETE

        //DELETE BOOKING
        app.delete('/students/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentCollection.deleteOne(query);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Primary School ERP !')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})