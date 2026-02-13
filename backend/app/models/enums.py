# app/models/enums.py
from enum import Enum

class UserRole(str, Enum):
    OWNER = "owner"
    VET = "vet"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"

class VetSpecialty(str, Enum):
    GENERAL_PRACTICE = "general_practice"
    SURGERY = "surgery"
    DENTISTRY = "dentistry"
    DERMATOLOGY = "dermatology"
    CARDIOLOGY = "cardiology"
    ORTHOPEDICS = "orthopedics"
    OPHTHALMOLOGY = "ophthalmology"
    EXOTICS = "exotics"

class DayOfWeek(str, Enum):
    MON = "mon"
    TUE = "tue"
    WED = "wed"
    THU = "thu"
    FRI = "fri"
    SAT = "sat"
    SUN = "sun"

