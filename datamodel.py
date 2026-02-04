from sqlalchemy import Column, Integer, String, DateTime # pyright: ignore[reportMissingImports]
from sqlalchemy.sql import func
from database import Base

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    quantity_in_stock = Column(Integer, nullable=False)
    reorder_level = Column(Integer, nullable=False)
    supplier = Column(String, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
