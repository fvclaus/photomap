
/**
 * Module dependencies.
 */

require.paths.unshift('/usr/local/lib/node_modules');
var express = require('express');
var fs = require("fs");

var reston = require("Reston");
var DomJS = require("dom-js").DomJS;
var domjs = new DomJS();
var xml2js = require("xml2js");
var sqlite = require("sqlite");
var Encoder = require("node-html-encoder").Encoder;
var encoder = new Encoder("entity");
var form = require("connect-form");
var exec = require("child_process").exec;
var path = require("path");
var fs = require("fs");
var urlpaser = require("url");
var passwordHash = require("password-hash");
var sprintf = require("sprintf").sprintf;

var db_path = "map.sqlite";
// db scheme // sqlite3
// create table users(id integer primary key,login text not null,password text not null);
// create table albums(id integer primary key  autoincrement, name text not null, desc text );
// create table permissons(user integer references users(id) on delete cascade not null,album integer references album(id) on delete cascade not null);
// create table places(id integer primary key autoincrement, album integer references albums(id) on delete cascade, name text not null, desc text, lat real not null, lng real not null);
// create table photos(id integer primary key autoincrement, place integer references places(id) on delete cascade, source text not null, thumb text not null, name text not null, desc text,"order" integer);


console.log("guest password %s",passwordHash.generate("Moh8ai3"));
var db = new sqlite.Database();
db.open(db_path,function(err){
    if (err){
	throw err;
    }
    db.execute("PRAGMA foreign_keys = ON",function(){});
});

var authCheck = function (req, res, next) {
    //guest Moh8ai3
    //admin xu1Eid
    url = req.urlp = urlpaser.parse(req.url, true);

    // Logout
    switch(url.pathname){
    case "/logout" : req.session.destroy();next();return;
    case "/login" : next();return;
    }
    // Is User already validated?
    if (req.session && req.session.auth == true) {
	if(url.pathname.match("update|insert|delete") && req.method == "POST"){
	    if (req.session.user.login === "admin"){
		next();
	    }
	    else {
		res.json({
		    error : "not authorized"
		});
	    }
	}
	else {
	    next();
	}
	return;
    }
    var login = req.param("login");
    var password = req.param("password");

    if (login != null && password != null){
	console.log("login %s",login);
	console.log("passwd %s",password);

	var sql = "select * from users where login = $login";
	var sqlVars = {
	    $login : login
	};
	db.execute(sql,sqlVars,function(err,users){
	    if (err) {
		res.redirect("/error");
		console.log(err);
		return;
	    }
	    var user = users[0] || null;
	    if (user && passwordHash.verify(password,user.password)){
		user.password = password;
		req.session.auth = true;
		req.session.user = user;
		var year  =  365 * 24 * 60  * 60 * 1000;
		res.cookie("user",user.login,{maxAge : year, expires : new Date(Date.now()+ year)});
		next();
		return;
	    }
	    else{
		res.redirect("/login?auth=false");
		return;
	    }
	});
	return;
    }

    // User is not unauthorized. redirect to login page
    res.redirect("/login");
    return;
};

