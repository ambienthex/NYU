# NYU

# Data initialization

1. Clone project git clone git@github.com:ambienthex/NYU.git
2. Make sure to have a local instance of MySQL installed and running.
3. cd data-init
4. Modify the database host, connection string at the bottom of "python create_and_prime_database.py" as needed.
5. pip install mysql
6. init database and load sample data with "python create_and_prime_database.py".


# Running API Server
1. cd api
2. npm install
3. node index
4. navigate to http://localhost:5000

# Optional Dockerization
1. docker build -t smofo/nyu-homework .
2. docker run -p 49160:5000 -d smofo/nyu-homework
3. docker ps
4. navigate to http://localhost:49160

# Note
The event data is a little wonky with people's names for the event names, but that is what was provided in the sample data with the challenge. Was tempted to mock it up with actual event names, but left it intact incase it was needed as is for validation purposes. 

# NYU Coding Challenge
Part 1: Design question 

NYU has an attendance tracking system for various events happening around all campuses. Event organizers and attendees can log in to this system. Events are organized into hierarchical categories: 

● Organization: An organization is a top-level entity in the hierarchy. It has one or more groups. 

● Groups: Each group belongs to one and only one organization. Groups can host multiple events. 

● Events: Each event belongs to one and only one group.

When a user logs in to the system, the homepage shows a default selected organization, all groups within that organization and metadata for each group. How would you design the REST endpoints for such a page? Each entity mentioned above resides in its own table in a database. Below is an example image for the homepage(for illustration purposes only):


