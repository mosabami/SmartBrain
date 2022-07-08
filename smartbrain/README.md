## Getting started - AKSC

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