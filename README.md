# NYU
NYU Coding Challenge
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

