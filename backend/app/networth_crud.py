from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import datetime
from typing import Dict

def create_asset(db: Session, asset: schemas.AssetCreate, user_id: int):
    db_asset = models.Asset(**asset.dict(), user_id=user_id)
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def get_assets(db: Session, user_id: int):
    return db.query(models.Asset).filter(models.Asset.user_id == user_id).all()

def update_asset(db: Session, asset_id: int, asset: schemas.AssetCreate, user_id: int):
    db_asset = db.query(models.Asset).filter(
        models.Asset.id == asset_id, 
        models.Asset.user_id == user_id
    ).first()
    if db_asset:
        for key, value in asset.dict().items():
            setattr(db_asset, key, value)
        db.commit()
        db.refresh(db_asset)
    return db_asset

def delete_asset(db: Session, asset_id: int, user_id: int):
    db_asset = db.query(models.Asset).filter(
        models.Asset.id == asset_id, 
        models.Asset.user_id == user_id
    ).first()
    if db_asset:
        db.delete(db_asset)
        db.commit()
    return db_asset

def create_liability(db: Session, liability: schemas.LiabilityCreate, user_id: int):
    db_liability = models.Liability(**liability.dict(), user_id=user_id)
    db.add(db_liability)
    db.commit()
    db.refresh(db_liability)
    return db_liability

def get_liabilities(db: Session, user_id: int):
    return db.query(models.Liability).filter(models.Liability.user_id == user_id).all()

def update_liability(db: Session, liability_id: int, liability: schemas.LiabilityCreate, user_id: int):
    db_liability = db.query(models.Liability).filter(
        models.Liability.id == liability_id, 
        models.Liability.user_id == user_id
    ).first()
    if db_liability:
        for key, value in liability.dict().items():
            setattr(db_liability, key, value)
        db.commit()
        db.refresh(db_liability)
    return db_liability

def delete_liability(db: Session, liability_id: int, user_id: int):
    db_liability = db.query(models.Liability).filter(
        models.Liability.id == liability_id, 
        models.Liability.user_id == user_id
    ).first()
    if db_liability:
        db.delete(db_liability)
        db.commit()
    return db_liability

def calculate_net_worth(db: Session, user_id: int) -> Dict[str, float]:
    # Calculate total assets
    total_assets = db.query(func.sum(models.Asset.current_value)).filter(
        models.Asset.user_id == user_id
    ).scalar() or 0.0
    
    # Calculate total liabilities
    total_liabilities = db.query(func.sum(models.Liability.current_amount)).filter(
        models.Liability.user_id == user_id
    ).scalar() or 0.0
    
    # Calculate net worth
    net_worth = total_assets - total_liabilities
    
    return {
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": net_worth
    }

def create_net_worth_snapshot(db: Session, user_id: int):
    net_worth_data = calculate_net_worth(db, user_id)
    
    db_snapshot = models.NetWorth(
        total_assets=net_worth_data["total_assets"],
        total_liabilities=net_worth_data["total_liabilities"],
        net_worth=net_worth_data["net_worth"],
        user_id=user_id
    )
    db.add(db_snapshot)
    db.commit()
    db.refresh(db_snapshot)
    return db_snapshot

def get_net_worth_history(db: Session, user_id: int, limit: int = 12):
    return db.query(models.NetWorth).filter(
        models.NetWorth.user_id == user_id
    ).order_by(models.NetWorth.snapshot_date.desc()).limit(limit).all()

def get_net_worth_summary(db: Session, user_id: int) -> schemas.NetWorthSummary:
    net_worth_data = calculate_net_worth(db, user_id)
    
    # Get assets breakdown by category
    assets_breakdown = {}
    assets = db.query(models.Asset).filter(models.Asset.user_id == user_id).all()
    for asset in assets:
        if asset.category not in assets_breakdown:
            assets_breakdown[asset.category] = 0
        assets_breakdown[asset.category] += asset.current_value
    
    # Get liabilities breakdown by category
    liabilities_breakdown = {}
    liabilities = db.query(models.Liability).filter(models.Liability.user_id == user_id).all()
    for liability in liabilities:
        if liability.category not in liabilities_breakdown:
            liabilities_breakdown[liability.category] = 0
        liabilities_breakdown[liability.category] += liability.current_amount
    
    return schemas.NetWorthSummary(
        current_net_worth=net_worth_data["net_worth"],
        total_assets=net_worth_data["total_assets"],
        total_liabilities=net_worth_data["total_liabilities"],
        assets_breakdown=assets_breakdown,
        liabilities_breakdown=liabilities_breakdown
    )