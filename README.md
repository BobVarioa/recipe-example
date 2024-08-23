# Re¢ipes

### About
This is a toy recipe website example, it currently allows you to:
- write recipes in rich text (markdown)
- view recipes written by others
- search for recipes based on tags
- calculate the cost of a recipe based on information input by the user
- suggests costs of ingredients based on other users near you

### Install
A installation script has been provided for ubuntu, `./scripts/install.sh`.
Start the development server with `./scripts/start.sh`

### Deployment
Currently, this just uses Django's debug server but that is *not* suitable for production.
You'd likely want something that can run WSGI servers (Apache + `mod_wsgi`, or gunicorn + nginx).
Also, this currently uses `sqlite` but any production implementation would need to use a shared database server, like MySQL, PostgreSQL, or similar.
Some more information about deployment is provided in `./backend/src/settings.py`.
