var express = require('express');
var passport = require('passport')
    ,LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var Host = require("./Host").Host;
var Log = require('log').log;
var Consts = require('./Ripple/Common').Consts;

Log.SetLevel(Log.DEBUG_LEVEL);

var options = {};
options.servers = Consts.RP_SERVERS;
options.debugging = true;
options.algorithm = 'aes-256-cbc';
options.dbKey = "justatest#@";
options.sessionKey = "a234fa@#NF";
options.db = "mongodb://localhost/ripplemaster";

var host = new Host(options);

passport.use(new LocalStrategy
    (
        {
            usernameField:'account',
            passwordField:'password'
        },
        function(user, passwd, done){
            host.LoginAccount(user, passwd, function(result){
                if(result === Consts.RESULT.SUCC){
                    return done(null, user);
                }else{
                    return done(null, false, {message : "fail"});
                }
            })
        }
    )
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

var app = express();
app.use(express.static(__dirname + '/web'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret:options.sessionKey}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(flash());

app.get("/", function(req, res){
    if(req.user){
        res.sendfile("./main/ripplemaster.html");
    }else{
        res.redirect("/index.html");
    }
});

app.post('/login',
    passport.authenticate('local'),
    function(req,res){
        if(req.user){
            res.sendfile("./main/ripplemaster.html");
        }else{
            res.redirect("/index.html");
        }
    }
);

app.get('/login',
    passport.authenticate('local'),
    function(req,res){
        if(req.user){
            res.sendfile("./main/ripplemaster.html");
        }else{
            res.redirect("/index.html");
        }
    }
);

app.post('/register', function(req, res) {
    var account = req.body.account;
    var password = req.body.password;
    var email = req.body.email;
    host.InitAccount(account, password, email, function (result) {
        if (result === Consts.RESULT.SUCC) {
            req.login(account, function(err){
                if(err){
                    res.redirect("/signup.html");
                }else{
                    res.sendfile("./main/ripplemaster.html");
                }
            });
        } else {
            res.redirect("/signup.html");
        }
    });
});

app.get('/masteraccount', function(req, res){
    if(req.user){
        var user = req.user;
        host.AccountInfo(user, function(result, account){
            if(result == Consts.RESULT.SUCC, account){
                res.json(account);
            }else{
                res.json({fail:"true"});
            }
        });
    }
});

app.get('/logout', function(req, res){
    if(req.user){
        req.logout();
    };
    res.redirect('/');
});

app.post('/masteraccount', function(req, res){
    if(req.user){
        var accountInfo = req.body.accountInfo;
        if(accountInfo){
            host.UpdateAccountInfo(accountInfo, function(result){
                if(result == Consts.RESULT.SUCC){
                    res.json({success:"true"});
                }else{
                    res.json({fail:"true"});
                }
            })
        }
    }
});

/*


app.get("/signup", function(req, res){
    res.sendfile('./html/signup.html');
});
*/

/*
app.get('/ripplemaster', function(req, res){
    console.log(req.user);
    if(req.user){
        res.sendfile('./html/ripplemaster.html');
    }else{
        res.redirect('/');
    }
})
*/
host.Work(function(){
    app.listen(80);
});


