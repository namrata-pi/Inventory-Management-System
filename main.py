from fastapi import FastAPI
from database import engine
from datamodel import Base
import routes
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  # allows POST, GET, OPTIONS, DELETE, PUT
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Inventory API is running"}

app.include_router(routes.router)
