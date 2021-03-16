@echo off
setlocal
wget https://www.python.org/ftp/python/3.9.1/python-3.9.1-embed-amd64.zip
powershell -command "Expand-Archive 'python-3.9.1-embed-amd64.zip' '.\Python\'"
del python-3.9.1-embed-amd64.zip
cd Python\
powershell -Command "(gc python39._pth) -replace '#import', 'import' | Out-File -encoding ASCII python39._pth"
wget https://bootstrap.pypa.io/get-pip.py
python.exe get-pip.py
del get-pip.py
cd ..
powershell -command "Python/python -m pip install -r requirements.txt"