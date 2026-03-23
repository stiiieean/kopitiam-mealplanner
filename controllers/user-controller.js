const User = require('../models/user-model');

const bcrypt = require("bcrypt")

exports.home = (req, res) => {
    res.send("home")
};


exports.stats = (req, res) => {
    req.session.visit_count = req.session.visit_count + 1 || 1;
    res.send('Number of visits: ' + req.session.visit_count);
}

exports.registerGet = (req, res) => {
    res.render("register")
};

exports.registerPost = async (req, res) => {
    let userid = req.body.userid
    let username = req.body.username;
    let password = req.body.password;
    let agree = req.body.agree;
    let hashPassword = await bcrypt.hash(password,10);
    let newUser = {
        userid :userid,
        username : username,
        password : hashPassword,
        agree : agree ? true : false
    }

    

    try{
        let result = await User.addUser(newUser);
        // console.log("result",result)
        
        res.redirect("/login")
    } catch (error){
        res.send(error)
    }
};

exports.loginGet = (req, res) => {
    res.render("login")
};

exports.loginPost = async (req, res) => {
    let userid = req.body.userid;
    let password = req.body.password;

    // the idea is to fetch the user that matches a given username from the database
    // and check if the user's password matches against the password stored in the data base
    try {
        let user = await User.findUser(userid);

        // first check if the user exists in the database
        if(!user){
            console.log("User not found")
            return res.redirect('/login')
        }

        console.log(user)

        let match = await bcrypt.compare(password, user.password);
        if (match){
            req.session.user = {
                userid : user.userid
                
            }
            res.redirect("/home")
        } else{
            res.render("login",{failure:"'Invalid credentials"})
        }

    } catch (error){
        res.send(error)
    }
    
};

// exports.profile = (req, res) =>{
//     // check if the user exissts in session
//     // if yes, that means the user is already logging in
//     // otherwise. redirect tot login page
//     if (!req.session.user){
//         return res.redirect('/login')
//     }

//     res.render('profile',{user: req.session.user})
// };

// exports.adminProfile = (req, res) => {
//     if (!req.session.user){
//         return res.redirect('/login')
//     }
    
//     res.render("admin-profile",{user: req.session.user})
    
// };

// exports.logout = (req, res) => {
//     req.session.destroy( ()=>{
//         res.redirect('/')
//     })
// };
