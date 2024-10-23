from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "mysql+mysqlconnector://root:Topcoder24$@localhost:3306/IntuitNotDB"

engine = create_engine(DATABASE_URL)

Base = declarative_base()

sessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
