# -*- coding: utf-8 -*-
"""
Created on Fri Jun 11 21:26:03 2021

@author: Abdul Wajid
"""

#import
import uvicorn
from fastapi import FastAPI
import pickle
import preprocess_kgptalkie as ps
import re

app = FastAPI()

#get model
model = pickle.load(open('model.pkl', 'rb'))
loaded_vectorizer = pickle.load(open('vectorizer.pickle', 'rb'))

#First API
@app.get('/')
def index():
    return{'message':'Check'}

#Main API
@app.get('/predict')
def predict_rating(input: str):

    def get_clean(x):
        x = str(x).lower().replace('\\', '').replace('_', ' ')
        x = ps.cont_exp(x)
        x = ps.remove_emails(x)
        x = ps.remove_urls(x)
        x = ps.remove_html_tags(x)
        x = ps.remove_accented_chars(x)
        x = ps.remove_special_chars(x)
        x = re.sub("(.)\\1{2,}", "\\1", x)
        return x

    cleanInput = get_clean(input) 
    prediction = model.predict(loaded_vectorizer.transform([cleanInput]))
    
    #Edit this as you like
    if(prediction == [5]):
        prediction = "Excellent Ratings: User Rated 5 Star"
    elif(prediction == [4]):
        prediction= "Good Raitngs: User Rated 4 Stars"
    elif(prediction == [3]):
        prediction = "Average Ratings: User rated 3 Stars"
    elif(prediction == [2]):
        prediction = "Bad Ratings: User Rated 2 Stars"
    else:
        prediction = "Very Bad Ratings: User Rated 1 Star"
    return{
        'prediction':prediction
    }

if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
