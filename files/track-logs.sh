#!/bin/bash

# Continuously monitor the container logs
docker logs -f maxwell | while read -r line; do
    # Process the incoming stdout as needed
    # Example: Send the stdout to curl
    # curl -X POST -d "$line" <curl-url>
    echo $line
done
