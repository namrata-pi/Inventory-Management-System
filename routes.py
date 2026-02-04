from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import datamodel, schemas
from fastapi import HTTPException
from sqlalchemy import func

router = APIRouter()


# -------------------------------------------
# 1. Summary endpoint FIRST (fixed path)
# -------------------------------------------
@router.get("/inventory/summary")
def get_inventory_summary(db: Session = Depends(get_db)):

    items = db.query(datamodel.InventoryItem).all()

    total_items = len(items)
    total_quantity = sum(item.quantity_in_stock for item in items)

    # low stock = quantity < reorder_level
    low_stock_items = [
        item for item in items if item.quantity_in_stock < item.reorder_level
    ]
    low_stock_count = len(low_stock_items)

    
    category_summary = {}
    for item in items:
        category_summary[item.category] = category_summary.get(item.category, 0) + 1

    last_updated_item = None
    if items:
        last_updated_item = max(items, key=lambda x: x.last_updated)

    return {
        "total_items": total_items,
        "total_quantity": total_quantity,
        "low_stock_count": low_stock_count,
        "category_summary": category_summary,
        "last_updated_item": last_updated_item
    }




# -------------------------------------------
# 2. GET all items
# -------------------------------------------
@router.get("/inventory", response_model=list[schemas.Inventory])
def get_all_inventory_items(db: Session = Depends(get_db)):
    items = db.query(datamodel.InventoryItem).all()
    return items

# -------------------------------------------
# 3. CREATE item
# -------------------------------------------

@router.post("/inventory", response_model=schemas.Inventory)
def create_inventory_item(item: schemas.InventoryCreate, db: Session = Depends(get_db)):

    db_item = datamodel.InventoryItem(
        item_name=item.item_name,
        category=item.category,
        quantity_in_stock=item.quantity_in_stock,
        reorder_level=item.reorder_level,
        supplier=item.supplier
    )


    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return db_item

@router.get("/inventory/alerts", response_model=list[schemas.Inventory])
def get_low_stock_alerts(db: Session = Depends(get_db)):
    low_items = db.query(datamodel.InventoryItem).filter(
        datamodel.InventoryItem.quantity_in_stock < datamodel.InventoryItem.reorder_level
    ).all()

    return low_items


# -------------------------------------------
# 4. GET item by ID 
# -------------------------------------------
@router.get("/inventory/{item_id}", response_model=schemas.Inventory)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(datamodel.InventoryItem).filter(datamodel.InventoryItem.id == item_id).first()
    
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item

# -------------------------------------------
# 5. UPDATE items by item id 
# -------------------------------------------
@router.put("/inventory/{item_id}", response_model=schemas.Inventory)
def update_inventory_item(item_id: int, updated_item: schemas.InventoryCreate, db: Session = Depends(get_db)):
    item = db.query(datamodel.InventoryItem).filter(datamodel.InventoryItem.id == item_id).first()

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    item.item_name = updated_item.item_name
    item.category = updated_item.category
    item.quantity_in_stock = updated_item.quantity_in_stock
    item.reorder_level = updated_item.reorder_level
    item.supplier = updated_item.supplier

    db.commit()
    db.refresh(item)

    return item


# -------------------------------------------
# 6. Delete items by item id 
# -------------------------------------------

@router.delete("/inventory/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(datamodel.InventoryItem).filter(datamodel.InventoryItem.id == item_id).first()

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()

    return {"message": "Item deleted successfully"}






