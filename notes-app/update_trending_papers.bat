@echo off
echo Updating trending papers cache...
cd note-server
python update_cache.py
echo.
echo Done. You can now view trending papers on the home page.
pause 