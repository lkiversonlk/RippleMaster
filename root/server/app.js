var express = require('express');
var passport = require('passport')
    ,LocalStrategy = require('passport-local').Strategy
    ,GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var flash = require('connect-flash');
var Host = require("./Host").Host;
var Log = require('log').log;
var Common = require('./Ripple/Share').Common;
var Protocol = require('./Ripple/Share').Protocol;
var http = require('http');
var querystring = require('querystring');
var MemoryStore = express.session.MemoryStore;

Log.SetLevel(Log.DEBUG_LEVEL);

var options = {};
options.servers = Common.RP_SERVERS;
options.debugging = true;
options.algorithm = 'aes-256-cbc';
options.dbKey = "37712CCD76BA9C1E232D1394F74AF";
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
            host.LoginLocalAccount(user, passwd, function(result, type, unique){
                if(result === Common.RESULT.SUCC){
                    return done(null, type + unique);
                }else{
                    return done(null, false, {message : "fail"});
                }
            })
        }
    )
);

passport.use(new GoogleStrategy({
    clientID : '726839628263-npo0nhne7nl7hbi8h6knrsgfojipa4tq.apps.googleusercontent.com',
    clientSecret : 'cabYu_aiqgjRUkXht1l22-t7',
    callbackURL : "http://www.ripplemaster.net/oauth2callback"
    },
    function(accessToken, refreshToken, profile, done){
        var email = null;
        if(profile.emails.length > 0) email = profile.emails[0].value;
        host.CreateOrUpdateOAuthAccount(profile.id, ACCOUT_TYPE_PRE.GOOGLE, profile.displayName, email, function(result, type, unique){
            if(result === Common.RESULT.SUCC){
                done(null, type + unique);
            }else{
                done(null, false, {message : 'fail'});
            }
        })
    }
));

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
app.use(express.session({secret:options.sessionKey, store : new MemoryStore()}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(flash());

app.get("/", function(req, res){
    if(req.user){
        res.sendfile("./main/ripplemaster.html");
    }else{
        res.redirect("/login.html");
    }
});


app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login.html' }));

function verify(ip, chanllenge, response, callback){
    var data = {
        remoteip : ip,
        challenge : chanllenge,
        response : response,
        privatekey : '6LenxfMSAAAAAPghVZnriCOIkp1HmdNNYgsis33Q'
    };
    var data_send = querystring.stringify(data);
    var req_opt = {
        host : 'www.google.com',
        path : '/recaptcha/api/verify',
        port : 80,
        method : "POST",
        headers : {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length' : data_send.length
        }
    };

    var request = http.request(req_opt, function(httpRes){
        var body = '';
        httpRes.on('error', function(err){
            callback(false);
        });
        httpRes.on('data', function(chunk){
            body += chunk;
        });
        httpRes.on('end', function(){
            var success, error_code, parts;

            parts = body.split('\n');
            success = parts[0];

            if(success !== 'true'){
                callback(false);
            }else{
                callback(true);
            }
        })
    });
    request.write(data_send, "utf8");
    request.end();
}

app.post('/register', function(req, res) {
    var account = req.body.account;
    var password = req.body.password;
    var email = req.body.email;
    host.InitLocalAccount(account, password, email, function(result, type, unique){
        if(result === Common.RESULT.SUCC){
            req.login(type+unique, function(err){
                res.redirect("/");
            });
        }else{
            res.redirect("/signup.html");
        }
    });
    //verify the recaptcha:
    /*
    verify(req.connection.remoteAddress,
           req.body.recaptcha_challenge_field,
           req.body.recaptcha_response_field,
           function(result){
               if(result){
                   res.redirect("/signup.html");
               }else{
                   res.sendfile("./main/ripplemaster.html");
               }
           });
    */
});
app.get("/rpstatus", function(req, res){
    if(req.user){
        host.RpStatus(function(result, status){
            if(result == Common.RESULT.SUCC){
                res.json(status);
            }else{
                res.json({fail:"true"});
            }
        })
    }
});

app.get('/accountinfo', function(req, res){
    if(req.user){
        var user = req.user;
        var type = user.substr(0,1);
        var unique = user.substr(1);
        host.FindAccount(type, unique, function(result, account){
            if(result == Common.RESULT.SUCC, account){
                account = account.toObject();
                if(account['password']) delete account['password'];
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

app.post('/accountinfo', function(req, res){
    if(req.user){
        var user = req.user;
        var type = user.substr(0,1);
        var unique = user.substr(1);
        var comm = req.body.comm;
        switch (comm){
            case Protocol.Comm.SyncAddress:
                var data = req.body[Protocol.Keys.Addresses];
                host.UpdateAccountAddress(type, unique, data);
                break;
        }
    }
});

app.get("/addressinfo", function(req, res){
    if(req.user){
        var address = req.query.address;
        var ledger = req.query.ledger;
        if(!address || ! ledger){
            req.pause();
            res.status = 400;
            res.end("format error");
        }
        host.AddressInfo(address, ledger, function(result, addressInfo){
            if(result != Common.RESULT.SUCC){
                req.pause();
                res.status = 400;
                res.end("account not exists");
            }else{
                res.json(addressInfo);
            }
        })
    }
});

//google login
app.get('/auth/google',passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }),function(req, res){});

app.get('/oauth2callback', passport.authenticate('google', {successRedirect:'/',failureRedirect:'/login.html'}));



host.Work(function(){
    app.listen(80);
});


