from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

from chatterbot import Chatbot
from ch

def index(request):
    return render(request, 'blog/index.html')

def specific(request):
    
    return HttpResponse('list')


def getResponse(request):
    userMessage = request.GET.get('userMessage')
    return HttpResponse(userMessage)