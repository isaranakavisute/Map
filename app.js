  var http = require('http');


  var fs = require('fs');  


  const express = require("express");
  const session = require("express-session");
  const bodyParser = require("body-parser");
  const path = require("path");
  var formidable = require('formidable');

  var pg = require('pg');
  var conString = "postgres://isaranod_isara:23153645hI@isaranodejs.com:5432/isaranod_postgresql";
  var client = new pg.Client(conString);
  client.connect(function(err)
   {
    if (err)
     {
      fs.writeFile('mylog.txt', 'Cannot connect to db\n', function (err) {
      throw err;
      });
     }
    else
     {
      fs.writeFile('mylog.txt', 'Can Connect to db\n', function (err) {});
     }   
   });




  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  
  app.use(session({
     secret: 'secret',
     resave: true,
     saveUninitialized: true
   }));  
  

  app.get('/map', function(req, res)
   {
    res.sendFile("/home/isaranod/map/login.html");
   });

  
  app.post('/map/myfileupload',function(req,res)
           {
            
            var form = new formidable.IncomingForm(),
            files = [],
            fields = [];

                        
            form.uploadDir = __dirname + '/uploads';
            

            //res.end(__dirname);

            
            form
              .on('field', function(field,value) {
                  fields.push([field,value]);
                 })
              .on('file', function(field,file)   {
                  //res.end(file.path);
                  //fs.rename(file.name, form.uploadDir + "/" + file.name);
                  
                  fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
                  if (err) throw err;
                  //console.log('renamed complete');
                   });

                  files.push([field,file]);
                 })
              .on('end', function() {
                  res.end("uploaded completed\n");
                 });

              /*
              .on ('fileBegin', function(name, file){
              //rename the incoming file to the file's name
              file.path = form.uploadDir + "/" + file.name;
               });
             */

            form.keepExtensions = true;
            //form.keepsamename = true;
            form.keepFilenames = true;  
            form.parse(req);
            

            /*
            form.parse(req, function (err, fields, files) {

              var oldpath = files.myfile[0].path;
              var newpath = '/home/isaranod/map/myfiles/' + files.myfile[0].name;
              fs.appendFile('mylog.txt',oldpath, function (err) {
                       if (err) throw err;
                         });
              fs.appendFile('mylog.txt',newpath, function (err) {
                       if (err) throw err;
                         });
              fs.rename(oldpath, newpath, function (err) {
               if (err) throw err;
               //res.write('File uploaded and moved!');
               //res.end();
                   });

              oldpath = files.myfile[1].path;
              newpath = '/home/isaranod/map/myfiles/' + files.myfile[1].name;
              //oldpath = files.orders_data_file.path;
              //newpath = '/home/isaranod/map/myfiles/' + files.orders_data_file.name;
              fs.appendFile('mylog.txt',oldpath, function (err) {
                       if (err) throw err;
                         });
              fs.appendFile('mylog.txt',newpath, function (err) {
                       if (err) throw err;
                         });
              fs.rename(oldpath, newpath, function (err) {
               if (err) throw err;
               //res.write('File uploaded and moved!');
               //res.end();
                   });



                });
               */
               res.end("Files uploaded and moved");
               


           });
  
  app.post('/map/auth', function(req,myres)
   {
    var username = req.body.username;
    var password = req.body.password;
   
    
    if (username && password)
    {
     const query = {
                      text: "SELECT * from mylogin_tbl where myusername='"+username+"' and mypassword='"+password+"'",
                      rowMode: 'array',
                  };

   client
   .query(query)
   .then(res => {
                   if (res.rows.length)
                   {
                    
                    fs.appendFile('mylog.txt', 'query successful:login\n', function (err) {
                       if (err) throw err;
                       });
                     myres.sendFile("/home/isaranod/map/server_setup.html");   
                   }
                   else
                   {
                  
                    fs.appendFile('mylog.txt', 'query successful:not login\n', function (err) {
                       if (err) throw err;
                         });
                     myres.sendFile("/home/isaranod/map/re_login.html");
                   }
                    
                })
   .catch(e => {
                fs.appendFile('mylog.txt', 'query unsucessful\n', function (err) {
                if (err) throw err;
                   });
               });
   
   //myres.sendFile("/home/isaranod/map/showmap.html");  
   //myres.send("done");
    }
   });
  
  var server = http.createServer(app);
  server.listen();
  
