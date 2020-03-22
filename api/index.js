'use strict';

// Express is a minimal and flexible Node.js web application framework
const express = require('express');

// MySqL
const mysql = require('mysql');

// Create a MySQL connection pool.
const connection_pool = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : 'root',
    password        : 'nyu777!!!',
    database        : 'nyu'
});

// Start express to listen on specified port
const app = express();
app.listen(5000, () => console.log('listening on port 5000'));

// HTTP Route Handlers

// Default routet to return a sample VUEJS UI for reviewing data
app.get('/', (req, res) => {
    res.sendFile('./index.html', { root: __dirname });
});

// API end point to retrieve all organizations or a specific organizations in a JSON format.
app.get('/orgs/:key?', (req, res) => {
  const sql = get_query_string('nyu.orgs', 'org_name', 'org_id', req.params.key);
  output_query_results(req, res, connection_pool, sql);
});

// API end point to retrieve all groups or a specific group in a JSON format.
app.get('/groups/:key?', (req, res) => {
  const sql = get_query_string('nyu.groups', 'group_name', 'group_id', req.params.key);
  output_query_results(req, res, connection_pool, sql);
});

// API end point to retrieve all events or a specific organizarion in a JSON format.
app.get('/events/:key?', (req, res) => {
  const sql = get_query_string('nyu.events', 'even_name', 'event_id', req.params.key);
  output_query_results(req, res, connection_pool, sql);
});

// API end point to retrieve all students or a specific student in a JSON format.
app.get('/students/:key?', (req, res) => {
  const sql = get_query_string('nyu.students', 'first_name', 'student_id', req.params.key);
  output_query_results(req, res, connection_pool, sql);
});

// API end point to retrieve all students or a specific student in a JSON format.
app.get('/students_group_subscriptions/:key?', (req, res) => {
  const sql = get_query_string('nyu.student_group_subscriptions', 'subscription_id', 'subscription_id', req.params.key);
  output_query_results(req, res, connection_pool, sql);
});

// API end point to retrieve the aggregate group view.
app.get('/views/groups', (req, res) => {
  let sql = "SELECT group_name, COUNT(*) event_count, SUM(number_of_attendees) total_attendee_count, ";
  sql += "(SELECT COUNT(*) FROM nyu.student_group_subscriptions WHERE group_id = G.group_id) group_subscription_count, ";
  sql += "COUNT(C.event_id) checkin_count ";
  sql += "FROM nyu.groups G ";
  sql += "JOIN nyu.events E on E.group_id = G.group_id ";
  sql += "LEFT OUTER JOIN nyu.checkins C on C.event_id = E.event_id and G.group_id = E.group_id ";
  sql += "GROUP BY g.group_id ORDER BY group_name ASC";
  output_query_results(req, res, connection_pool, sql);
});

// API End point to fetch student event checkins
app.get('/views/checkins', (req, res) => {
  const student_id = req.params['student_id'];
  const event_id = req.params['event_id'];
  let sql = "SELECT S.student_id, first_name, last_name, even_name, checkin_date ";
  sql += "FROM checkins C ";
  sql += "JOIN students S on S.student_id = C.student_id ";
  sql += "JOIN events E on E.event_id = C.event_id;";
  output_query_results(req, res, connection_pool, sql);
});

// API End point to fetch student group subscriptions
app.get('/views/student_group_subscriptions', (req, res) => {
  const student_id = req.params['student_id'];
  const event_id = req.params['event_id'];
  let sql = "SELECT * FROM nyu.student_group_subscriptions SGS ";
  sql += "JOIN nyu.students S on S.student_id = SGS.student_id ";
  sql += "JOIN nyu.groups G on G.group_id = SGS.group_id";
  output_query_results(req, res, connection_pool, sql);
});


// API End point to allow a student to be checked in to an events
app.post('/events/checkins/:student_id?/:event_id?', (req, res) => {
  const student_id = req.params['student_id'];
  const event_id = req.params['event_id'];
  let sql = "INSERT IGNORE INTO nyu.checkins(student_id, event_id) VALUES (?, ?) ";
  get_query_results(connection_pool, sql, res, [student_id, event_id]).then(function(rows) {
      res.send("OK!");
  }).catch((err) => setImmediate(() => {
   res.status(500).send('Error');
   console.log(err);
  }));
});

// Wrapper function that retrieves data for the specified sql statement and outputs JSON results
const output_query_results = (req, res, connection_pool, sql) => {
  get_query_results(connection_pool, sql, res, [req.params.key]).then(function(rows) {
      output_json(res,rows);
  }).catch((err) => setImmediate(() => {
   res.status(500).send('Error');
   console.log(err);
  }));
};

// Generic function to retrieve data for a specified SQL query
const get_query_results = (connection_pool, sql, res, criteria_values = []) => {
  return new Promise(function(resolve, reject) {
    connection_pool.getConnection(function (err, connection) {
      connection.query(sql, criteria_values, function (err, rows) {
        connection.release();
        if (err) {
           return reject(err);
        }
        resolve(rows);
      });
    });
  });
};

// Build and return approriate SQL query string
const get_query_string = (table, order_by_field = null, criteria_field = null, criteria_value = null, ) => {
  let sql =`SELECT * FROM ${table}`;
  sql = (criteria_field && criteria_value && criteria_value.length > 0) ? sql + ` WHERE ${criteria_field} = ?` : sql;
  sql = (order_by_field) ? sql + ` ORDER BY ${order_by_field} ASC` : sql;
  return sql;
};


// Output JSON
const output_json = (res, obj) => {
   res.send(JSON.stringify(obj));
}
