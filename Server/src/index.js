'user strict';

import express from 'express';

let app = express(),
    router = express.Router();

// app.get('/', function(req, res){
//     res.send('Hello Wold!');
//     console.log('Get request to root.');
// });

router.post('/monitor/temp/:tank_id/:sensor_id/:temp', function(req, res){
    console.log('tank : ' + req.params.tank_id);
    console.log('sesnsor : ' + req.params.sensor_id);
    console.log('temp : ' + req.params.temp);

    res.end();
});

router.post('/monitor/hum/:tank_id/:sensor_id/:hum', function(req, res){
    console.log('tank : ' + req.params.tank_id);
    console.log('sesnsor : ' + req.params.sensor_id);
    console.log('hum : ' + req.params.hum);
    
    res.end();
});

app.listen(3000, function(){
    console.log('Listening on port 3000');
});

app.use('/', router);


/*

    /monitor/temp/:tank_id/:sensor_id/:temp
    /monitor/hum/:tank_id/:sensor_id/:hum
    


*/