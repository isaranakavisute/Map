  var http = require('http');
  var fs = require('fs');  
  const express = require("express");
  const session = require("express-session");
  const bodyParser = require("body-parser");
  const path = require("path");
  var formidable = require('formidable');
  var redis = require("redis");

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


  app.set('views',__dirname + '/views');
  app.set('view engine','pug');
  
  

  app.get('/map', function(req, res)
   {
    res.sendFile("/home/isaranod/map/login.html");
   });

  
  app.post('/map/myfileupload',function(req,myres)
           {
            var region_tablename = req.body.region_tablename;
            var orders_tablename = req.body.orders_tablename;
            var user_tablename =  req.body.user_tablename;
            var region_regis_parameter =  req.body.region_regis_parameter;
            var orders_regis_parameter =  req.body.orders_regis_parameter;
            var user_regis_parameter =  req.body.user_regis_parameter;
            var city = req.body.city;
            var json_map = req.body.json_map;

            
            //myres.end(city);

            //save to REDIS
            /*
            var redis_client = redis.createClient();
            redis_client.on("connect", function() {});
            redis_client.set(region_regis_parameter, region_tablename);
            redis_client.set(orders_regis_parameter, orders__tablename);
            redis_client.set(user_regis_parameter, "user_tablename");
            */

            //upload file
            var form = new formidable.IncomingForm(),
            files = [],
            fields = [];
            
            form.uploadDir = __dirname + '/uploads';
                        
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
                  //res.end("uploaded completed\n");
                 });

         

            form.keepExtensions = true;
            form.keepFilenames = true;  
            form.parse(req);
            

            //res.end("done");
            
            var map_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection'" + " As type, array_to_json(array_agg(f))" +
                            " As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry," + " row_to_json((id, name)) As" 
                             + " properties FROM cambridge_coffee_shops As lg) As f) As fc";
            

            /*
            var map_query;
            if (city.toString()== "thailand")
             { 
                       
               map_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection'" + " As type, array_to_json(array_agg(f))" + 
                            " As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry," + " row_to_json((id, name)) As" + 
                            " properties FROM data_th_gov_region As lg) As f) As fc";
             
              map_query = "select province_name,province_name_th,district_name,geom from data_th_gov_region where id < 100";
             }
           else          
             {
               map_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection'" + " As type, array_to_json(array_agg(f))" +
                            " As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry," + " row_to_json((id, name)) As" +
                            " properties FROM cambridge_coffee_shops As lg) As f) As fc";
             }
          */





            
            //res.end("done");

            //var map_query = "select province_name,province_name_th,district_name,geom from data_th_gov_region where id < 100";

            //var result; 
            //var query = client.query(map_query);
 
            /*
            query.rows.forEach(row=>{
                 result += row;
                  });
            */

            /*
            query.on("row", function(row,result) {
                     result.addRow(row);
                    });
            */

            /*    
            query.on("end", function(result) {
                     result.send(result.rows[0].row_to_json);
                     res.end();
                    });
            */


             var result;
              
              client
              .query(map_query)
              .then(res => {
                  if (res.rows.length)
                    {
                     result = res.rows;
                     var data = res.rows[0].row_to_json;
                     myres.send(data);

                     /*
                     myres.render('map', {
                          title: "Express API",
                          jsonData: data
                        });
                    */


                    }
                  else
                   myres.send("no rows");    
                })
             .catch(e => {
                fs.appendFile('mylog.txt', 'map query unsucessful\n', function (err) {
                if (err) throw err;
                   });
               });
              






            //myres.send("done");




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
  
