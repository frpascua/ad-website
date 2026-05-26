# 🔧 Solución de Problemas de Deployment en Vercel

## ❌ Error: "No FastAPI entrypoint found"

### Descripción del Error
```
No FastAPI entrypoint found. Set "tool.vercel.entrypoint" in pyproject.toml 
or define an entrypoint in one of: app.py, index.py, server.py, main.py, ...
```

### ✅ Solución

El error ocurre porque Vercel necesita saber exactamente dónde está la aplicación FastAPI (`app`).

#### 1. Crear `pyproject.toml` en la raíz del proyecto

```toml
[tool.vercel]
entrypoint = "api.main:app"
```

Este archivo le dice a Vercel:
- **Módulo:** `api.main` (archivo `api/main.py`)
- **Variable:** `app` (la instancia de FastAPI)

#### 2. Verificar que `api/main.py` tenga:

```python
from fastapi import FastAPI

app = FastAPI()

# ... resto del código ...

# Al final del archivo (opcional pero recomendado):
handler = app
```

#### 3. Configurar `vercel.json` correctamente

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/main.py"
    },
    {
      "src": "/ad/(.*)",
      "dest": "api/main.py"
    }
  ]
}
```

**IMPORTANTE:** 
- NO incluir la sección `"env"` en `vercel.json`
- Las variables de entorno se configuran en el Dashboard de Vercel
- La sección `"env"` con `@variable` es del formato antiguo de Vercel

---

## 🔐 Variables de Entorno en Vercel

### ❌ NO hacer esto en vercel.json:
```json
{
  "env": {
    "JWT_SECRET": "@jwt-secret",
    "RESEND_API_KEY": "@resend-api-key"
  }
}
```

### ✅ SÍ hacer esto:

1. Ir al Dashboard de Vercel
2. Tu Proyecto → Settings → Environment Variables
3. Add Variable → Agregar cada una:
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `BASE_URL`
   - `FROM_EMAIL`

---

## 📦 Archivos Necesarios para Vercel

```
✅ api/main.py          # Con `app = FastAPI()`
✅ pyproject.toml       # Con entrypoint definido
✅ vercel.json          # Con builds y routes
✅ requirements.txt     # Con todas las dependencias
```

---

## 🧪 Verificar Configuración Local

Antes de desplegar, verifica:

```bash
# 1. Verificar que el archivo existe
ls pyproject.toml

# 2. Ver contenido
cat pyproject.toml

# 3. Probar localmente
uvicorn api.main:app --reload --port 8000
```

Si funciona localmente con `api.main:app`, funcionará en Vercel.

---

## 🚀 Comandos de Deploy

```bash
# Deploy a producción
vercel --prod

# Ver logs en tiempo real
vercel logs --follow

# Ver logs de una función específica
vercel logs api/main.py --follow
```

---

## 🔍 Debugging

### Si el deploy falla:

1. **Ver logs de build:**
   ```bash
   vercel logs --follow
   ```

2. **Verificar que pyproject.toml está en Git:**
   ```bash
   git status
   git add pyproject.toml
   git commit -m "Add pyproject.toml for Vercel entrypoint"
   git push
   ```

3. **Verificar estructura de archivos:**
   ```bash
   tree /F  # Windows
   # o
   ls -R    # Linux/Mac
   ```

4. **Verificar sintaxis de pyproject.toml:**
   ```bash
   python -c "import tomli; tomli.load(open('pyproject.toml', 'rb'))"
   # Si no tienes tomli: pip install tomli
   ```

### Si las variables de entorno no funcionan:

1. Vercel Dashboard → Settings → Environment Variables
2. Verificar que están en el scope correcto:
   - Production
   - Preview
   - Development
3. Re-deploy después de agregar variables:
   ```bash
   vercel --prod --force
   ```

---

## 📝 Checklist Pre-Deploy

- [ ] `pyproject.toml` creado con entrypoint
- [ ] `api/main.py` tiene `app = FastAPI()`
- [ ] `vercel.json` sin sección `"env"`
- [ ] Variables configuradas en Dashboard de Vercel
- [ ] `requirements.txt` completo
- [ ] Whitelist de emails configurada en código
- [ ] Probado localmente con `uvicorn api.main:app`

---

## ✅ Resultado Esperado

Después de implementar estas soluciones, el deploy debería:

1. ✅ Detectar correctamente el entrypoint de FastAPI
2. ✅ Construir la función serverless sin errores
3. ✅ Cargar las variables de entorno correctamente
4. ✅ Servir la API en `/api/*` y proteger `/ad/*`

---

**Última actualización:** Mayo 2026
