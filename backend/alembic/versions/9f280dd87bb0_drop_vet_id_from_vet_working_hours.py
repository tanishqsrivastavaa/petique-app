"""drop vet_id from vet_working_hours

Revision ID: 9f280dd87bb0
Revises: e4d3d7c4cd31
Create Date: 2025-11-06 23:03:12.291641

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel



# revision identifiers, used by Alembic.
revision: str = '9f280dd87bb0'
down_revision: Union[str, Sequence[str], None] = 'e4d3d7c4cd31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop foreign key constraint first
    op.drop_constraint('vet_working_hours_vet_id_fkey', 'vet_working_hours', type_='foreignkey')
    
    # Drop the column
    op.drop_column('vet_working_hours', 'vet_id')


def downgrade() -> None:
    # Add column back
    op.add_column('vet_working_hours', sa.Column('vet_id', sa.UUID(), nullable=False))
    
    # Recreate foreign key constraint
    op.create_foreign_key('vet_working_hours_vet_id_fkey', 'vet_working_hours', 'vets', ['vet_id'], ['id'])