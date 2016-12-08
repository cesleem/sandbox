import pandas as pd
from collections import OrderedDict
import json
import numpy as np

# # Read in the data and stack it, so that we can filter on columns
# df = pd.read_csv("soleil/data/fitbit_data.csv")
# sf = df.set_index("Date").stack().reset_index()
# sf = sf.rename(columns={"level_1": "Data", 0: "value"})

# # Let's play with our input
# df["Date"] = pd.to_datetime(df["Date"])
# df["week"] = df["Date"].apply(lambda x: x.isocalendar()[1])
# gf = df.groupby("week").agg({
#         "Date": [np.min, np.max],
#         "Steps": np.sum,
#         "Calories Burned": np.sum,
#         "Distance": np.sum
#     }).reset_index()
# f = lambda x: '_'.join(x) if (len(x[1]) > 0) and x[1] != 'sum' else x[0]
# gf.columns = [f(c) for c in gf.columns]
# gf = gf.sort_index(by="week", ascending=False)
# gf["Date_amin"] = gf["Date_amin"].apply(lambda x: x.strftime("%Y-%m-%d"))
# gf["Date_amax"] = gf["Date_amax"].apply(lambda x: x.strftime("%Y-%m-%d"))
file_name = 'momentum/data/test.csv'
gf = pd.read_csv(file_name)
gf = gf[[u'merch_week', u'visits_last_touch_category', u'visits_device', u'newvisitors',
       u'signups', u'profiles', u'firstorders']]