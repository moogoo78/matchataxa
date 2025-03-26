from app.application import flask_app

import subprocess
import click


@flask_app.cli.command('makemigrations')
@click.argument('message')
def makemigrations(message):
    cmd_list = ['alembic', 'revision', '--autogenerate', '-m', message]
    subprocess.call(cmd_list)


@flask_app.cli.command('migrate')
def migrate():
    cmd_list = ['alembic', 'upgrade', 'head']
    subprocess.call(cmd_list)
