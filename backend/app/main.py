from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, curricula, modules, lessons, discovery
from app.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse


app = FastAPI(title="ArkHive API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
    "https://curriculummanagementapp-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

app.include_router(auth.router)
app.include_router(curricula.router)
app.include_router(modules.router)
app.include_router(lessons.router)
app.include_router(discovery.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}