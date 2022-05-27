
## For the first time, you have to create virtual environment
```
python -m venv venv
```

## Activate the virtual environment
For windows,
```
.\venv\Scripts\Activate.ps1   
```

## Install dependence
```
pip install to-requirements.txt
```

## Configue Azure IoT
Copy .env.template and rename it to .env.
Fill in the value and you can get them from CDKTF output - secrets.json.

## Run the Azure IoT Client
For windows,
```
python .\main.py
```
