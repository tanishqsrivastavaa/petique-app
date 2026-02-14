import os

from app.api.v1.bookings import router as bookings_router
from app.api.v1.pets import router as pets_router
from app.api.v1.users import router as users_router
from app.api.v1.vets import router as vets_router
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

origins = [
    FRONTEND_URL,
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # alternate local dev
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router, prefix="/api/v1", tags=["users"])
app.include_router(pets_router, prefix="/api/v1", tags=["pets"])
app.include_router(vets_router, prefix="/api/v1", tags=["vets"])
app.include_router(bookings_router, prefix="/api/v1", tags=["bookings"])