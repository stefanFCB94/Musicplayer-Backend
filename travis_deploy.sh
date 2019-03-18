#!/bin/bash

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin


docker build -t stefanfcb94/musicplayer:logger ./services/logger/service/. 
docker push stefanfcb94/musicplayer:logger
