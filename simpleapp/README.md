# Deploy a Simple Python (Flask) web app to AKS Landing Zone

This is the sample Flask application for the Azure Quickstart [Deploy a Python (Django or Flask) web app to Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/quickstart-python).  For instructions on how to create the Azure resources and deploy the application to Azure, refer to the Quickstart article.

A Django sample application is also available for the article at [https://github.com/Azure-Samples/msdocs-python-django-webapp-quickstart](https://github.com/Azure-Samples/msdocs-python-django-webapp-quickstart).

If you need an Azure account, you can [create on for free](https://azure.microsoft.com/en-us/free/).

## Getting started - AKS Deploy Helper

We can leverage [AKS Deploy Helper](https://github.com/Azure/AKS-Construction) to quickly create a suitable environment with AKS cluster and Azure Appplicaton Gateway.

```azurecli
az group create -n aks-smartbrain -l eastus
RGNAME=aks-smartbrain
az deployment group create -g $RGNAME  --template-uri https://github.com/Azure/AKS-Construction/releases/download/0.8.2/main.json --parameters \
	resourceName=smartbrain \
	upgradeChannel=stable \
	custom_vnet=true \
	enable_aad=true \
	AksDisableLocalAccounts=true \
	enableAzureRBAC=true \
	adminPrincipalId=$(az ad signed-in-user show --query id --out tsv) \
	registries_sku=Premium \
	acrPushRolePrincipalId=$(az ad signed-in-user show --query id --out tsv) \
	omsagent=true \
	retentionInDays=30 \
	networkPolicy=azure \
	azurepolicy=audit \
	authorizedIPRanges="[\"0.0.0.0/0\"]" \
	ingressApplicationGateway=true \
	appGWcount=0 \
	appGWsku=WAF_v2 \
	appGWmaxCount=10 \
	appgwKVIntegration=true \
	azureKeyvaultSecretsProvider=true \
	createKV=true \
	kvOfficerRolePrincipalId=$(az ad signed-in-user show --query id --out tsv)
```

After cluster creation we can install the application onto the cluster

```bash
az aks get-credentials -g smartbrain -n aks-smartbrain --overwrite-existing
git clone https://github.com/mosabami/smartbrain
```

Log into the registry
```bash
ACRNAME=<container registry name>
sudo az acr login -g $RGNAME -n $ACRNAME
```
If you are having trouble logging in, follow these steps to log into ACR.
1. Go to Azure Portal and clock on the container registry (ACR) you just deployed with AKS. On the left plane click on Access Keys then enable Admin User. Then you will be able to see the ACR password. The name of the container registry is the username. 
1. Enter username and password for the registry if prompted.

## Deploy the workload
Build the image
```bash
az acr build -t sample/simpleapp -r $ACRNAME .
```
Switch to the k8s folder and update the k8s manifest file with your correct container registry name
```bash
cd k8s
code app-deployment.yaml
```
Deploy the workload
```bash
kubectl apply -f .
```
Get the ip address of the ingress controller and enter it in a browser to access the workload
```bash
kubectl get ingress 
```
Congratulations! you have your first app deployed in an AKS Landing Zone. Delete the workload
```bash
kubectl delete -f . 
```
## Next Step

:arrow_forward: [Deploy and Smartbrain app](../smartbrain/README.md)
