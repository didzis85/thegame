# thegame
Optibet test game "Tournament"

Used technologies - Node.JS / MySQL


Installation
============

    $ git clone https://github.com/didzis85/thegame.git
    $ cd thegame
    $ npm install
    $ mysql -u root -p < game.sql

Edit *src/server.js* file to set up MySQL user/password/host and port if different

Running
============

    $ node src/server.js

Access http://localhost:8081/

API accepts GET/POST request according to the specification.
Full use case can be processed using links available http://localhost:8081/ including POST request.

Tournament is created only after /announceTournament is called.

Regards,
Didzis Luka-Indāns