from fastapi import FastAPI

app = FastAPI(title="CartSaver API")


@app.get("/health")
def health():
    return {"status": "ok"}
