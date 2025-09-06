from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users, vets, pets, bookings, vet_working_hours, vet_time_off

app = FastAPI(
    title="Petique - Pet Booking Management System",
    description="A comprehensive booking system for veterinary appointments",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(vets.router, prefix="/api/v1/vets", tags=["Veterinarians"])
app.include_router(pets.router, prefix="/api/v1/pets", tags=["Pets"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(vet_working_hours.router, prefix="/api/v1/vet-working-hours", tags=["Vet Working Hours"])
app.include_router(vet_time_off.router, prefix="/api/v1/vet-time-off", tags=["Vet Time Off"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Petique - Pet Booking Management System",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "petique-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)