![image](https://drive.google.com/uc?export=view&id=1OKeWJYPDEORp3EFtMSeozRKaKmCTjiN3)


Part 2: Implementation

Implement an API which gives the client information about a particular organization, the groups within that organization, and metadata about each group, for instance, the metadata for each group may include: 

Number of events
Number of Attendees

You can use any Http framework of your choice.

# Design answer

## Data Requirements and Considerations

1. We’ll start with the data and database design. The first thing that stands out is that there is a field in the provided screenshot that shows the number of people in a group and the supplied sample data (orgs, groups and events) does not provide for that relationship. I’ll add several more tables and data sets to account for this.  We can use a “students” table to hold students and a “student_group_subscription” intermediate table that establishes the many to many relationship between groups and student subscriptions / members to handle that requirement.  

2. The second thing I noticed was that there is a single field in the events table to indicate the number of attendees. This is ok, but it would be best database design wise to include an intermediate table called “checkins” that establishes a many to many between “events” and “students” with a timestamp and the attendee count can be aggregated and allow for a record of the students that attended the event. 

3. Here is my Entity Relationship Diagram that includes the orgs, groups and events data and my three new tables students, student_group_subscriptions and checkins. 


# Database Entity Relationship Diagram With New Tables

![image](https://drive.google.com/uc?export=view&id=1W0GdfvNuqeHbpMB7k8nYhuzOXCAaUykr)

# Creating and priming the Database

First step is to create a database schema. We’ll use a simple Python script to create the MySQl database. This script should be able to create the database schema. Secondly, the script should create the “orgs”, “groups”, “events”, “student_group_subscriptions”, “students” and “checkins” tables. Lastly, the script should be able to dynamically map and import the fields and data into each of the tables. 

The script is included below and in the data_init directory. If you have an existing test MySQL instance already setup, simply update the MySql credentials at the bottom of the file and run to create the database, tables and prime the database tables with the sample data. Run it via the command line with “python create_and_prime_database.py” in the same path as the supplied JSON files.

# Code to init database and load sample data

```python
import pymysql
import os
import json


def mysql_connect(host, user, pwd):
  return  pymysql.connect(host, user, pwd)


def create_tables(connection):

  cursor = connection.cursor()

  print('\n\n********* Creating database and tables ********\n\n\n')

  sql = "DROP SCHEMA IF EXISTS nyu"
  cursor.execute(sql)

  # Create database schema
  sql = "CREATE SCHEMA nyu DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
  print ("Creating database... " + sql + "\n\n")
  cursor.execute(sql)

  # Create events table
  sql = ("CREATE TABLE nyu.events ( "
  "event_id varchar(50) NOT NULL, "
  "group_id varchar(50) NOT NULL, "
  "even_name varchar(255) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NOT NULL, "
  "number_of_attendees int NOT NULL, "
  "PRIMARY KEY (event_id) "
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")
  print ("Creating events table... " + sql + "\n\n")
  cursor.execute(sql)

  # Create groups table
  sql = ("CREATE TABLE nyu.groups ( "
  "group_id varchar(50) NOT NULL, "
  "org_id varchar(50) NOT NULL, "
  "group_name varchar(50) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NOT NULL,"
  "PRIMARY KEY (group_id) "
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")
  print ("Creating groups table... " + sql + "\n\n")
  cursor.execute(sql)

  # Create orgs table
  sql = ("CREATE TABLE nyu.orgs ( "
  "org_id varchar(50) NOT NULL, "
  "org_name varchar(50) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NOT NULL, "
  "PRIMARY KEY (org_id) "
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")
  print ("Creating orgs table... " + sql + "\n\n")
  cursor.execute(sql)


  # Create students table
  sql = ("CREATE TABLE nyu.students ( "
  "student_id INT AUTO_INCREMENT, "
  "first_name VARCHAR(255) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NOT NULL, "
  "last_name VARCHAR(255) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_bin' NOT NULL, "
  "PRIMARY KEY (student_id) "
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")
  print ("Creating students table... " + sql + "\n\n")
  cursor.execute(sql)


  # Create checkins table
  sql = ("CREATE TABLE nyu.checkins ( "
  "student_id INT, "
  "event_id VARCHAR(255), "
  "checkin_date datetime DEFAULT CURRENT_TIMESTAMP,"
  "PRIMARY KEY (student_id, event_id) "
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")
  print ("Creating checkins table... " + sql + "\n\n")
  cursor.execute(sql)


  # Create group subscriptions tables
  sql = ("CREATE TABLE nyu.student_group_subscriptions ( "
  "subscription_id INT AUTO_INCREMENT, "
  "student_id INT, "
  "group_id VARCHAR(255), "
  "subscribed_date DATETIME NULL DEFAULT NOW(), "
  "PRIMARY KEY (subscription_id) "
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;")
  print (sql);
  print ("Creating student group subscriptions table... " + sql + "\n\n")
  cursor.execute(sql)

  print('\n\n********* Database and tables created********\n\n\n')


def load_data(connection, file, table):
  print("\n\n********* Loading " + file + " into table " + table + "********\n\n\n")
  cursor = connection.cursor()
  with open(file, 'r') as json_file:
    data = json.load(json_file)
    for record in data:
      fields =  (", ".join(record.keys()))
      field_vars = '%s,' * len(record.keys())
      field_vars = field_vars[:-1]
      sql = "INSERT INTO " + table + " (" + fields + ") VALUES (" + field_vars + ")"
      cursor.execute(sql, record.values())
      connection.commit()
       # print("key: {} | value: {}".format(key, value))s

# Connect to mysql database instance
mysql_connection = mysql_connect('localhost', 'root', 'nyu777!!!')

# Create mysql tables
create_tables(mysql_connection)

print('\n\n********* Loading Data ********\n\n\n')
load_data(mysql_connection, 'events.json', 'nyu.events')
load_data(mysql_connection, 'groups.json', 'nyu.groups')
load_data(mysql_connection, 'orgs.json', 'nyu.orgs')
load_data(mysql_connection, 'students.json', 'nyu.students')
load_data(mysql_connection, 'checkins.json', 'nyu.checkins')
load_data(mysql_connection, 'student_group_subscriptions.json', 'nyu.student_group_subscriptions')
print('\n\n********* Database initialized ********\n\n\n')

```


# REST API Service

We’ll use Node.js and Express to build out backend API for the Event API. 

Our API will have HTTP GET controller methods for getting all orgs, all groups and all events. API endpoints will also provided to specify a key to view individual org, group and event records.

We’ll also provide an HTTP GET method for views that will allow us to retrieve aggregates of data across all the tables.  For this project, we’ll just be focusing on the group view / UI that was provided in the project requirements. 

API Definition. We’ll have an express controller method for each of the methods in the table below.

![image](https://drive.google.com/uc?export=view&id=1JkmHcITMAosjii1wI-QmIm8TFp0mAMr1)


# Design Implementation

Build  a Basic Restful service in Node.JS and express. 

API service needs the ability to connect to MySQL, run queries and return JSON using simple reusable dynamic functions. 

API service needs to provide end points as defined in the table above and to return the appropriate JSON responses in response to endpoints being invoked.

Wasn’t specified in the requirement for this coding challenge, but I would normally have some authentication. Would also modularize the node.js code a bit as well. Just keeping it simple for this coding challenge. 

Service should have basic error handling.

# API Service Code
```python
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

```

# Optional Dockerization

docker build -t smofo/nyu-homework .

docker run -p 49160:5000 -d smofo/nyu-homework

docker ps

navigate to http://localhost:49160

# Test HTML / VUE Page

A test page is available to test all REST endpoints at the root of localhost. Used HTML5, CSS and Vue. Test page can be accessed via the root of localhost (http://localhost:5000)

# Sample Check In POST and Check In Data:
![image](https://drive.google.com/uc?export=view&id=1sybk0KztzuA6L8hbMJFQUyDB8L14Tkps)

# Groups Data View:
![image](https://drive.google.com/uc?export=view&id=14ip--kmTIMruyA8Aukqp2SmNS_K2Wq55)

# HTML / Vue Code
```html
 <head>
    <script src="https://unpkg.com/vue@2.5.16/dist/vue.js"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/foundation/6.3.1/css/foundation.min.css">
  </head>
  <body>
    <!-- Table CSS-->
    <style>
      #datatable {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      #datatable td, #datatable th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      #datatable tr:nth-child(even){background-color: #f2f2f2;}
      #datatable tr:hover {background-color: #ddd;}
      #datatable th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #4CAF50;
        color: white;
      }
      button {
        background-color: #4CAF50; /* Green */
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
      }
    </style>

    <!-- Vue App View Port-->
    <div id="app" style="padding:20px;">

      <!-- Drop down for API GET end points -->
      <div style="width:500px;">
        <label for="api">API End Points:</label>
        <select id="api" @change="clickHandler($event)">
          <option value="http://localhost:5000/views/groups" selected>http://localhost:5000/views/groups</option>
          <option value="http://localhost:5000/views/checkins">http://localhost:5000/views/checkins</option>
          <option value="http://localhost:5000/views/student_group_subscriptions">http://localhost:5000/views/student_group_subscriptions</option>
          <option value="http://localhost:5000/groups">http://localhost:5000/groups</option>
          <option value="http://localhost:5000/orgs">http://localhost:5000/orgs</option>
          <option value="http://localhost:5000/events">http://localhost:5000/events</option>
          <option value="http://localhost:5000/students">http://localhost:5000/students</option>
          <option value="http://localhost:5000/students_group_subscriptions">http://localhost:5000/students_group_subscriptions</option>
        </select>
      </div>

      <!-- Tabular data rendering -->
      <table id="datatable">
        <tr>
          <th v-for="(value,key) in data[0]">
            {{key}}
          </th>
        </tr>
        <tr v-for="(record) in data">
          <td v-for="(value) in record">
            {{value}}
          </td>
        </tr>
      </table>

      <!-- Checkin Post Demo -->
      <div style="width:500px;">
        <label for="students">Check In Demo Student:</label>
        <select id="students">
          <option v-for="(record) in students" v-bind:value="record.student_id">
              {{record.first_name}} {{record.last_name}}
          </option>
        </select>
        <label for="events">Check In Demo Event Name:</label>
        <select id="events">
          <option v-for="(record) in events" v-bind:value="record.event_id"> 
              {{record.even_name}}
          </option>
        </select>
        <div>*Event name data is a little whacky with names, but this is what was provided.</div>
        <button class="buttton" @click="checkInToEvent()">Check In</button>
      </div>

      <!-- Bottom Padding -->
      <div style="height:200px;"></div>

    </div>


    <!-- Vue Code -->
    <script>

      var app = new Vue({
        el: "#app",
        data: {
          data: [],
          students: [],
          events: []
        },
        mounted() {
          this.getData('http://localhost:5000/views/groups')
          this.loadStudentAndEventSelects();
        },
        methods: {
          clickHandler(event) {
            this.data = [];
            this.getData(event.target.value);
          },
          getData: function (url) {
            axios.get(url)
            .then(response => {
                this.data = response.data
            })
          },
          loadStudentAndEventSelects: function() {
            axios.get('http://localhost:5000/students')
              .then(response => {
                  this.students = response.data
              })
            axios.get('http://localhost:5000/events')
              .then(response => {
                  this.events = response.data
              })
          },
          checkInToEvent: function() {
            var studentselect = document.getElementById("students");
            var student_id = studentselect.options[studentselect.selectedIndex].value;
            var eventselect = document.getElementById("events");
            var event_id = eventselect.options[eventselect.selectedIndex].value;
            axios.post('http://localhost:5000/events/checkins/' + student_id + '/' + event_id)
              .then(response => {
                alert("You're checked in!");
              })
          }
        }
      });
    </script>
  </body>

```




| End Point | Method | Description | Results
| ------------- |------------- |-------------|
| /views/groups | Get | Returns an aggregate JSON data set with groups, events, orgs and checkins tables. |Returns multiple JSON records containing  Group Name, Event Count, Subscription / People in Group Count and number of checkins. |
| /views/checkins | Get | Get all checkins JSON | Multiple JSON records with student_id, first_name, last_name, even_name, checkin_date field values. |
| /views/student_group_subscriptions | Get | Returns an aggregate JSON data set with student_group_subscriptions, students and groups tables. | Returns multiple JSON records containing  subscription_id, student_id, group_id, subscribed_date, first_name, last_name, org_id,  and group_name data fields. |
| /groups | Get | Returns all group records in a JSON format. | Multiple JSON records containing group_id, org_id, group_name field values. |
| /orgs | Get | Returns all organization records in a JSON format. | Multiple JSON records containing org_id, org_name field values.|
| /events | Get | Returns all event records in a JSON format. | Multiple JSON records containing event_id, group_id, even_name, number_of_attendees field values. |
| /orgs/{key} | Get | Returns a single organization record for the specified organization key. | Returns a single JSON record containing org_id, org_name field values. |
| /groups/{key} | Get | Returns a single group record for the specified group key. | Returns a single JSON record containing group_id, org_id, group_name field values. |
| /events/{key} | Get | Returns a single event record for the specified event key. | Returns a single JSON record containing event_id, group_id, even_name, number_of_attendees field values.
| /students/ | Get | Returns all students | Multiple JSON records containingstudent_id, first_name and last name field values field values. |
| /events/checkins/:student_id/:event_id | Post | Checks a student into an event. A record is inserted into the checkins table with the provided student_id and event_id. We would normally have authentication here, but just a rough demo of how that works. | Returns 200 on success |
| /students/{key} | Get | Returns a single event record for the specified event key. | Returns a single JSON record containing event_id, group_id, even_name, number_of_attendees field values. |


