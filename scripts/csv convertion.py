import os
import pandas as pd

base_path = os.path.dirname(os.path.abspath(__file__))  # this is scripts folder
file_path = os.path.join(base_path, '..', 'data', 'openphish.txt')  # go one folder up and then into data

print("Reading file from:", os.path.abspath(file_path))

with open(file_path, 'r') as f:
    urls = f.read().splitlines()

df = pd.DataFrame(urls, columns=['url'])
df['label'] = 'phishing'

output_path = os.path.join(base_path, '..', 'data', 'phishing_clean.csv')
df.to_csv(output_path, index=False)

print("✅ phishing_clean.csv created!")
