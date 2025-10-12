# 🚀 Guía de Despliegue en Azure

## Pre-requisitos

- Azure CLI instalado (`az --version`)
- Azure DevOps account con proyecto creado
- Docker instalado (para testing local)
- Node.js 18+ instalado
- Git configurado

---

## Paso 1: Configurar Azure Infrastructure

### 1.1 Editar el script de setup
```bash
cd infrastructure
nano setup-azure.sh