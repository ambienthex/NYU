# NYU
NYU Coding Challenge
Part 1: Design question 

NYU has an attendance tracking system for various events happening around all campuses. Event organizers and attendees can log in to this system. Events are organized into hierarchical categories: 

● Organization: An organization is a top-level entity in the hierarchy. It has one or more groups. 

● Groups: Each group belongs to one and only one organization. Groups can host multiple events. 

● Events: Each event belongs to one and only one group.

When a user logs in to the system, the homepage shows a default selected organization, all groups within that organization and metadata for each group. How would you design the REST endpoints for such a page? Each entity mentioned above resides in its own table in a database. Below is an example image for the homepage(for illustration purposes only):

![image](https://drive.google.com/open?id=1OKeWJYPDEORp3EFtMSeozRKaKmCTjiN3??export=view)

Part 2: Implementation

Implement an API which gives the client information about a particular organization, the groups within that organization, and metadata about each group, for instance, the metadata for each group may include: 

Number of events
Number of Attendees

You can use any Http framework of your choice.
