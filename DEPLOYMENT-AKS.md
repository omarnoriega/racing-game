# ☸️ Guía de Despliegue en AKS

## Paso 1: Preparación

### 1.1 Instalar herramientas
```bash
# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# kubectl
az aks install-cli

# Helm (opcional pero recomendado)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash