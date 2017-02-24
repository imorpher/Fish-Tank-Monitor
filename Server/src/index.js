'user strict';

import express from 'express';
import {InfluxDB} from 'influx';
import {FieldType} from 'influx';

const database_name = 'monitoring';

let app = express(),
    router = express.Router(),
    influx = new InfluxDB({
        host: '46.101.38.174',
        database: database_name,
        schema: [
            {
                measurement: 'temperature',
                fields: {
                    value: FieldType.INTEGER
                },
                tags:[
                    'tank_id',
                    'sensor_id'
                ]
            },            
            {
                measurement: 'humidity',
                fields: {
                    value: FieldType.INTEGER
                },
                tags:[
                    'tank_id',
                    'sensor_id'
                ]
            },
        ]
    });

var looop = function(){
}

influx.getDatabaseNames()
    .then(names => {
        if(!names.includes(database_name)){
            return influx.createDatabase(database_name);
        }
    })
    .then(() => {
        routing();
    })
    .catch(err => {
        console.error(`Error trying to connect to database! ${err.stack}`);
    });

let writeToDb = function(readingType, tankId, sensorId, value){
    return new Promise(function(resolve, reject){
        influx.writePoints([
            {
                measurement: readingType,
                fields: { 
                    value: value
                },
                tags : {
                    tank_id: tankId,
                    sensor_id: sensorId
                }
            }
        ])
        .then(() => {
            resolve();
        })
        .catch(err => {
            console.error(`Error trying to save to InfluxDB! ${err.stack}`);
            reject(err);
        });
    });
};

let getFromDb = function(readingType, tankId, sensorId){
    return new Promise(function(resolve, reject){
        influx.query(`
            SELECT  * 
            FROM    ${readingType}
            WHERE   tank_id = ${tankId}
            AND     sensor_id = ${sensorId}
            ORDER BY time desc
            limit 100
        `)
        .then(result => {
            resolve(result);
        })
        .catch(err => {
            console.error(`Error trying to get from InfluxDB! ${err.stack}`);
            reject(err);
        })
    });
};

let routing = function(){
    router.get('/monitor/temp/:tank_id/:sensor_id/:temp', function(req, res){
        writeToDb("temperature", req.params.tank_id, req.params.sensor_id, req.params.temp)
            .then(() => {
                res.end();
            });
    });
    
    router.get('/monitor/hum/:tank_id/:sensor_id/:hum', function(req, res){
        writeToDb("humidity", req.params.tank_id, req.params.sensor_id, req.params.hum)
            .then(() => {
                res.end();
            });
    });

    router.get('/get/temp/:tank_id/:sensor_id', function(req, res){ 
        getReadings("temperature", req, res);     
    });

    router.get('/get/hum/:tank_id/:sensor_id', function(req, res){   
        getReadings("humidity", req, res);     
    });

    let getReadings = function(readingType, req, res){
        getFromDb(readingType, req.params.tank_id, req.params.sensor_id)
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                console.error(err.stack);
                res.status(500).send({error: err});
            }); 
    }

    app.listen(3500, function(){
        console.log('Listening on port 3500');
    });

    app.use('/', router);
};