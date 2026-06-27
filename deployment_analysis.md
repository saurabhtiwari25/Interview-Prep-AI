# InterviewPrep AI — Deployment Analysis

## What You Have

| Component | Status | Tech |
|-----------|--------|------|
| **Frontend** | ✅ Deployed on Vercel | React + Vite (builds to static files) |
| **Backend** | ❌ Needs deployment | Spring Boot 3.5 (Java 21) — Dockerized |
| **MySQL** | ❌ Needs deployment | MySQL 8.0 — Docker image |
| **ChromaDB** | ❌ Needs deployment | ChromaDB vector store — Docker image |

---

## Your Docker Files Summary

### `backend/Dockerfile`
- **Multi-stage build**: Maven 3.9 + JDK 21 → JRE 21 Alpine
- Produces a fat JAR (`app.jar`) on port **8080**
- Creates `/app/uploads` for file storage
- ✅ Production-ready, well-structured

### `frontend/Dockerfile`
- **Multi-stage build**: Node 22 → Nginx Alpine
- Builds Vite app with `VITE_API_BASE_URL` build arg
- Nginx serves SPA + reverse-proxies `/api/` to backend
- 🟡 Not needed for Vercel (Vercel builds from source). This Dockerfile was for Docker Compose only.

### `docker-compose.yml`
- Orchestrates: **MySQL** → **ChromaDB** → **Backend** → **Frontend**
- Internal Docker network (`interviewprep-net`)
- Persistent volumes for MySQL data, ChromaDB data, and uploads

---

## 🚀 Easiest Deployment Recommendations

### Option A: **Render (Recommended — Easiest & Free Tier)**

This is the simplest path since Render supports Docker natively.

| Service | Where | Free Tier? | Notes |
|---------|-------|------------|-------|
| **Backend** | [Render](https://render.com) Web Service | ✅ Yes (750 hrs/mo) | Deploy directly from Dockerfile |
| **MySQL** | [Aiven](https://aiven.io) or [TiDB Serverless](https://tidbcloud.com) | ✅ Yes | Free managed MySQL |
| **ChromaDB** | [Render](https://render.com) Private Service | ✅ Yes | Deploy `chromadb/chroma` Docker image |

#### Steps:

**1. MySQL → Aiven (Free Managed MySQL)**
- Sign up at [aiven.io](https://aiven.io)
- Create a free MySQL service → get connection URL
- Format: `jdbc:mysql://<host>:<port>/<db>?useSSL=true`

**2. ChromaDB → Render Private Service**
- Create a new **Web Service** on Render
- Use Docker image: `chromadb/chroma:latest`
- Set port to `8000`
- This gives you a URL like `https://your-chromadb.onrender.com`

**3. Backend → Render Web Service**
- Connect your GitHub repo
- Set root directory to `backend`
- Render auto-detects the Dockerfile
- Add these **environment variables** on Render:

```env
# MySQL (from Aiven)
SPRING_DATASOURCE_URL=jdbc:mysql://<aiven-host>:<port>/interviewdb?useSSL=true
SPRING_DATASOURCE_USERNAME=<aiven-user>
SPRING_DATASOURCE_PASSWORD=<aiven-password>

# JWT
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000

# AI - Groq
SPRING_AI_OPENAI_CHAT_BASE_URL=https://api.groq.com/openai
SPRING_AI_OPENAI_CHAT_API_KEY=<your-groq-key>
SPRING_AI_OPENAI_CHAT_OPTIONS_MODEL=llama-3.3-70b-versatile

# AI - Gemini Embeddings
SPRING_AI_OPENAI_EMBEDDING_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
SPRING_AI_OPENAI_EMBEDDING_API_KEY=<your-gemini-key>
SPRING_AI_OPENAI_EMBEDDING_OPTIONS_MODEL=gemini-embedding-001

# OpenAI fallback
SPRING_AI_OPENAI_API_KEY=dummy-key-to-bypass-startup-errors

# ChromaDB (from Render private service)
SPRING_AI_VECTORSTORE_CHROMA_CLIENT_HOST=https://your-chromadb.onrender.com
SPRING_AI_VECTORSTORE_CHROMA_CLIENT_PORT=8000
SPRING_AI_VECTORSTORE_CHROMA_COLLECTION_NAME=interview_prep
SPRING_AI_VECTORSTORE_CHROMA_INITIALIZE_SCHEMA=true
```

**4. Update Vercel Frontend**
- Set env variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
- Redeploy the frontend

---

### Option B: **Railway (One-Click, Supports Docker Compose)**

[Railway](https://railway.app) can deploy your **entire** `docker-compose.yml` in one go.

| Pros | Cons |
|------|------|
| Deploy all 3 services from one repo | Free tier is limited ($5 credit/mo) |
| Native Docker Compose support | May need paid plan for Java + MySQL + ChromaDB |
| Automatic internal networking | |
| Persistent volumes supported | |

#### Steps:
1. Connect your GitHub repo to Railway
2. Railway detects `docker-compose.yml` and creates all services
3. Set environment variables in Railway dashboard
4. Update Vercel frontend with the Railway backend URL

---

### Option C: **Fly.io (Docker-Native, Good Free Tier)**

| Service | How |
|---------|-----|
| Backend | `fly launch` from `backend/` — uses Dockerfile directly |
| ChromaDB | `fly launch` with `chromadb/chroma` image |
| MySQL | Use Fly's built-in Postgres (switch from MySQL) OR use external Aiven MySQL |

> [!WARNING]
> Fly.io requires a credit card even for the free tier. Also, switching from MySQL to Postgres would require changing your JPA dialect and JDBC driver — not trivial.

---

## 🏆 My Recommendation: **Option A (Render + Aiven)**

This is the easiest and cheapest path because:

1. **You already have Docker files** — Render deploys from Dockerfile with zero config
2. **Free tiers cover everything** — Render (750 hrs/mo), Aiven (free MySQL)
3. **No code changes needed** — Everything is configured via environment variables
4. **ChromaDB deploys as a simple Docker image** on Render
5. **You've done this before** with your Lost & Found project (per conversation history)

> [!IMPORTANT]
> ### One Code Change Needed
> Your `application.properties` has hardcoded localhost values. Spring Boot will use environment variables to override these, so the existing file acts as a fallback for local development — **no code change is actually required** as long as you set all the env vars on Render.

> [!CAUTION]
> ### File Uploads
> Your backend stores uploaded files (resumes) at `./uploads`. On Render's free tier, **the filesystem is ephemeral** — files are lost on redeploy. For production, you should switch to a cloud storage service like:
> - **Cloudinary** (free tier: 25GB)
> - **AWS S3** (free tier: 5GB for 12 months)
> - **Supabase Storage** (free tier: 1GB)

---

## Quick Checklist

- [ ] Sign up for [Aiven](https://aiven.io) → create free MySQL instance
- [ ] Sign up for [Render](https://render.com) → deploy ChromaDB as a Web Service
- [ ] Deploy backend on Render → set env vars pointing to Aiven MySQL + ChromaDB
- [ ] Update Vercel env: `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api`
- [ ] Redeploy Vercel frontend
- [ ] Test end-to-end

Want me to help you set up any of these? I can walk you through the Render + Aiven setup step by step.
