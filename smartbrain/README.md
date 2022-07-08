# Deploy a SmartBrain web app to AKS Landing Zone
ContosAI is a (fictional) artificial intelligence (AI) startup specializing in computer vision. They leverage machine learning and deep neural networks to identify and analyze images and videos. The company offers its solution via API, mobile SDK, and on-premise solutions. To showcase their cutting edge ML models, they are developing a customer facing application whereby customers can sign-up, provide images, and watch ContosAI's face detection model detect the faces in the model. The app is gamified by storing the number of times a user has used the face detector. It ranks the user compared with other users. ContosAI is planning to use the application to showcase their capabilities. They plan to host this new workload on in AKS.

## Getting started - AKS Deploy Helper

We can leverage [AKS Deploy Helper](https://github.com/Azure/AKS-Construction) to quickly create a suitable environment with AKS cluster and Azure Appplicaton Gateway.

The architecture of the application after deployment will look like the picture below
![smartbrain screenshot](../media/finished-state.png).

Create the cluster using AKS Deploy Helper
```azurecli
az group create -n smartbrain -l eastus
az deployment group create -g smartbrain -u https://aka.ms/aksc/json -p https://raw.githubusercontent.com/Azure/AKS-Construction/main/.github/workflows_dep/regressionparams/managed-public.json -p resourceName=smartbrain CreateNetworkSecurityGroups=false
```

After cluster creation we can install the application onto the cluster

```bash
az aks get-credentials -g smartbrain -n aks-smartbrain --overwrite-existing
git clone https://github.com/mosabami/smartbrain
```

```bash
cd ./smartbrain/k8s
kubectl apply -f .
```