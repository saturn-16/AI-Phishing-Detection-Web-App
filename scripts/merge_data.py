import os
import pandas as pd

# Set directories relative to this script
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, '..', 'data')

# Paths for individual datasets
phishing_path = os.path.join(data_dir, 'phishing_clean.csv')
legitimate_path = os.path.join(data_dir, 'legitimate_clean.csv')

print(f"Loading phishing URLs from: {phishing_path}")
print(f"Loading legitimate URLs from: {legitimate_path}")

# Load CSVs
phishing_df = pd.read_csv(phishing_path)
legitimate_df = pd.read_csv(legitimate_path)

# Merge data
merged_df = pd.concat([phishing_df, legitimate_df], ignore_index=True)

# Save merged CSV
merged_path = os.path.join(data_dir, 'all_urls.csv')
merged_df.to_csv(merged_path, index=False)

print(f"✅ Merged data saved to: {merged_path}")
