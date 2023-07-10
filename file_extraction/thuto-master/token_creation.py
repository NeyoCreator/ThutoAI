import re
import json

def extract_data_from_python_file(file_path):
    print('--extracting data')
    with open(file_path, 'r') as file:
        file_content = file.read()

    print('file content',file_content)

    
    # Create a dictionary to store the extracted data
    data = {'extracted_data': file_content}

    with open('output.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)
    
    return data


# Specify the path to your Python file
python_file_path = 'data/app.py'

# Specify the output JSON file path
output_file_path = 'output.json'

# Extract data from the Python file
extracted_data = extract_data_from_python_file(python_file_path)
