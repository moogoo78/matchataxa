from datetime import datetime
from decimal import Decimal
from flask import (
    current_app
)
from sqlalchemy import (
    create_engine,
    inspect,
    Integer,
    Column,
    String,
    DateTime,
    Date,
    ForeignKey,
    Numeric,
    Boolean,
)
from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    Session,
    relationship,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import JSONB


#session = Session(engine, future=True)

# class MyBase(object):
#     def save(self, data={}):
#         if len(data):
#             print('save1')
#             inst = inspect(self)
#             field_names = [x.key for x in inst.mapper.column_attrs]
#             print(dir(inst), dir(self))
#             for k, v in data.items():
#                 if k in field_names and v != self[k]:
#                     setattr(obj, k, v)
#                     pass
#             #session.commit()
#Base = declarative_base(cls=MyBase)
Base = declarative_base()

#def init_db(config):
    #print(config, flush=True)
#engine = create_engine(config['DATABASE_URI'])
engine = create_engine('postgresql+psycopg2://postgres:example@postgres:5432/machataxa')
session = scoped_session(sessionmaker(autocommit=False,
                                      autoflush=False,
                                      bind=engine))
#db_insp = inspect(engine)

Base.query = session.query_property()
