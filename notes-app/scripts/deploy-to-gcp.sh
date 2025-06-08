#!/bin/bash

# Deploy Notes App to GCP
set -e

# Configuration - UPDATE THESE VALUES
PROJECT_ID="rare-attic-462115-j3"
REGION="us-central1"
ZONE="us-central1-a"
CLUSTER_NAME="notes-app-cluster"

echo "🚀 Starting deployment to GCP..."

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
  echo "Please authenticate gcloud first: gcloud auth login"
  exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable container.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Create GKE cluster if it doesn't exist
if ! gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE &>/dev/null; then
  echo "Creating GKE cluster..."
  gcloud container clusters create $CLUSTER_NAME \
    --zone=$ZONE \
    --num-nodes=2 \
    --machine-type=e2-standard-2 \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=3 \
    --enable-autorepair \
    --enable-autoupgrade
else
  echo "GKE cluster already exists"
fi

# Get cluster credentials
echo "Getting cluster credentials..."
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Build and push Docker image
echo "Building and pushing Docker image..."
docker build -t gcr.io/$PROJECT_ID/notes-app:latest ./note-server
docker push gcr.io/$PROJECT_ID/notes-app:latest

# Update deployment file with project ID
sed -i "s/YOUR_PROJECT_ID/$PROJECT_ID/g" k8s/fastapi-deployment.yaml

# Deploy Weaviate
echo "Deploying Weaviate..."
kubectl apply -f k8s/weaviate-deployment.yaml

# Wait for Weaviate to be ready
echo "Waiting for Weaviate to be ready..."
kubectl wait --for=condition=ready pod -l app=weaviate -n notes-app --timeout=300s

# Deploy FastAPI
echo "Deploying FastAPI..."
kubectl apply -f k8s/fastapi-deployment.yaml

# Wait for deployment
echo "Waiting for FastAPI deployment..."
kubectl wait --for=condition=available deployment/fastapi -n notes-app --timeout=300s

# Get external IPs
echo "Getting service URLs..."
kubectl get services -n notes-app

echo "Deployment complete!"
echo "Next steps:"
echo "1. Create secrets: kubectl create secret generic app-secrets --from-env-file=.env.gcp -n notes-app"
echo "2. Update Redis URL in fastapi-deployment.yaml with Memorystore IP"
echo "3. Restart FastAPI deployment: kubectl rollout restart deployment/fastapi -n notes-app"