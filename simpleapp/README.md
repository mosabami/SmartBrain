# Deploy a Simple Python (Flask) web app to AKS Landing Zone

This is the sample Flask application for the Azure Quickstart [Deploy a Python (Django or Flask) web app to Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/quickstart-python).  For instructions on how to create the Azure resources and deploy the application to Azure, refer to the Quickstart article.

A Django sample application is also available for the article at [https://github.com/Azure-Samples/msdocs-python-django-webapp-quickstart](https://github.com/Azure-Samples/msdocs-python-django-webapp-quickstart).

If you need an Azure account, you can [create on for free](https://azure.microsoft.com/en-us/free/).

## Getting started - AKS Deploy Helper

We can leverage [AKS Deploy Helper](https://github.com/Azure/AKS-Construction) to quickly create a suitable environment with AKS cluster and Azure Appplicaton Gateway.

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
