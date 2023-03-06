# Overpass Query Cache

*...PROJECT WORK IN PROGRESS...*

Bounding boxes caching system for Overpass API requests

## Scope

Building a Nodejs library that with algorithms helps to optimize and manage a level of cache between a client and a server [overpass bees](http://overpass-ati.de/) or [Overpass Turbo](https://Overpass-turbo.eu/) in particular search for objects within a specific [Bounding Box](https://dev.overpass-api.de/overpass-doc/en/full_data/bbix.html).

Demo page to test algoritm:
https://stefanocudini.github.io/overpass-query-cache/test/

### How does it work

In BBOX's first request, some additional data is requested (see fixed tile) and subsequent requests in case they cover a nearby area no longer weigh on the overpass server because the cache contained in the tiles is used

![test page](test/test.gif)
