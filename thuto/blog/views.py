from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def index(request):
    return render(request, 'blog/index.html')

def specific(request):
    number = 55
    return HttpResponse(number)


def getResponse(request):
    userMessage = request.GET.get('userMessage')
    return HttpResponse(userMessage)