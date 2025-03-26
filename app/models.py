from app.database import (
    Base,
    session,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from sqlalchemy import (
    Column,
    Integer,
    SmallInteger,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Table,
    desc,
)

class Reference(Base):
    __tablename__ = 'reference'

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))

class TaxonName(Base):
    __tablename__ = 'taxon_name'

    NOMENCLATURAL_CODE = ()
    NOMENCLATURAL_STATUS =()

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(500))
    name_with_author: Mapped[str] = mapped_column(String(500))
    name_authorship: Mapped[str] = mapped_column(String(500))
    reference_id = mapped_column(ForeignKey('reference.id'))
    rank: Mapped[str] = mapped_column(String(50))
    code: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50))

    reference: Mapped[Reference] = relationship()

class TaxonConcept(Base):
    __tablename__ = 'taxon_concept'

    id: Mapped[int] = mapped_column(primary_key=True)
    taxon_name_id: Mapped[TaxonName] = mapped_column(ForeignKey('taxon_name.id'))
    reference_id: Mapped[Reference] = mapped_column(ForeignKey('reference.id'))
    #parent

class NomenclaturalType(Base):
    __tablename__ = 'nomenclatural_type'

    id = Column(Integer, primary_key=True)
    typified_name: Mapped[str] = mapped_column(String(50))
    taxon_name_id: Mapped[TaxonName] = mapped_column(ForeignKey('taxon_name.id'))
    reference_id: Mapped[Reference] = mapped_column(ForeignKey('reference.id'))
