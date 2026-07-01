# Deployment Workflow

1. **Verify Environment:** Check environment variables configuration in staging/production (e.g. `MONGODB_URI`, `NEXTAUTH_SECRET`, `AI_PROVIDER`).
2. **Build Docker Image:** Build the container using `docker-compose.yml` or the Dockerfile.
3. **Verify Build Mode:** Ensure standalone build compiles successfully.
4. **Deploy Container:** Roll out containers using rolling updates.
5. **Verify Live Health:** Check endpoint latency and confirm rate limiters work as expected.
