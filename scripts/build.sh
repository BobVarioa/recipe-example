cd ./frontend
node ./scripts/build.mjs
cd ..

cd ./backend
python manage.py collectstatic --noinput
cd ..