var express = require('express');
var router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');

process.env.TOKEN_SECRET = 'secret';

const {checkAuth} = require('../utils/auth');

var jwt = require('jsonwebtoken');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy(
  function (token, done) {
    // Ensure 'token' is a valid token before calling jwt.verify
    if (!token) {
      return done(null, false);
    }
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (err) { return done(err); }
      return done(null, decoded, { scope: "all" });
    });
  }
));

// NO PROBLEM - ONLY ADMINS
// Remove the volunteer
// CHECKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
router.patch('/api/event/removeVol/:id', passport.authenticate('bearer', 
{ session: false }), checkAuth, async function (req, res) {

   // Check if there's a warning message
   console.log(req.userRole2 + " WANTS TO PATCH -> REMOVE VOLUNTEER FROM EVENT");
   if (req.userRole2 != 'admin') {
     // Do not say it is role to user, just delete
     delete req.userRole2;
     // Send a warning response
     req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
     return res.status(403).json({ warning: req.unauthorizedPerson });
   }

  const db = await connectToDB();
  try {
    // Find the event by ID\
    //console.log("req.body.eventID", req.body.eventID);
    //console.log("req.body.volID", req.body.volID);

    const eventId = new ObjectId(req.body.eventID);
    const volId = new ObjectId(req.body.volID);
    //console.log("eventId", eventId);
    //console.log("volId", volId);

    const event = await db.collection("events").findOne({ _id: eventId });
    // Check if event exist.
    if(!event){
        console.log("Event not found.");
        return res.status(404).json({ message: "Event not found" });
    }

    // Remove volunteer, increase quota.
    let result = await db.collection("events").updateOne(
     { _id: eventId},
      {
        $pull: { volunteers: new ObjectId(volId) },
        $inc: {currentQuota: 1 }
      }
    );

    if (result.modifiedCount > 0) {
        // Now we will remove event from volunteer
        try {
          const volunteer = await db.collection("volunteers").findOne({ _id: volId });

          if(!volunteer){
            console.log("Volunteer not found.");
            return res.status(404).json({ message: "Volunteer not found" });
          }

          let result2 = await db.collection("volunteers").updateOne({ _id: volId}, // Be sure quota is bigger than 0
          {
            $pull: { eventsJoined: new ObjectId(eventId) }
          }
           );

          if(result2.modifiedCount > 0){
            res.status(200).json({ message: "Succesfully removed the volunteer from event." });
          }


        } catch(err2){
          //console.log(res.status);
          res.status(400).json({ message: err2.message });
        }
    } else {
      res.status(400).json({ message: "Event is not found, cannot add more volunteers." });
    }
  } catch (err) {
    //console.log(res.status);
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// NO PROBLEM - ONLY ADMINS
 // Remove the event
 // CHECKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
 router.patch('/api/event/remove/:id', passport.authenticate('bearer', 
 { session: false }), checkAuth, async function (req, res) {

    // Check if there's a warning message
    console.log(req.userRole2 + " WANTS TO PATCH -> REMOVE VOLUNTEER FROM EVENT");
    if (req.userRole2 != 'admin') {
      // Do not say it is role to user, just delete
      delete req.userRole2;
      // Send a warning response
      req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
      return res.status(403).json({ warning: req.unauthorizedPerson });
    }

   const db = await connectToDB();
   try {
     // Find the event by ID

    const eventId = new ObjectId(req.params.id);
    const volId = new ObjectId(req.body.volID);

     const event = await db.collection("events").findOne({ _id: eventId });
     // Check if event exist.
     if(!event){
         return res.status(404).json({ message: "Event not found" });
     }

     // Remove volunteer, increase quota.
     let result = await db.collection("events").updateOne(
      { _id: eventId},
       {
         $pull: { volunteers: volId },
         $inc: {currentQuota: 1 }
       }
     );

     if (result.modifiedCount > 0) {
         // Now we will remove event from volunteer
         try {
           const volunteer = await db.collection("volunteers").findOne({ _id: new ObjectId(req.body.volID) });

           if(!volunteer){
             console.log("Volunteer not found.");
             return res.status(404).json({ message: "Volunteer not found" });
           }

           let result2 = await db.collection("volunteers").updateOne({ _id: new ObjectId(req.body.volID)}, // Be sure quota is bigger than 0
           {
             $pull: { eventsJoined: new ObjectId(eventId) }
           }
            );

           if(result2.modifiedCount > 0){
             res.status(200).json({ message: "Succesfully removed the event, Volunteer ID removed." });
           }


         } catch(err2){
           res.status(400).json({ message: err2.message });
         }
     } else {
       res.status(400).json({ message: "Event is not found, cannot add more volunteers." });
     }
   } catch (err) {
     //console.log(res.status);
     res.status(400).json({ message: err.message });
   } finally {
     await db.client.close();
   }
 });

 // NO PROBLEM - ONLY VOLUNTEER
  // Assuming connectToDB is an asynchronous function
  router.post('/api/vol/event', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {
    
    // Check if there's a warning message
    console.log(req.userRole2 + " WANTS TO POST -> GET VOLUNTEER MYEVENTS");
    if (req.userRole2 != 'volunteer') {
      // Do not say it is role to user, just delete
      delete req.userRole2;
      // Send a warning response
      req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
      return res.status(403).json({ warning: req.unauthorizedPerson });
    }
    
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
    const perPage = 3; // Number of cards per page
    const eventsJoined = req.body.eventsJoined || []; // Assuming eventsJoined is an array of event IDs

    const db = await connectToDB();

    try {
      // Convert the event IDs to ObjectId
      const objectIdArray = eventsJoined.map(id =>new ObjectId(id));

      const totalEvents = eventsJoined.length;

      const totalPages = Math.ceil(totalEvents / perPage);

      const [events, eventstat] = await Promise.all([
        db.collection("events")
            .find({ _id: { $in: objectIdArray } })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .toArray(),
        db.collection("events")
            .aggregate([
                { $match: { _id: { $in: objectIdArray } } },
                { $group: { _id: "$organizer", total: { $sum: 1 } } }
            ])
            .toArray()
      ]);
      
      res.json({ events, totalPages, eventstat });
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  // NO PROBLEM - ONLY ADMINS
  // Assuming connectToDB is an asynchronous function
  router.post('/api/voladmin/event', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {

    // Check if there's a warning message
    console.log(req.userRole2 + " WANTS TO POST -> GET VOLUNTEER EVENTS");
    if (req.userRole2 != 'admin') {
      // Do not say it is role to user, just delete
      delete req.userRole2;
      // Send a warning response
      req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
      return res.status(403).json({ warning: req.unauthorizedPerson });
    }
    
    const eventsJoined = req.body.eventsJoined || []; // Assuming eventsJoined is an array of event IDs
    const db = await connectToDB();
    try {
      // Convert the event IDs to ObjectId
      const objectIdArray = eventsJoined.map(id =>new ObjectId(id));
      // Find events where the _id is in the objectIdArray
      const events = await db.collection("events")
        .find({ _id: { $in: objectIdArray } })
        .toArray();
      res.json({ events });
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  // NO PROBLEM - EVERYONE
  // Assuming connectToDB is an asynchronous function
  router.get('/api/event', async function (req, res) {
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter
    const perPage = 6; // Number of cards per page

    const db = await connectToDB();

    try {
      const totalEvents = await db.collection("events").countDocuments();
      const totalPages = Math.ceil(totalEvents / perPage);

      const events = await db.collection("events")
        .find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .toArray();
      
      res.json({ events, totalPages });
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  // NO PROBLEM - EVERYONE
  // Search Bookings
  router.get('/api/event/search', async function (req, res) {
      const db = await connectToDB(); 
      try {
          let query = {};
          if (req.query.title) {
              // query.email = req.query.email;
              query.title = { $regex: req.query.title };
          }
          
          let page = parseInt(req.query.page) || 1;
          let perPage = parseInt(req.query.perPage) || 6;

          let skip = (page - 1) * perPage;
          let events = await db.collection("events").find(query).skip(skip).limit(perPage).toArray();

          let totalEvents = await db.collection("events").find(query).count();
          const totalPages = Math.ceil(totalEvents / perPage);    

          res.json({ events, totalPages});
      } catch (err) {
          res.status(400).json({ message: err.message });
      }
      finally {
          await db.client.close();
      }
  });

  // NO PROBLEM - EVERYONE
  /* Display a single event for EVERYONE */
  router.get('/api/event/detail/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
        if (result) {
          res.json({ events: result });
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
  });

  // NO PROBLEM - ONLY ADMINS
  /* Display a single event ADMIN */
  router.post('/api/event/detailadmin/:id', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {

    // Check if there's a warning message
    console.log(req.userRole2 + " WANTS TO POST -> DISPLAY EVENT FOR ADMIN PAGE");
    if (req.userRole2 != 'admin') {
      // Do not say it is role, just delete
      delete req.userRole2;
      // Send a warning response
      req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
      return res.status(403).json({ warning: req.unauthorizedPerson });
    }  
    const db = await connectToDB();
    try {
        let result = await db.collection("events").findOne({ _id: new ObjectId(req.params.id)});
        if (result) {

          // Convert the event IDs to ObjectId
          const objectIdArray = result.volunteers.map(id =>new ObjectId(id));

          const volunteers = await db.collection("volunteers")
            .find({ _id: { $in: objectIdArray } })  
            .toArray();

          res.json({ event_volunteers: volunteers });
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
  });

  // NO PROBLEM - ONLY ADMINS
  // Add Admin ID (Signature) to the Event.
   router.patch('/api/event/manager/:id', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {
      // Check if there's a warning message
      console.log(req.userRole2 + " WANTS TO PATCH -> ADMIN TO THE EVENT");
      if (req.userRole2 != 'admin') {
        // Do not say it is role, just delete
        delete req.userRole2;
        // Send a warning response
        req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
        return res.status(403).json({ warning: req.unauthorizedPerson });
      }
    
    const db = await connectToDB();
    try {
      let result = await db.collection("events").updateOne({ _id: new ObjectId(req.params.id) },
        {
          $set: { manager: new ObjectId(req.user._id) }
        }
      );
      if (result) {
        res.status(200).json({ message: "Event succesfully created, Admin ID added." });
      } else {

        res.status(404).json({ message: "Event not found" });
      }
    } catch (err) {

      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  // NO PROBLEM - EVERYONE
  // Get /event/new and render event_new.ejs
  router.get('/event/new', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res){
    // Check if there's a warning message
    console.log(req.userRole2 + " WANTS TO GET -> NEW EVENT");
    if (req.userRole2 != 'admin') {
      // Do not say it is role, just delete
      delete req.userRole2;
      // Send a warning response
      req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
      return res.status(403).json({ warning: req.unauthorizedPerson });
    }
    
    const db = await connectToDB(); // Assuming connectToDB is an asynchronous function

    try {
      const events = await db.collection("events").find().toArray();

      res.render('event_new', { events: events });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  // NO PROBLEM - ONLY ADMINS
  /* Handle the Form + */ 
  router.post('/api/event', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {

      // Check if there's a warning message
      console.log(req.userRole2 + " WANTS TO POST-> NEW EVENT");
      if (req.userRole2 != 'admin') {
        // Do not say it is role, just delete
        delete req.userRole2;
        // Send a warning response
        req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
        return res.status(403).json({ warning: req.unauthorizedPerson });
      }
      
      const db = await connectToDB();
      try {
        req.body.quota = parseInt(req.body.quota);
        req.body.createdAt = new Date();
        req.body.modifiedAt = new Date();
        req.body.currentQuota = parseInt(req.body.quota);
    
  
        let result = await db.collection("events").insertOne(req.body);
        res.status(200).json({message: result.insertedId});
      } catch (err) {
        res.status(400).json({ message: err.message });
      } finally {
        await db.client.close();
      }
  });
    
  // NO PROBLEM - ONLY ADMINS
  // Delete a single event +
  router.delete('/api/event/delete/:id', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {

      
    const db = await connectToDB();
    // Check if there's a warning message
    console.log(req.userRole2 + " WANTS TO DELETE -> EVENT");
    if (req.userRole2 != 'admin') {
      // Do not say it is role, just delete
      delete req.userRole2;
      // Send a warning response
      req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
      return res.status(403).json({ warning: req.unauthorizedPerson });
    }

    const eventID = new ObjectId(req.params.id);
    //console.log("Event ID", eventID);

    let eventsJO = await db.collection("events").findOne({ _id: eventID });
    if (!eventsJO) {
      return res.status(404).json({ message: "Event Not Found." });
    }

    const volunteersJoined = eventsJO.volunteers || [];
    //console.log("Volunteers Joined", volunteersJoined);

    // Remove the event from each volunteer's eventJoined array
    for (let k = 0; k < volunteersJoined.length; k++) {
      const volId = volunteersJoined[k]; // Assuming _id contains the ObjectId
      //console.log("VolunteerID", volId);
      await db.collection("volunteers").updateOne(
        { _id: volId },
        { $pull: { eventsJoined: eventID }}
      );
    }
    try {
      let result = await db.collection("events").deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Event deleted" });
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
  });
  
  // NO PROBLEM - ONLY ADMINS
  // display the update form +
  router.get('/api/event/edit/:id', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {

          // Check if there's a warning message
      console.log(req.userRole2 + " WANTS TO GET -> EDIT EVENT");
      if (req.userRole2 != 'admin') {
        // Do not say it is role, just delete
        delete req.userRole2;
        // Send a warning response
        req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
        return res.status(403).json({ warning: req.unauthorizedPerson });
      }
    
          
    const db = await connectToDB();
    try {
      let result = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
      if (result) {
        res.json({ events: result });
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  // NO PROBLEM - ONLY ADMINS
  // Update a single Booking +
  // CHECKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK
  router.put('/api/event/update/:id', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {

      // Check if there's a warning message
      console.log(req.userRole2 + " WANTS TO PUT -> UPDATE EVENT");
      if (req.userRole2 != 'admin') {
        // Do not say it is role, just delete
        delete req.userRole2;
        // Send a warning response
        req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
        return res.status(403).json({ warning: req.unauthorizedPerson });
      }
      
    const db = await connectToDB();
    try {
      req.body.quota = parseInt(req.body.quota);
      req.body.title = req.body.title;
      req.body.modifiedAt = new Date();
      req.body.currentQuota += req.body.impCurrent;
      
      delete req.body.impCurrent;
      delete req.body._id;
      let result = await db.collection("events").updateOne({ _id: new ObjectId(req.params.id) },
       { $set: req.body });

      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Booking updated" });
      } else {
        res.status(404).json({ message: "Event not found" });
      }
    } catch (err) {
      res.status(400).json({ message: err.message });
    } finally {
      await db.client.close();
    }
  });

  // NO PROBLEM - ONLY VOLUNTEER
  // Join to the event

  // ALL GOOD
  router.patch('/api/event/add/:id', passport.authenticate('bearer', 
  { session: false }), checkAuth, async function (req, res) {
      // Check if there's a warning message
      
    console.log(req.userRole2 + " WANTS TO PATCH -> ADD VOLUNTEER TO EVENT");
    if (req.userRole2 != 'volunteer') {
      // Do not say it is role to user, just delete
      delete req.userRole2;
      // Send a warning response
      req.unauthorizedPerson = 'Unauthorized! Access Blocked.';
      return res.status(403).json({ error: req.unauthorizedPerson });
    }
  
    const db = await connectToDB();
    try {
      // Find the event by ID
      //console.log("req.params.id", req.params.id);
      //console.log("req.user._id", req.user._id);

      const eventId = new ObjectId(req.params.id);
      const volkId = new ObjectId(req.user._id);

      // Find the event by ID
      //console.log("eventId", eventId);
      //console.log("volkId", volkId);

      const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });

      // Check if event exist.
      if(!event){
          console.log("Event not found.");
          const errorMessage = "Event not found.";
          return res.status(404).json({ error: errorMessage  });
      }

      // Check if the quota is okay
      if (event.currentQuota <= 0) {
        const errorMessage = "Event is full, sorry cannot add more volunteers.";
        console.log(errorMessage);
        return res.status(400).json({ error: errorMessage });
      }

      //console.log(event.volunteers);

        // Check if the volunteer is already in the event
       if (event.volunteers && event.volunteers.some(volunteerId => volunteerId.equals(new ObjectId(req.user._id)))) {
          const errorMessage = "Volunteer have already joined this event.";
          console.log("Volunteer have already joined this event.");
          return res.status(400).json({ error: errorMessage });
      }

      // Add volunteer, decrease quota.
      let result = await db.collection("events").updateOne({ _id: new ObjectId(req.params.id) , currentQuota: { $gt:0}}, // Be sure quota is bigger than 0
        {
          $addToSet: { volunteers: new ObjectId(req.user._id) },
          $inc: {currentQuota: -1 }
        }
      );

      if (result.modifiedCount > 0) {
          // Now we will add event to volunteer
          try {
            const volunteer = await db.collection("volunteers").findOne({ _id: new ObjectId(req.user._id) });

            if(!volunteer){
              const errorMessage = "Volunteer not found.";
              console.log("Volunteer not found.");
              return res.status(404).json({ error: errorMessage });
            }

            // Add volunteer, decrease quota.
            let result2 = await db.collection("volunteers").updateOne({ _id: new ObjectId(req.user._id)}, // Be sure quota is bigger than 0
            {
              $addToSet: { eventsJoined: new ObjectId(eventId) }
            }
             );

            if(result2.modifiedCount > 0){
              res.status(200).json({ error: "Succesfully attended to event, Volunteer ID added." });
            }


          } catch(err2){
            //console.log(res.status);
            res.status(400).json({ error: err2.message });
          }
      } else {
        res.status(400).json({ error: "Event is full or not found, cannot add more volunteers." });
      }
    } catch (err) {
      //console.log(res.status);
      res.status(400).json({ error: err.message });
    } finally {
      await db.client.close();
    }
  });
    
module.exports = router;

