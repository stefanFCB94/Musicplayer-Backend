#!/bin/bash

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# PUshes all built images to docker hub
docker push stefanfcb94/musicplayer:logger
