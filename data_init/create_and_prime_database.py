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


