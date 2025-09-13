"""
Database connection utility similar to PyMySQL style
"""
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConnection:
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        self.database = os.getenv('DB_NAME', 'tesis_deterioro_cognitivo')
        self.user = os.getenv('DB_USER', 'postgres')
        self.password = os.getenv('DB_PASSWORD', 'password')
    
    def get_connection(self):
        """Get database connection similar to PyMySQL"""
        return psycopg2.connect(
            host=self.host,
            port=self.port,
            database=self.database,
            user=self.user,
            password=self.password,
            cursor_factory=psycopg2.extras.RealDictCursor  # Returns dict-like rows
        )
    
    @contextmanager
    def get_cursor(self):
        """Context manager for database cursor"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
    
    def execute_query(self, query, params=None):
        """Execute a SELECT query and return results"""
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()
    
    def execute_one(self, query, params=None):
        """Execute a SELECT query and return one result"""
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchone()
    
    def execute_modify(self, query, params=None):
        """Execute INSERT, UPDATE, DELETE queries"""
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.rowcount

# Global database instance
db = DatabaseConnection()

# Usage examples (similar to PyMySQL):
"""
# Select all users
users = db.execute_query("SELECT * FROM users")

# Select one user
user = db.execute_one("SELECT * FROM users WHERE id = %s", (user_id,))

# Insert user
db.execute_modify(
    "INSERT INTO users (name, email) VALUES (%s, %s)", 
    (name, email)
)

# Update user
db.execute_modify(
    "UPDATE users SET name = %s WHERE id = %s", 
    (new_name, user_id)
)

# Delete user
db.execute_modify("DELETE FROM users WHERE id = %s", (user_id,))
"""
