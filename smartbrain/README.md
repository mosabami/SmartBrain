# Stage 2: Deploy a SmartBrain web app to AKS Landing Zone
ContosAI is a (fictional) artificial intelligence (AI) startup specializing in computer vision. They leverage machine learning and deep neural networks to identify and analyze images and videos. The company offers its solution via API, mobile SDK, and on-premise solutions. To showcase their cutting edge ML models, they are developing a customer facing application whereby customers can sign-up, provide images, and watch ContosAI's face detection model detect the faces in the model. The app is gamified by storing the number of times a user has used the face detector. It ranks the user compared with other users. ContosAI is planning to use the application to showcase their capabilities. They plan to host this new workload on in AKS.

## Prerequisite
To complete this, you need an AKS Landing Zone. If you haven't done so already, follow the steps in the [Deploy and Smartbrain app](../simpleapp/README.md) stage without completing the **Deploy the workload** part.

You will also need to install [helm](https://helm.sh/docs/intro/install/)

## Get started

The architecture of the application after deployment will look like the picture below
![smartbrain screenshot](../media/finished-state.png).

Create the cluster using AKS Deploy Helper
```azurecli
az group create -n smartbrain -l eastus
az deployment group create -g smartbrain -u https://aka.ms/aksc/json -p https://raw.githubusercontent.com/Azure/AKS-Construction/main/.github/workflows_dep/regressionparams/managed-public.json -p resourceName=smartbrain CreateNetworkSecurityGroups=false
```

## Install the application
After cluster creation we can install the application onto the cluster

```bash
az aks get-credentials -g smartbrain -n aks-smartbrain --overwrite-existing
```

If you havent yet, clone the repo
``bash
git clone https://github.com/mosabami/smartbrain
```
## Install NGINX
Install nginx ingress controller in your cluster
```bash
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```
Deploy the required resources to make nginx work for Azure
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.2.1/deploy/static/provider/cloud/deploy.yaml
```

```bash
cd ./smartbrain/k8s
kubectl apply -f .
```

### Configure Back end pool to point to Nginx