var app = module.exports = express.createServer(
    form({keepExtensions:true})
);

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'ew2xa3ahw6zohxitu8ameTeixahz' }));
    app.use(require("stylus").middleware({
	src: __dirname + '/public',
	force : true,
	warn : true,
	compress: false 
    }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


// Routes
app.set("view options",{
    layout : false
});

app.get("/login",authCheck,function(req,res){
    var host = "http://"+req.header("host");
    res.render("login",{
	locals :  {
		url : host+req.url,
               imgurl : host+"/images/icon.png"
		    
	}
    });
});

app.get("/logout",authCheck,function(req,res){
    var host = "http://"+req.header("host");
    res.render("login",{
	locals :  {
		url : host+req.url,
               imgurl : host+"/images/icon.png"
		    
	}
    });
});

app.get('/',authCheck, function(req, res){
    res.render('index');
});

app.get("/insert-place",authCheck,function(req,res){
    res.render("insert-place");
});

app.post("/insert-place",authCheck,function(req,res){
    var lat = req.param("place-lat");
    var lng = req.param("place-lng");
    var name = encoder.htmlEncode(req.param("place-name"));
    var desc = encoder.htmlEncode(req.param("place-desc"));

    if (lat == null || lng == null || name == null){
	res.json({
	    error : "one of lat,lng,name is null"
	});
	return;
    };

    db.execute("insert into places(album,name,desc,lat,lng) values(1,$name,$desc,$lat,$lng)",{
	$name : name,
	$desc : desc,
	$lat : lat,
	$lng : lng
    },function(err,rows){
	if (err){
	    res.json({
		error: err
	    });
	    return;
	}

	db.execute("select id from places where lat = $lat and lng = $lng",{
	    $lat : lat,
	    $lng : lng
	},function(err,places){
	    console.dir(places);
	    if (places.length != 1){
		res.json({
		    error : "result has too many rows"
		});
		return;
	    }
	    res.json({
		success : "success",
		"place-id" : places[0].id
	    });

	});
    });
});

app.get("/update-place",authCheck,function(req,res){
    res.render("update-place");
});

app.post("/update-place",authCheck,function(req,res){
    
    var id = req.param("place-id");
    var name = encoder.htmlEncode(req.param("place-name"));
    var desc = encoder.htmlEncode(req.param("place-desc"));

    if (id == null || desc == null){
	res.json({
	    error : "one of id or name is null"
	});
	return;
    }

    db.execute("update places set name = $name,desc = $desc where id = $id",{
	$name : name,
	$desc : desc,
	$id : id,},function(err){
	if (err){
	    res.json({
		error: err
	    });
	    console.log(err);
	    return;
	}
	res.json({
	    success : "success"
	});

    });
});



app.get("/update-photo",authCheck,function(req,res){
    res.render("update-photo");
});

//inserts into photos
app.post("/update-photo",authCheck,function(req,res,next){
    var id = req.param("photo-id");
    var name = encoder.htmlEncode(req.param("photo-name"));
    var desc = encoder.htmlEncode(req.param("photo-desc"));
    var order = encoder.htmlEncode(req.param("photo-order")) || null;

    if (id == null || name == null){
	res.json({
	    error : "one of id,name,desc was null"
	});
	return;
    }


    db.execute("update photos set name = $name,desc = $desc,\"order\" = $order where id = $id",{
	$name : name,
	$desc : desc,
	$order : order,
	$id : id},function(err){
	if (err){
	    res.json({
		error : err
	    });
	    return;
	}
	res.json({
	    success: "success"
	});
    });
});

app.post("/update-photos",authCheck,function(req,res){
    console.log(req.param("photos"));
    var photos = JSON.parse(req.param("photos"));
    console.dir(photos);
    if (photos instanceof Array && photos.length > 0){
	photos.forEach(function(photo){
	    var request = reston.post("http://localhost:3000/update-photo");
	    request.on("error",function(err){
		// console.log("err");
	    });
	    request.send({
		"photo-id" : photo.id,
		"photo-name" : photo.name,
		"photo-desc": photo.desc,
		"photo-order" : photo.order,
		login : req.session.user.login,
		password : req.session.user.password
	    });

	});
    }
    res.json({
	success : "success"
    });
});

app.get("/insert-photo",authCheck,function(req,res){
    res.render("insert-photo",{locals : {placeId : req.param("placeId")}});
});

// imagemagick to resize
// convert 1.jpg -thumbnail x600 -resize '600x<' -resize 50%  -gravity center -crop 300x300+0+0 +repage 1_1.jpg

app.post('/insert-photo',authCheck, function(req, res, next){

    req.form.complete(function(err, fields, files){
	if (err) {
	    next(err);
	} else {
	    var filename = files["photo-img"].filename;
	    var imgPath = files["photo-img"].path;
	    var name = encoder.htmlEncode(fields["photo-name"]);
	    var desc= encoder.htmlEncode(fields["photo-desc"]);
	    var place = fields["photo-album"];

	    //change path to move to photos
	    var baseName = path.basename(imgPath);
	    var cwd = fs.realpathSync("public/photos");
	    var newPathFull = cwd+"/"+baseName;
	    var newPathShort = "photos/"+baseName;
	    var newThumbPathFull = cwd+"/thumb"+baseName;
	    var newThumbPathShort = "photos/thumb"+baseName;
	    //move file
	    var cmd = "mv "+imgPath+" "+newPathFull;
	    exec(cmd , function(err){
		if (err) {
		    res.render("insert-photo-fail",{locals : {
			error : err}});
		    console.log(err);
		    return;
		}
		//create 75x75 thumbnail
		exec("convert "+newPathFull+" -thumbnail x600 -resize '600x<' -resize 50%  -gravity center -crop 300x300+0+0 +repage "+newThumbPathFull,
		     function(err,stdout,stderr){
			 if (err) {
			     res.render("insert-photo-fail",{locals : {
				 error : err}});
			     console.log(err);
			     return;
			 }
			 var sql = "insert into photos(place,source,thumb,name,desc) values ($place,$source,$thumb,$name,$desc)";

			 db.execute(sql,{
			     $place: place,
			     $source : newPathShort,
			     $thumb : newThumbPathShort,
			     $name : name,
			     $desc : desc
			 },function (err){
			     if (err){
				 res.render("insert-photo-fail",{locals : {
				     error : err}});

				 console.log(err);
				 return;
			     }
			     res.render("insert-photo-success");
			 });
		     });
	    });
	}
    });
});



/* deletes photo from db and fs */
app.post("/delete-photo",authCheck,function(req,res){
    var id = req.param("photo-id");
    check = checkId(id);

    if (!check.success){
	res.json(check);
	return;
    }

    db.execute("select source,thumb from photos where id = $id",{$id : id},function(err,photos){
	if (err){
	    res.json({
		error: err.toString()
	    });
	    return;
	}
	photos = photos || new Array();
	deletePhoto(photos[0]);

	db.execute("delete from photos where id=$id",{$id : id},function(err,row){
		console.dir(row);
		if (err){
		    res.json({
			error: err.toString()
		    });
		    return;
		}
		
		res.json({
		    success : "success"
		});
	});
    });
});

/* deletes place as well as all photos from db and fs */
app.post("/delete-place",authCheck,function(req,res){

    var id = parseInt(req.param("place-id"));
    check = checkId(id);

    if (!check.success){
	res.json(check);
	return;
    }

    //TODO variable binding does not work for some reason
    db.execute("select * from photos where place="+id,function(err,photos){
	photos = photos || new Array();
	photos.forEach(function(photo){
	    deletePhoto(photo);
	});

	db.execute("delete from places where id=$id",{$id : id},function(err){
	    if (err){
		res.json({
		    error:err.toString()
		});
		return;
	    }
	    res.json({
		success : "success"
	    });
	});
    });
});

app.get("/album",authCheck,function(req,res){
    // top level object
    var album = {};
    db.execute("select * from albums",function(err,albums){
	if (err) throw err;
	album = albums[0];
	db.execute ("select * from places where album = $album",{$album : album.id},function(err,places){
	    if (err) throw err;
	    album.places = places;
	    var placeCounter = 0;
	    if (places.length == 0){
		res.json(album);
	    }
	    places.forEach(function(place){
		place.name = encoder.htmlDecode(place.name);
		place.desc = encoder.htmlDecode(place.desc);
		// select photos to places
		db.execute("select * from photos where place = $place",{$place : place.id},function(err,photos){
		    placeCounter++;
		    // save places
		    place.photos = photos;
		    photos.forEach(function(photo){
			photo.name = encoder.htmlDecode(photo.name);
			photo.desc = encoder.htmlDecode(photo.desc);
		    });
		    
		    if (placeCounter == album.places.length){
			res.json(album);
		    }
		});
	    });
	});
    });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

function getFullPicturePath(path){
    var base = fs.realpathSync("public");
    return base+ "/"+path;
}

function deletePhoto(photo){
    cmd = sprintf("rm -r %s %s",
		   getFullPicturePath(photo.thumb),
		   getFullPicturePath(photo.source)
		  );

    exec(cmd,function(err){
	if(err){
	    console.log(err);
	}
    });
}

function checkId(id){
    if (id == null || id == NaN || id < 0){

	return {
	    success : false,
	    error: "placeId "+id+" is null,not a number or negative"
	}
    }
    return {
	success : true
    }
}