var express = require('express');
var router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');

process.env.TOKEN_SECRET = 'secret';

const {checkAuth} = require('../utils/auth');

const {checkAuthSingle} = require('../utils/auth');

var jwt = require('jsonwebtoken');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
  function (token, done) {
    // Ensure 'token' is a valid token before calling jwt.verify
    if (!token) {
      //console.log(token);
      return done(null, false);
    }
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (err) { return done(err); }
      return done(null, decoded, { scope: "all" });
    });
  }
));


// NO PROBLEM - ONLY ADMINS
router.get('/api/volunteers', passport.authenticate('bearer', 
{ session: false }), checkAuth, async function (req, res) {
  // Check if there's a warning message
  console.log(req.userRole2 + " WANTS TO GET -> VOLUNTEERS");
  if (req.userRole2 != 'admin') {
    // Do not say it is role, just delete
    delete req.userRole2;
    // Send a warning response
    req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
    return res.status(403).json({ warning: req.unauthorizedPerson });
  }

  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
  const perPage = 3; // Number of cards per page

  const db = await connectToDB();

  try {
    const totalVolunteers = await db.collection("volunteers").countDocuments();
    const totalPages = Math.ceil(totalVolunteers / perPage);

    const volunteers = await db.collection("volunteers")
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();

    res.json({ volunteers, totalPages });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: err.message });
  } finally {
    await db.client.close();
  }

  // Do not say it is role, just delete
  delete req.userRole2;
});

// NO PROBLEM - EVERYONE
/* Handle the Form */
router.post('/api/become/volunteers', async function (req, res) {
  const db = await connectToDB();
  try {
    //console.log(req.body);

    req.body.email = req.body.email;
   
    req.body.createdAt = new Date();
    req.body.modifiedAt = new Date();

    //console.log(req.body);

    let result = await db.collection("volunteers").insertOne(req.body);

    res.status(200).json({ message: "Volunteer created."});
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// NO PROBLEM - EVERYONE
// Update a single volunteer
router.put('/api/become/volunteers/:id',  passport.authenticate('bearer', 
{ session: false }), checkAuth, async function (req, res) {
  const db = await connectToDB();
  try {
      // Check if there's a warning message
      console.log(req.userRole2 + " WANTS TO PUT -> SINGLE VOLUNTEER");
      if (req.userRole2 == 'unknown') {
        // Do not say it is role, just delete
        delete req.userRole2;
        // Send a warning response
        req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
        return res.status(403).json({ warning: req.unauthorizedPerson });
      }
      
      req.body.email = req.body.email;
      req.body.createdAt = new Date();
      req.body.modifiedAt = new Date();
      delete req.body._id;
      let result = await db.collection("volunteers").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

      if (result.modifiedCount > 0) {
          res.status(200).json({ message: "Volunteer updated" });
      } else {
          res.status(404).json({ message: "Volunteer not found" });
      }
  } catch (err) {
      res.status(400).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});

// NO PROBLEM - ONLY ADMINS
router.get('/api/volunteer/:id',  passport.authenticate('bearer', 
{ session: false }), checkAuth, async function (req, res) {
  // Check if there's a warning message
  console.log(req.userRole2 + " WANTS TO GET -> EDIT VOLUNTEER");
  if (req.userRole2 != 'admin') {
    // Do not say it is role, just delete
    delete req.userRole2;
    // Send a warning response
    req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
    return res.status(403).json({ warning: req.unauthorizedPerson });
  }

  const db = await connectToDB();
    try {
      let result = await db.collection("volunteers").findOne({ _id: new ObjectId(req.params.id) });
      if (result) {
        res.json({ volunteer: result });
      } else {
        res.status(404).json({ message: "volunteer not found" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
});

// NO PROBLEM - ONLY VOLUNTEER
router.get('/api/getsingle/volunteer',  passport.authenticate('bearer', 
{ session: false }), checkAuthSingle, async function (req, res) {
  // Check if there's a warning message
  console.log(req.userRole2 + " WANTS TO GET -> GET VOLUNTEER");

  if (req.userRole2 != 'volunteer') {
    // Do not say it is role, just delete
    delete req.userRole2;
    delete req._id;
    // Send a warning response
    req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
    return res.status(403).json({ warning: req.unauthorizedPerson });
  }

  const db = await connectToDB();
    try {
      let result = await db.collection("volunteers").findOne({ _id: new ObjectId(req._id) });
      if (result) {
        res.json({ volunteer: result });
      } else {
        res.status(404).json({ message: "volunteer not found" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
});

// NO PROBLEM - ONLY ADMINS
// Delete a single event
router.delete('/api/volunteer/delete/:id', passport.authenticate('bearer', 
{ session: false }), checkAuth, async function (req, res) {

  // Check if there's a warning message
  console.log(req.userRole2 + " WANTS TO DELETE -> VOLUNTEER");
  if (req.userRole2 != 'admin') {
    // Do not say it is role, just delete
    delete req.userRole2;
    // Send a warning response
    req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
    return res.status(403).json({ warning: req.unauthorizedPerson });
  }
   
  const db = await connectToDB();
  try {
    const volunteerId = new ObjectId(req.params.id);

    let volunteer = await db.collection("volunteers").findOne({ _id: volunteerId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    // Get the list of events the volunteer joined
    const eventsJoined = volunteer.eventsJoined || [];
    console.log("Volunteer ID", volunteerId);
    console.log("Events Joined", eventsJoined);

    // Remove the volunteer from each event's volunteers array
    for (let k = 0; k < eventsJoined.length; k++) {
      const eventId = eventsJoined[k]; // Assuming _id contains the ObjectId
      console.log("EventID", eventId);
      await db.collection("events").updateOne(
        { _id: eventId },
        { $pull: { volunteers: volunteerId },
          $inc: { currentQuota: 1 }
        }
      );
    }

    let result = await db.collection("volunteers").deleteOne({ _id: new ObjectId(req.params.id) });
      if (result.deletedCount > 0) {
          res.status(200).json({ message: "Volunteer deleted" });
      } else {
          res.status(404).json({ message: "Volunteer not found" });
      }
  } catch (err) {
      res.status(400).json({ message: err.message });
  } finally {
      await db.client.close();
  }
});


module.exports = router;
