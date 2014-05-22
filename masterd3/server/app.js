var express = require('express');
var passport = require('passport')
    ,LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var Host = require("./Host").Host;
var Log = require('log').log;
var Common = require('./Ripple/Share').Common;
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
            host.LoginAccount(user, passwd, function(result){
                if(result === Common.RESULT.SUCC){
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
app.use(express.session({secret:options.sessionKey, store : new MemoryStore()}));
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
    host.InitAccount(account, password, email, function(result){
        if(result === Common.RESULT.SUCC){
            req.login(account, function(err){
                res.sendfile("./main/ripplemaster.html");
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

app.get('/masteraccount', function(req, res){
    if(req.user){
        var user = req.user;
        host.AccountInfo(user, function(result, account){
            if(result == Common.RESULT.SUCC, account){
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
                if(result == Common.RESULT.SUCC){
                    res.json({success:"true"});
                }else{
                    res.json({fail:"true"});
                }
            })
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
        host.AddressInfo(address, ledger, function(result, addresInfo){
            if(result != Common.RESULT.SUCC){
                req.pause();
                res.status = 400;
                res.end("account not exists");
            }else{
                res.json(addresInfo);
            }
        })
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


