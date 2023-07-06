from django.shortcuts import render
from django.http import HttpResponse
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
import nltk

import nltk
import ssl

# try:
#     _create_unverified_https_context = ssl._create_unverified_context
# except AttributeError:
#     pass
# else:
#     ssl._create_default_https_context = _create_unverified_https_context

# nltk.download()


# Chatbot object
bot = ChatBot('chat',read_only=False,logic_adapters=['chatterbot.logic.BestMatch'])

# TRAINING DATA BASED ON Q/A FORMAT
list_to_train=[
    "hi", #Question
    "hi, there", #Answer

    "what's your name?",
    "I am Thuto",

    "what is your favorite food?",
    "I like cheese"
]


list_trainer = ListTrainer(bot)
list_trainer.train(list_to_train)

def index(request):
    return render(request, 'blog/index.html')

def specific(request):
    
    return HttpResponse('list')

def getResponse(request):
    userMessage = request.GET.get('userMessage')
    chatResponse = str(bot.get_response(userMessage))
    return HttpResponse(chatResponse)