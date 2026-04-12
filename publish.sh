#/bin/bash

IMAGE=ghcr.io/roman-dynin/azimuth:latest

docker-buildx build --platform linux/amd64 -t ${IMAGE} .

docker push ${IMAGE}
