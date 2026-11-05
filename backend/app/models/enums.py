import enum

class TransactionType(str, enum.Enum):
    SALE = "SALE"
    RENT = "RENT"
    LEASE = "LEASE"

class AssetCategory(str, enum.Enum):
    LAND = "LAND"
    RESIDENTIAL = "RESIDENTIAL"
    COMMERCIAL = "COMMERCIAL"
    VEHICLE = "VEHICLE"

class ListingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    PAUSED = "PAUSED"
    SOLD = "SOLD"
    RENTED = "RENTED"
    LEASED = "LEASED"
    UNAVAILABLE = "UNAVAILABLE"

class RentalPeriod(str, enum.Enum):
    PER_NIGHT = "per_night"
    PER_DAY = "per_day"
    PER_WEEK = "per_week"
    PER_MONTH = "per_month"
    PER_YEAR = "per_year"

class LocationPrivacy(str, enum.Enum):
    EXACT = "EXACT"
    APPROXIMATE = "APPROXIMATE"
    NEIGHBOURHOOD_ONLY = "NEIGHBOURHOOD_ONLY"

class UserRole(str, enum.Enum):
    BUYER = "buyer"
    TENANT = "tenant"
    RENTER = "renter"
    LANDLORD = "landlord"
    SELLER = "seller"
    AGENT = "agent"
    DEALER = "dealer"
    RENTAL_COMPANY = "rental_company"
    DEVELOPER = "developer"
    MODERATOR = "moderator"
    VERIFICATION_OFFICER = "verification_officer"
    SUPPORT = "support"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class RequirementStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    FULFILLED = "FULFILLED"
    EXPIRED = "EXPIRED"

class BookingStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class InspectionStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    RESCHEDULED = "RESCHEDULED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class InspectionType(str, enum.Enum):
    PHYSICAL = "PHYSICAL"
    VIRTUAL = "VIRTUAL"

class VerificationStatus(str, enum.Enum):
    NOT_SUBMITTED = "NOT_SUBMITTED"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
