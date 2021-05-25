# Running the server

## Install dependencies
### `pip install Flask`
### `pip install send2trash`

## Run
### `set FLASK_APP=server.py`
### `flask run`

Server is supposed to be run on windows. Otherwise some platform specific functionality might not work as expected, 
for example, the file.stat() function returns platform specific parameters.

File deletion also might work differently

Server contains no security checks