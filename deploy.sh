#!/bin/bash

red=`tput setaf 1`

#create docker image from app
echo "${red}Creating Docker Image..."
docker build -t gcr.io/shopifychallenge-216313/shop:v1 .

echo "${red}Image Created"
#list images
docker images

docker push gcr.io/shopifychallenge-216313/shop:v1
echo "${red}Image pushed to gcloud"

#Create container cluster
echo "${red}Creating Cluster..."
gcloud container clusters create shopifychallenge-cluster --num-nodes=3
echo "${red}Created cluster!"


#list active clusters(cluster already exists)
gcloud compute instances list

echo "${red}Deploying app to kubernetes"
kubectl run shopifychallenge-cluster --image=gcr.io/shopifychallenge-216313/shop:v1 --port 8080

echo "${red}App Deployed!"

#Expose app to the internet
echo "${red}Exposing app to the internet!"
kubectl expose deployment shopifychallenge-cluster --type=LoadBalancer --port 80 --target-port 8080

#List external IP of the application
kubectl get service
