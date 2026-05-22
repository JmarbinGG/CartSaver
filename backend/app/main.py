from fastapi import FastAPI
from app.api.search import router as search_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CartSaver API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(search_router)
