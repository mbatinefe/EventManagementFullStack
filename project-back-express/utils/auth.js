const jwt = require('jsonwebtoken');
const { connectToDB } = require('../utils/db');

// generate a token
const generateToken = function (user) {
    return jwt.sign(user, process.env.TOKEN_SECRET, {
        expiresIn: 86400 // expires in 24 hours
    });
}

const checkAuth = async function (req, res, next) {
    // extra checking
    const db = await connectToDB();
    //console.log("\n");
    try {
        var admin = await db.collection("admins").findOne({ email: req.user.email});
        var volunteer = await db.collection("volunteers").findOne({ email: req.user.email});

        if(admin){
            req.userRole2 = 'admin';
        } else if(volunteer){
            req.userRole2 = 'volunteer';
        }else{
            req.userRole2 = 'unknown';
            req.unauthorizedPerson = 'Unauthorized Access Blocked.';
        }
        console.log("User Role Checked. Welcome: " + req.userRole2);
        next();

    }
    catch (err) {
        console.log("PROBLEM ON AUTH.");
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
}

const checkAuthSingle = async function (req, res, next) {
    // extra checking for Single Volunteer User
    const db = await connectToDB();
    //console.log(req.user);

    try {
        var volunteer = await db.collection("volunteers").findOne({ email: req.user.email});
        if (volunteer){
            req.userRole2 = 'volunteer';
            req._id = req.user._id;
            req.events = req.user.eventsJoined;
        } else{
            req.userRole2 = 'unknown';
            req.unauthorizedPerson = 'Unauthorized Access Blocked.';
        }
        console.log("User Role Checked. Welcome: " + req.userRole2);
        next();
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
}

module.exports = { generateToken, checkAuth, checkAuthSingle };
