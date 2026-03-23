exports.home=(req,res)=>{
    res.render('home')
}

exports.logout=(req,res)=>{
    req.session.destroy( ()=>{
        res.redirect('/')
    })
}