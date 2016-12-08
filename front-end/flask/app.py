from flask import Flask
import pandas as pd


#read in data
df = pd.read_csv("project/data/question_stats.csv")
d = df.head().to_string()

app = Flask(__name__)

@app.route('/')
def hello_ceslee():
    return d


if __name__ == "__main__":
    app.run(port=5001)

