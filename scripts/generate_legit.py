import os
import pandas as pd

# Step 1: Define your legitimate URLs list
legit_urls = [
    "https://www.google.com",
    "https://www.microsoft.com",
    "https://www.wikipedia.org",
    "https://www.amazon.com",
    "https://www.facebook.com"
]

# Step 2: Create a DataFrame
df = pd.DataFrame(legit_urls, columns=['url'])
df['label'] = 'legitimate'

# Step 3: Ensure 'data' directory exists (relative to this script)
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, '..', 'data')  # one level up + data folder
os.makedirs(data_dir, exist_ok=True)  # create folder if missing

# Step 4: Define output file path
output_path = os.path.join(data_dir, 'legitimate_clean.csv')

# Step 5: Save the CSV file
df.to_csv(output_path, index=False)

print(f"✅ Legitimate URLs CSV successfully created at:\n{output_path}")
