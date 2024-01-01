var express = require('express');
var router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');
const { generateToken } = require('../utils/auth');

router.get('/api/', async function (req, res) {
    const db = await connectToDB();
    try {
        let results = await db.collection("events").find().toArray();
        // Calculate timeAgo for each event's timestamp
        res.json({ events: results }); // Return JSON data
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

router.get('/home', async function (req, res) {
    const db = await connectToDB();
    try {
        let results = await db.collection("events").find().toArray();
        // Calculate timeAgo for each event's timestamp
        res.render('index', { events: results }); // Pass 'events' data to the template
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

router.post('/api/login', async function (req, res, next) {
    const db = await connectToDB();
    let token;
    try {
      // check if the user exists
      var user = await db.collection("volunteers").findOne({ email: req.body.email, password: req.body.password});
      var admin = await db.collection("admins").findOne({ email: req.body.email, password: req.body.password});
      if (!user && !admin) {
        console.log("Unknown, Access Denied.");
        res.status(401).json({ message: 'User not found' });
        return;
      } 
      else if(admin){ 
        console.log("Admin Access Granted.");
        delete admin.password;
        req.userRole = 'admin';
        token = generateToken(admin);
      } 
      else{
        // regular volunteer
        console.log("User Access Granted.");
        delete user.password;
        req.userRole = 'volunteer';
              // generate a JWT token
        token = generateToken(user);
      }
        // return the token
        res.json({ token: token, userRole: req.userRole });

    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
  });

  router.post('/api/check/email', async function (req, res, next) {
    const db = await connectToDB();
    console.log("Checking email from database...");
    try {
      // check if the user exists
      var user = await db.collection("volunteers").findOne({ email: req.body.email});

      if (user) {
        console.log("Email exist on the system.");
        res.status(400).json({ error: 'Email exist on the system.' });
        return;
      } else{
        // regular volunteer
        res.status(200).json({ message: 'Email does not exist on the system.' });
        return
      }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
  });


module.exports = router;
