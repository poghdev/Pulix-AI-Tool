from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routes import auth, generate_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5501",
        "http://127.0.0.1:5501"
    ],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(generate_image.router)