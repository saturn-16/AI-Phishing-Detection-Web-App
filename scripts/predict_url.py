import re
from urllib.parse import urlparse
import pandas as pd

# Define the helper functions same as training

def url_length(url):
    return len(url)

def count_dots(url):
    return url.count('.')

def count_hyphens(url):
    return url.count('-')

def has_at_symbol(url):
    return int('@' in url)

def has_ip_address(url):
    # Regex to check if URL contains an IP address
    ip_pattern = r'(\d{1,3}\.){3}\d{1,3}'
    return int(bool(re.search(ip_pattern, url)))

def count_subdomains(url):
    # Count subdomains by counting dots in the netloc minus 1 (for domain)
    netloc = urlparse(url).netloc
    # Sometimes www is counted as a subdomain, adjust if needed
    return max(netloc.count('.') - 1, 0)

def uses_https(url):
    return int(url.startswith('https://'))

def contains_suspicious_words(url):
    suspicious_words = ['login', 'secure', 'account', 'update', 'free', 'verify', 'password', 'bank']
    return int(any(word in url.lower() for word in suspicious_words))

# Main feature extraction function used for prediction

def extract_features_from_url(url):
    features = {}
    features['url_length'] = url_length(url)
    features['dot_count'] = count_dots(url)
    features['hyphen_count'] = count_hyphens(url)
    features['has_at'] = has_at_symbol(url)
    features['has_ip'] = has_ip_address(url)
    features['subdomain_count'] = count_subdomains(url)
    features['uses_https'] = uses_https(url)
    features['suspicious_words'] = contains_suspicious_words(url)
    
    return pd.DataFrame([features])

# Example usage inside predict_url.py

def predict_url(url, model):
    features_df = extract_features_from_url(url)
    prediction = model.predict(features_df)[0]
    return 'phishing' if prediction == 1 else 'legitimate'


# Then in your main block (if __name__ == '__main__':), you load model and test URLs like this:

if __name__ == "__main__":
    import joblib
    model = joblib.load("models/phish_model.pkl")
    url = input("Enter URL to check: ")
    result = predict_url(url, model)
    print(f"Prediction: {result}")
