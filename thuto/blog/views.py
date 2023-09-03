import json
from django.shortcuts import redirect, render
from django.http import HttpResponse
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
import nltk
from django.shortcuts import render
from django.http import HttpResponse
from django.core.files.storage import FileSystemStorage

import ssl
# import spacy

# Load the small English model
# nlp = spacy.load("en_core_web_sm")
# try:
#     _create_unverified_https_context = ssl._create_unverified_context
# except AttributeError:
#     pass
# else:
#     ssl._create_default_https_context = _create_unverified_https_context

# nltk.download()


# Chatbot object
# bot = ChatBot('chat', read_only=False, logic_adapters=['chatterbot.logic.BestMatch'])



# TRAINING DATA BASED ON Q/A FORMAT
list_to_train=[
    "hi", #Question
    "hi, there", #Answer

    "what's your name?",
    "I am Thuto",

    "what is your favorite food?",
    "I like cheese",

    "What is your favourite sport",
    "programming"
]


# list_trainer = ListTrainer(bot)
# list_trainer.train(list_to_train)

def index(request):
    # Read the JSON file
    with open('user_data.json', 'r') as file:
        json_data = file.read()

    # Parse the JSON data
    user_data = json.loads(json_data)

    # Get the file name from the parsed data
    file_name = user_data.get('file_name', 'No File')

    # Pass the file name to the template context
    context = {
        'file_name': file_name
    }
    return render(request, 'blog/index.html')

def specific(request):
    return HttpResponse('list')

# def getResponse(request):
#     userMessage = request.GET.get('userMessage')
#     chatResponse = str(bot.get_response(userMessage))
#     return HttpResponse(chatResponse)

def submission(request):
    if request.method == 'POST' and request.FILES['file']:
        uploaded_file = request.FILES['file']
        name = request.POST['name']
        fs = FileSystemStorage()
        fs.save(name, uploaded_file)

        # Save user input data to a JSON file
        user_data = {
            'name': name,
            'file_name': uploaded_file.name
        }
        json_data = json.dumps(user_data)
        with open('user_data.json', 'w') as file:
            file.write(json_data)
            
        return redirect('index') 

    return render(request, 'blog/submission.html')