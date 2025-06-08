#!/bin/bash

# Create Kubernetes secrets from environment variables
set -e

echo "Creating Kubernetes secrets..."

# Check if .env.gcp exists
if [ ! -f ".env.gcp" ]; then
  echo ".env.gcp file not found!"
  echo "Please create .env.gcp with your actual values first."
  exit 1
fi

# Create namespace if it doesn't exist
kubectl create namespace notes-app --dry-run=client -o yaml | kubectl apply -f -

# Delete existing secret if it exists (to update it)
kubectl delete secret app-secrets -n notes-app --ignore-not-found=true

# Create secret from .env.gcp file
kubectl create secret generic app-secrets \
  --from-env-file=.env.gcp \
  -n notes-app

echo "Secrets created successfully!"

# Verify secrets were created
echo "Verifying secrets..."
kubectl get secrets -n notes-app
kubectl describe secret app-secrets -n notes-app 