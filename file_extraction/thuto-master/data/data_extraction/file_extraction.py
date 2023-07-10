import os
import json

folder_path = "folder"  # Replace with the actual path to your folder
extensions = ['.py', '.js', '.html', '.css', '.txt']
data_dict = {}

# Iterate through the files in the folder
for filename in os.listdir(folder_path):
    if os.path.isfile(os.path.join(folder_path, filename)):
        file_extension = os.path.splitext(filename)[1]
        if file_extension in extensions:
            file_path = os.path.join(folder_path, filename)
            with open(file_path, 'r') as file:
                file_data = file.read()
                data_dict[filename] = file_data

# Save data into a JSON file
json_file_path = "output.json"  # Replace with the desired path for the JSON file
with open(json_file_path, 'w') as json_file:
    json.dump(data_dict, json_file)
