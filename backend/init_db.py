#!/usr/bin/env python3

"""
Database initialization script
This script creates the database tables and optionally seeds initial data
"""

import os
import sys
from pathlib import Path

# Add the parent directory to Python path to import app modules
sys.path.append(str(Path(__file__).parent))

from app import create_app, db
from app.models.user import User

def init_database():
    """Initialize the database with tables"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully!")
        
        # Create some sample users if the table is empty
        if User.query.count() == 0:
            print("Creating sample users...")
            sample_users = [
                User(name="Juan Pérez", email="juan@example.com"),
                User(name="María García", email="maria@example.com"),
                User(name="Carlos López", email="carlos@example.com"),
            ]
            
            for user in sample_users:
                db.session.add(user)
            
            db.session.commit()
            print(f"Created {len(sample_users)} sample users")
        else:
            print("Users table already contains data, skipping sample data creation")

if __name__ == "__main__":
    print("Initializing database...")
    init_database()
    print("Database initialization completed!")
