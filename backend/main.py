from app.api.v1.bookings import router as bookings_router
from app.api.v1.pets import router as pets_router
from app.api.v1.users import router as users_router
from app.api.v1.vets import router as vets_router
from fastapi import FastAPI
from fastapi.security import HTTPBearer, OAuth2PasswordBearer

bearer_scheme = HTTPBearer()

app = FastAPI()
app.include_router(users_router, prefix="/api/v1", tags=["users"])
app.include_router(pets_router, prefix="/api/v1", tags=["pets"])
app.include_router(vets_router, prefix="/api/v1", tags=["vets"])
app.include_router(bookings_router, prefix="/api/v1", tags=["bookings"])