from app.api.v1.users import router as users_router
from app.api.v1.pets import router as pets_router
from fastapi import FastAPI

app = FastAPI()
app.include_router(users_router,prefix="/api/v1",tags=["users"])
app.include_router(pets_router,prefix="/api/v1",tags=["pets"])