var express = require('express');
var passport = require('passport')
    ,LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');


// Database
var mongoose = require('mongoose');
var models = require('./models');
var Account = models.Account;
//mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/ripplemaster');

passport.use(new LocalStrategy(
    {
        usernameField:'account',
        passwordField:'password'
    },
    function(user, passwd, done){
        Account.findOne({name : user, password : passwd}, function(err, doc){
           if(err){
               return done(null, false, {message : "not singed up yes"});
           }else{
               if(doc){
                   return done(null, user);
               }else{
                   return done(null, false, {message : "not singed up yes"});

               }
           }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret:'test'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(flash());

app.post('/login', passport.authenticate(
    'local',
    {
        successRedirect : '/ripplemaster',
        failureRedirect : '/',
        failureFlash : false
    })
);
app.post('/register', function(req, res){
    var account = req.body.account;
    if(account){
        Account.findOne({name:account}, function(err, doc){
            if(!err){
                if(doc != null){
                    res.redirect("/signup");
                }else{
                    var dbAccount = new Account({name:account, password:req.body.password});
                    dbAccount.save();
                    req.login(account, function(err){
                        res.redirect("/ripplemaster");
                    });
                }
            }else{
                res.redirect("/signup");
            }
        })
    }
    else{
        res.redirect("/signup");
    }
});

app.get("/", function(req, res){
    res.sendfile('./html/index.html');
});

app.get("/signup", function(req, res){
    res.sendfile('./html/signup.html');
});

app.get('/ripplemaster', function(req, res){
    console.log(req.user);
    if(req.user){
        res.sendfile('./html/ripplemaster.html');
    }else{
        res.redirect('/');
    }
})

app.get('/masteraccount', function(req, res){
    if(req.user){
        var user = req.user;
        Account.findOne({name : user}, function(err, doc){
            if(err){
                res.json(null);
            }else{
                if(doc){
                    res.json({account : doc.name, settings : doc.settings});
                }else{
                    res.json(null);
                }
            }
        });
    }
});

app.post('/masteraccount', function(req, res){
    if(req.user){
        var settings = req.body.settings;
        Account.findOne({name : req.user}, function(err, doc){
            if(err){
            }else{
                if(doc){
                    doc.settings = settings;
                    doc.save();
                }
            }
            res.end();
        });
    }
});

app.get('/logout', function(req, res){
    if(req.user){
        req.logout();
    }
    res.redirect("/");
});

app.get('/account')

app.listen(80);
