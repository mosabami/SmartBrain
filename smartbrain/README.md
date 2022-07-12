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
```bash
git clone https://github.com/mosabami/smartbrain
```
## Install NGINX
This app doesnt work well with AGIC, so we will be using NGINX

Note: We will be using an internal load balancer here. Ensure the loadBalancerIP parameter in the command below is an ip address from the same subnet as your AKS cluster. If it isnt, use another unused internal ip address. 

```bash
ACRNAME=<Container registry name>
ACR_URL=<REGISTRY_URL>
```

```bash
SOURCE_REGISTRY=k8s.gcr.io
CONTROLLER_IMAGE=ingress-nginx/controller
CONTROLLER_TAG=v1.2.1
PATCH_IMAGE=ingress-nginx/kube-webhook-certgen
PATCH_TAG=v1.1.1
DEFAULTBACKEND_IMAGE=defaultbackend-amd64
DEFAULTBACKEND_TAG=1.5

az acr import --name $ACRNAME --source $SOURCE_REGISTRY/$CONTROLLER_IMAGE:$CONTROLLER_TAG --image $CONTROLLER_IMAGE:$CONTROLLER_TAG
az acr import --name $ACRNAME --source $SOURCE_REGISTRY/$PATCH_IMAGE:$PATCH_TAG --image $PATCH_IMAGE:$PATCH_TAG
az acr import --name $ACRNAME --source $SOURCE_REGISTRY/$DEFAULTBACKEND_IMAGE:$DEFAULTBACKEND_TAG --image $DEFAULTBACKEND_IMAGE:$DEFAULTBACKEND_TAG
```

You will be using a loadbalancer service with your ingress controller. for better security, we are using an load balancer with an internal ip. Modify the internal-ingress.yaml file so that it has an ip address from your AKS cluster's subnet. If you followed the instructions so far, 10. should work.

```bash
code internal-ingress.yaml
```

Install nginx ingress controller in your cluster
```bash
# Add the ingress-nginx repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
```

# Use Helm to deploy an NGINX ingress controller
```bash
helm install nginx-ingress ingress-nginx/ingress-nginx \
    --version 4.1.3 \
    --namespace ingress-basic \
    --create-namespace \
    --set controller.replicaCount=2 \
    --set controller.nodeSelector."kubernetes\.io/os"=linux \
    --set controller.image.registry=$ACR_URL \
    --set controller.image.image=$CONTROLLER_IMAGE \
    --set controller.image.tag=$CONTROLLER_TAG \
    --set controller.image.digest="" \
    --set controller.admissionWebhooks.patch.nodeSelector."kubernetes\.io/os"=linux \
    --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz \
    --set controller.admissionWebhooks.patch.image.registry=$ACR_URL \
    --set controller.admissionWebhooks.patch.image.image=$PATCH_IMAGE \
    --set controller.admissionWebhooks.patch.image.tag=$PATCH_TAG \
    --set controller.admissionWebhooks.patch.image.digest="" \
    --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux \
    --set defaultBackend.image.registry=$ACR_URL \
    --set defaultBackend.image.image=$DEFAULTBACKEND_IMAGE \
    --set defaultBackend.image.tag=$DEFAULTBACKEND_TAG \
    --set defaultBackend.image.digest="" \
    -f internal-ingress.yaml
```
<!-- Deploy the required resources to make nginx work for Azure
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.2.1/deploy/static/provider/cloud/deploy.yaml
``` -->

### Configure Back end pool to point to Nginx

You will be using NGINX ingress controller with an internal IP address for this deployment. To make the application more secure, you will make app gateway with a web application firewall the entry point for this cluster. You will then configure a backend pool for the application gateway to connect to the nginx internal load balancer we deployed previously. The first step would be to get the ip address for the ingress controller.

```bash
kubectl get services --namespace ingress-basic -o wide -w nginx-ingress-ingress-nginx-controller
```
When the Kubernetes load balancer service is created for the NGINX ingress controller, an IP address is assigned under EXTERNAL-IP.

```output
NAME                                     TYPE           CLUSTER-IP    EXTERNAL-IP     PORT(S)                      AGE   SELECTOR
nginx-ingress-ingress-nginx-controller   LoadBalancer   10.0.74.133   EXTERNAL_IP     80:32486/TCP,443:30953/TCP   44s   app.kubernetes.io/component=controller,app.kubernetes.io/instance=nginx-ingress,app.kubernetes.io/name=ingress-nginx
```

### Add listener to the Application gateway

1. Go to the portal, click on your application gateway resource and click on *listeners* in the left plane
1. Click on *Add listener* at the top of the resulting pane
1. Enter listener name
1. Select Public
1. Enter *8080* as the port
1. Click on **Add** at the bottom
![smartbrain screenshot](./media/smartbrain.png)

### Add backend  to the Application gateway


## Build the application container into your ACR
***This part is optional***. You can skip this step if you want to use the image provided in dockerhub.

1. Build the worker image
```bash
cd ./smartbrain/smartbrainml
az acr build -t smartbrain/smartbrainworker -r $ACRNAME .
```
update the image field in the smartbrain/k8s/worker-deployment.yaml file with the proper image name. it should be similar to <acrName>.azurecr.io/smartbrain/smartbrainworker

```bash
cd ..
code k8s/worker-deployment.yaml
```

Repeat the same step for the client and the server deployments 
```bash
cd smartbrainclient
az acr build -t smartbrain/smartbrainclient -r $ACRNAME .
```

``` bash
cd ..
code k8s/client-deployment.yaml
```

```bash
cd smartbrainclient
az acr build -t smartbrain/smartbrainapi -r $ACRNAME .
```

``` bash
cd ../k8s
code server-deployment.yaml
```

Deploy the application

```bash
kubectl apply -f .
```

**end of optional section**