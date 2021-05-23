from flask import Flask, request
from urllib.parse import unquote;
from pathlib import Path
import sqlite3

from flask.helpers import send_file

app = Flask(__name__)

def identify_file(f):
    if f.suffix in [".png", ".jpg"]:
        return "IMAGE"
    elif f.suffix == ".mp3":
        return "AUDIO"
    elif f.suffix == ".mp4":
        return "VIDEO"
    elif f.suffix == ".txt":
        return "TEXT"
    elif f.is_dir():
        return "FOLDER"
    else:
        return "UNKNOWN"

@app.route("/location", methods=["GET", "POST"])
def add_location():
    con = sqlite3.connect("app.db")
    cur = con.cursor()

    if request.method == "POST":
        encoded_path = request.args.get("path")
        if not encoded_path:
            return "Mount path not found", 404

        file_path = Path(unquote(encoded_path))
        if not file_path.exists() or not file_path.is_dir():
            return "Mount path not found", 404

        cur.execute("INSERT INTO LOCATIONS (PATH) VALUES (?)", (str(file_path),))
        con.commit()
        return "Mount path created", 201
    else:
        cur.execute("SELECT * FROM LOCATIONS")
        rows = cur.fetchall()
        result = [{ "id": row[0], "path": row[1] } for row in rows] if rows else []
        return { "data": result }

@app.route("/location/<int:id>", methods=["GET", "DELETE"])
def get_or_delete_location(id):
    con = sqlite3.connect("app.db")
    cur = con.cursor()

    cur.execute("SELECT PATH FROM LOCATIONS WHERE ID = ?", (id,))
    mount_path = cur.fetchone()
    if not mount_path:
        return "Mount path not found", 404
    mount_path = Path(mount_path[0])

    if request.method == "GET":
        def process_files(root, current_directory, current_path):
            for file in root.iterdir():
                file_type = identify_file(file)
                slash_str = "" if len(current_path) == 0 else "/"
                directory_file = {
                    "name": file.name,
                    "type": file_type,
                }

                if file.is_dir():
                    child_files = []
                    process_files(file, child_files, current_path + slash_str + file.name)
                    directory_file["children"] = child_files
                else:
                    file_info = file.stat()
                    directory_file["size"] = file_info.st_size
                    directory_file["creation_time"] = file_info.st_ctime_ns
                    directory_file["path"] = current_path + slash_str + file.name

                current_directory.append(directory_file)

        root_directory = {
            "name": mount_path.name,
            "type": "FOLDER",
            "children": []
        }

        process_files(mount_path, root_directory["children"], "")
        return {"data": root_directory}, 200
    else:
        cur.execute("DELETE FROM LOCATIONS WHERE ID = ?", (id,))
        con.commit()
        return "Mount path removed", 200

@app.route("/location/<int:id>/file")
def get_location_file(id):
    file_path = request.args.get("path")
    if not file_path:
        return "Invalid path id spcified!", 404

    con = sqlite3.connect("app.db")
    cur = con.cursor()

    cur.execute("SELECT PATH FROM LOCATIONS WHERE ID = ?", (id,))
    mount_path = cur.fetchone()
    if not mount_path:
        return "Invalid path id spcified!", 404

    full_file_path = Path(mount_path[0], file_path)
    if not full_file_path.exists():
        return "Invalid path id spcified!", 404

    return send_file(full_file_path)
