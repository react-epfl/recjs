RecJS
============

This service aggregates data from external repositories and makes it available
in [Graasp](http://graasp.epfl.ch). Currently, it retrieves widgets and
widget bundles from the [Widget Store](http://www.role-widgetstore.eu/).
The APIs to search and paginate the results are implemented and used by
Graasp to display widgets/bundles to its users.

Architecture
==============
Based on the awesome [NodeJS](http://nodejs.org) framework with
libraries built on top. As a database it uses [MongoDB](http://www.mongodb.org/).

