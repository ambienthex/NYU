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

#Design answer

##Data Requirements and Considerations

1. We’ll start with the data and database design. The first thing that stands out is that there is a field in the provided screenshot that shows the number of people in a group and the supplied sample data (orgs, groups and events) does not provide for that relationship. I’ll add several more tables and data sets to account for this.  We can use a “students” table to hold students and a “student_group_subscription” intermediate table that establishes the many to many relationship between groups and student subscriptions / members to handle that requirement.  

2. The second thing I noticed was that there is a single field in the events table to indicate the number of attendees. This is ok, but it would be best database design wise to include an intermediate table called “checkins” that establishes a many to many between “events” and “students” with a timestamp and the attendee count can be aggregated and allow for a record of the students that attended the event. 

3. Here is my Entity Relationship Diagram that includes the orgs, groups and events data and my three new tables students, student_group_subscriptions and checkins. 


Database Entity Relationship Diagram With New Tables

![image](https://drive.google.com/uc?export=view&id=1W0GdfvNuqeHbpMB7k8nYhuzOXCAaUykr)

