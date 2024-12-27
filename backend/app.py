from fastapi import FastAPI, HTTPException,Form,File,UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.hash import bcrypt
from fastapi import Body

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = "sqlite:///./users.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# User model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

# Create the database tables
Base.metadata.create_all(bind=engine)

# Define the Pydantic model for the sign-up request body
class SignupRequest(BaseModel):
    username: str
    password: str

# Sign-up API
@app.post("/signup")
async def signup(request: SignupRequest):
    # Check if user already exists
    user = db.query(User).filter(User.username == request.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Username already exists")
    if not request.username or not request.password:
        raise HTTPException(status_code=422, detail="Both username and password are required.")

    # Create new user
    hashed_password = bcrypt.hash(request.password)
    new_user = User(username=request.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "User created successfully!"}

# Login API
@app.post("/login")
async def login(request: SignupRequest):
    # Verify user
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not bcrypt.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    return {"message": "Login successful", "user": {"id": user.id, "username": user.username}}
@app.post("/upload-health-report")
async def upload_health_report(
    question1: str = Form(...),
    question2: str = Form(...),
    question3: str = Form(...),
    file: UploadFile = File(...),
):
    # Placeholder logic for file processing and saving
    if not file.filename.endswith(('.pdf', '.jpg', '.jpeg', '.png')):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Save the file to the server (or any other processing)
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())

    return JSONResponse(content={"msg": "Health report uploaded successfully!"})
# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
