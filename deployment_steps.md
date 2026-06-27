# InterviewPrep AI — Step-by-Step Deployment Guide

> Frontend is on Vercel ✅. This guide deploys: **MySQL + ChromaDB + Spring Boot Backend**

---

## Step 0: Fix CORS (Required Before Deploying)

> [!CAUTION]
> Your backend has NO `CorsConfigurationSource` bean. Without this, your Vercel frontend (`interviewprep.vercel.app`) **cannot** call APIs on Render (`xxx.onrender.com`) — browsers will block every request.

Create this file in your backend:

#### [NEW] `backend/src/main/java/com/interview/backend/config/CorsConfig.java`

```java
package com.interview.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

Then on Render, you'll set the env var:
```
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

---

## Step 1: Set Up MySQL on Aiven (Free) — 5 minutes

1. Go to [aiven.io](https://aiven.io) → **Sign up** (use GitHub for quick signup)
2. Click **Create Service** → Select **MySQL**
3. Choose **Free plan** (Hobbyist)
4. Pick the closest region (e.g., `google-mumbai` for India)
5. Click **Create Service** — wait ~2 minutes for it to provision
6. Once ready, go to the **Overview** tab and note down:

| Field | Example Value |
|-------|---------------|
| Host | `mysql-xxxxx.aiven.io` |
| Port | `12345` |
| User | `avnadmin` |
| Password | `AVNS_xxxxxxxxxxxxx` |
| Database | `defaultdb` (you can create `interviewdb` later) |

7. In the Aiven console, go to **Databases** tab → **Create Database** → name it `interviewdb`

> [!TIP]
> Your JDBC URL will be:
> ```
> jdbc:mysql://mysql-xxxxx.aiven.io:12345/interviewdb?useSSL=true&requireSSL=true
> ```

---

## Step 2: Deploy ChromaDB on Render — 5 minutes

1. Go to [render.com](https://render.com) → **Sign up** (use GitHub)
2. Click **New** → **Web Service**
3. Select **Deploy an existing image from a registry**
4. Enter image URL: `chromadb/chroma:latest`
5. Configure:

| Setting | Value |
|---------|-------|
| Name | `interviewprep-chromadb` |
| Region | Oregon (or closest to your MySQL) |
| Instance Type | **Free** |
| Port | `8000` |

6. Click **Deploy Web Service**
7. Wait for it to go live → Note the URL (e.g., `https://interviewprep-chromadb.onrender.com`)

> [!NOTE]
> Free tier services on Render spin down after 15 min of inactivity. First request after sleep takes ~30-50 seconds. This is normal for free tier.

---

## Step 3: Deploy Spring Boot Backend on Render — 10 minutes

1. **Push your code to GitHub** (make sure the CORS fix from Step 0 is committed)

2. On Render, click **New** → **Web Service**

3. Connect your **GitHub repo** (`Interview-Prep-AI`)

4. Configure:

| Setting | Value |
|---------|-------|
| Name | `interviewprep-backend` |
| Root Directory | `backend` |
| Environment | **Docker** |
| Instance Type | **Free** |
| Port | `8080` |

5. Go to **Environment** tab → Add these variables one by one:

```
# ---- MySQL (from Aiven Step 1) ----
SPRING_DATASOURCE_URL=jdbc:mysql://<AIVEN_HOST>:<PORT>/interviewdb?useSSL=true&requireSSL=true
SPRING_DATASOURCE_USERNAME=avnadmin
SPRING_DATASOURCE_PASSWORD=<AIVEN_PASSWORD>

# ---- JWT ----
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000

# ---- AI - Groq (Chat) ----
SPRING_AI_OPENAI_CHAT_BASE_URL=https://api.groq.com/openai
SPRING_AI_OPENAI_CHAT_API_KEY=<your-groq-api-key>
SPRING_AI_OPENAI_CHAT_OPTIONS_MODEL=llama-3.3-70b-versatile

# ---- AI - Gemini (Embeddings) ----
SPRING_AI_OPENAI_EMBEDDING_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
SPRING_AI_OPENAI_EMBEDDING_API_KEY=<your-gemini-api-key>
SPRING_AI_OPENAI_EMBEDDING_OPTIONS_MODEL=gemini-embedding-001

# ---- OpenAI fallback ----
SPRING_AI_OPENAI_API_KEY=dummy-key-to-bypass-startup-errors

# ---- ChromaDB (from Step 2) ----
SPRING_AI_VECTORSTORE_CHROMA_CLIENT_HOST=https://interviewprep-chromadb.onrender.com
SPRING_AI_VECTORSTORE_CHROMA_CLIENT_PORT=8000
SPRING_AI_VECTORSTORE_CHROMA_COLLECTION_NAME=interview_prep
SPRING_AI_VECTORSTORE_CHROMA_INITIALIZE_SCHEMA=true

# ---- CORS ----
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

6. Click **Deploy** → Wait for build + deploy (~5-8 min for first build, Maven downloads dependencies)

7. Once live, note the URL (e.g., `https://interviewprep-backend.onrender.com`)

8. **Test it**: Visit `https://interviewprep-backend.onrender.com/api/health` — should return a response

---

## Step 4: Update Vercel Frontend — 2 minutes

1. Go to [vercel.com](https://vercel.com) → Open your project
2. Go to **Settings** → **Environment Variables**
3. Add (or update):

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://interviewprep-backend.onrender.com/api` |

4. Go to **Deployments** → Click **⋮** on the latest → **Redeploy**
5. Wait for the build to finish

---

## Step 5: Test End-to-End ✅

1. Open your Vercel app URL
2. **Register** a new account → should work (MySQL is connected)
3. **Login** → should get JWT token
4. **Upload a resume** → should parse and store
5. **Start an AI interview** → should connect to Groq via backend
6. Check Render logs if anything fails: Render Dashboard → your service → **Logs**

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS errors in browser console | Check `CORS_ALLOWED_ORIGINS` env var matches your exact Vercel URL (no trailing slash) |
| Backend won't start | Check Render logs — usually a missing env var or MySQL connection issue |
| MySQL connection refused | Verify Aiven credentials, make sure `useSSL=true` is in the JDBC URL |
| ChromaDB timeout | Free tier may be sleeping — wait 30s and retry |
| API calls return 502 | Backend may still be building — wait for deploy to finish |
| File uploads lost on redeploy | Expected on free tier — consider Cloudinary for persistent storage |

---

## Architecture After Deployment

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│   Vercel     │ ──────────────▶│  Render Backend  │
│  (Frontend)  │                │  (Spring Boot)   │
└─────────────┘                └────────┬─────────┘
                                        │
                          ┌─────────────┼─────────────┐
                          │             │             │
                          ▼             ▼             ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                    │  Aiven   │ │  Render  │ │  Groq /  │
                    │  MySQL   │ │ ChromaDB │ │  Gemini  │
                    └──────────┘ └──────────┘ └──────────┘
```

> [!IMPORTANT]
> **Total cost: $0/month** on free tiers. The only limitation is Render free tier services sleep after 15 min of inactivity (cold start ~30-50s).
