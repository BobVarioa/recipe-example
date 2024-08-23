
cd ./frontend
npm i
node ./scripts/build.mjs
cd ..

cd ./backend
python -m venv .venv
./.venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
cd ..
