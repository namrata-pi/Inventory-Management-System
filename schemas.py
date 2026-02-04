from pydantic import BaseModel
from datetime import datetime

class InventoryBase(BaseModel):
    item_name: str
    category: str
    quantity_in_stock: int
    reorder_level: int
    supplier: str

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: int
    last_updated: datetime  

    class Config:
        orm_mode = True
