import os
import pandas as pd

current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, '..', 'data')

phishing_path = os.path.join(data_dir, 'phishing_clean.csv')
legitimate_path = os.path.join(data_dir, 'legitimate_clean.csv')

print(f"Loading phishing data from: {phishing_path}")
print(f"Loading legitimate data from: {legitimate_path}")

phishing = pd.read_csv(phishing_path)
legitimate = pd.read_csv(legitimate_path)

# Combine datasets
all_urls = pd.concat([phishing, legitimate], ignore_index=True)

# Save combined dataset
combined_path = os.path.join(data_dir, 'all_urls.csv')
all_urls.to_csv(combined_path, index=False)

print(f"✅ Combined dataset saved at:\n{combined_path}")

# Add feature extraction code below (or in a next step)
import pandas as pd
import os

# Build the full path to the CSV file
current_dir = os.path.dirname(os.path.abspath(__file__))  # path of script folder
data_dir = os.path.join(current_dir, '..', 'data')       # go up one folder, then into data
file_path = os.path.join(data_dir, 'all_urls.csv')

print(f"Loading data from: {file_path}")

# Load CSV into pandas DataFrame
df = pd.read_csv(file_path)

# Print first 5 rows to verify
print(df.head())

import pandas as pd
import re
import os

# Helper functions to extract features

def url_length(url):
    return len(url)

def count_dots(url):
    return url.count('.')

def count_hyphens(url):
    return url.count('-')

def has_at_symbol(url):
    return 1 if '@' in url else 0

def has_ip_address(url):
    # Checks if URL contains an IP address instead of domain name
    pattern = r'(\d{1,3}\.){3}\d{1,3}'
    return 1 if re.search(pattern, url) else 0

def count_subdomains(url):
    # Count number of subdomains (excluding www)
    domain = re.findall(r'://([^/]+)', url)
    if domain:
        parts = domain[0].split('.')
        # Subtract 2 (domain + TLD), e.g., example.com
        return max(len(parts) - 2, 0)
    return 0

def uses_https(url):
    return 1 if url.startswith('https://') else 0

def contains_suspicious_words(url):
    suspicious_words = ['login', 'verify', 'update', 'secure', 'account', 'bank', 'free', 'lucky', 'bonus']
    return 1 if any(word in url.lower() for word in suspicious_words) else 0


# Load data
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, '..', 'data')
file_path = os.path.join(data_dir, 'all_urls.csv')

print(f"Loading data from: {file_path}")
df = pd.read_csv(file_path)

print("Extracting features...")

# Extract features and create new columns
df['url_length'] = df['url'].apply(url_length)
df['dot_count'] = df['url'].apply(count_dots)
df['hyphen_count'] = df['url'].apply(count_hyphens)
df['has_at'] = df['url'].apply(has_at_symbol)
df['has_ip'] = df['url'].apply(has_ip_address)
df['subdomain_count'] = df['url'].apply(count_subdomains)
df['uses_https'] = df['url'].apply(uses_https)
df['suspicious_words'] = df['url'].apply(contains_suspicious_words)

# Save features to CSV
output_file = os.path.join(data_dir, 'feature_extracted.csv')
df.to_csv(output_file, index=False)

print(f"Features extracted and saved to: {output_file}")




