#!/bin/bash

# Build and push Docker images to GCR
set -e

# Configuration
PROJECT_ID="your-gcp-project-id"  # Replace with your project ID
IMAGE_NAME="notes-app"
TAG="latest"

# Check if PROJECT_ID is set
if [ "$PROJECT_ID" = "your-gcp-project-id" ]; then
  echo "Please update PROJECT_ID in this script"
  exit 1
fi

echo "Building and pushing Docker image..."

# Configure Docker to use gcloud as credential helper
gcloud auth configure-docker

# Build the image
echo "Building image..."
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG ./note-server

# Push to Google Container Registry
echo "Pushing to GCR..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG

echo "Image pushed successfully!"
echo "Image URL: gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG"

# Optionally update Kubernetes deployment
read -p "Update Kubernetes deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  kubectl set image deployment/fastapi fastapi=gcr.io/$PROJECT_ID/$IMAGE_NAME:$TAG -n notes-app
  echo "Deployment updated!"
fi