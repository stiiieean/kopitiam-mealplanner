const User = require('../models/User');

const bcrypt = require("bcrypt")

exports.home = (req, res) => {
    res.send("home")
};


exports.stats = (req, res) => {
    req.session.visit_count = req.session.visit_count + 1 || 1;
    res.send('Number of visits: ' + req.session.visit_count);
}

exports.getRegister = (req, res) => {
    res.render("register")
};

exports.postRegister = async (req, res) => {
    let userid = req.body.userid
    let username = req.body.username;
    let password = req.body.password;
    let hashPassword = await bcrypt.hash(password,10);
    let newUser = {
        userid :userid,
        username : username,
        password : hashPassword
    }

    

    try{
        let result = await User.addUser(newUser);
        
        res.redirect("/login")
    } catch (error){
        res.send(error)
    }
};

exports.getLogin = (req, res) => {
    res.render("login",{failure:null})
};

exports.postLogin = async (req, res) => {
    let userid = req.body.userid;
    let password = req.body.password;

    try {
        let user = await User.findUser(userid);

        if(!user){
            console.log("User not found")
            return res.render("login",{failure:"Invalid credentials"})
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

