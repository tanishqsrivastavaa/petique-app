"""add_role_to_users_and_restore_vet_fks

Revision ID: 2363493ee52f
Revises: 9f280dd87bb0
Create Date: 2026-02-13 11:05:40.221862

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision: str = '2363493ee52f'
down_revision: Union[str, Sequence[str], None] = '9f280dd87bb0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the enum type first
    userrole_enum = sa.Enum('OWNER', 'VET', name='userrole')
    userrole_enum.create(op.get_bind(), checkfirst=True)

    # Add role column with a server default so existing rows get 'OWNER'
    op.add_column('users', sa.Column('role', userrole_enum, nullable=False, server_default='OWNER'))

    # Add vets.user_id as nullable first (existing vets have no linked user yet)
    op.add_column('vets', sa.Column('user_id', sa.Uuid(), nullable=True))
    op.create_unique_constraint('uq_vets_user_id', 'vets', ['user_id'])
    op.create_foreign_key('fk_vets_user_id', 'vets', 'users', ['user_id'], ['id'])

    # Add vet_working_hours.vet_id as nullable first (existing rows have no vet)
    op.add_column('vet_working_hours', sa.Column('vet_id', sa.Uuid(), nullable=True))
    op.create_foreign_key('fk_vet_working_hours_vet_id', 'vet_working_hours', 'vets', ['vet_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_vet_working_hours_vet_id', 'vet_working_hours', type_='foreignkey')
    op.drop_column('vet_working_hours', 'vet_id')
    op.drop_constraint('fk_vets_user_id', 'vets', type_='foreignkey')
    op.drop_constraint('uq_vets_user_id', 'vets', type_='unique')
    op.drop_column('vets', 'user_id')
    op.drop_column('users', 'role')
    
    # Drop the enum type
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
