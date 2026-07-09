import os
import random
import urllib.request
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# Popular domains to generate legitimate URL data for balancing
POPULAR_DOMAINS = [
    "google.com", "youtube.com", "facebook.com", "wikipedia.org", "yahoo.com", 
    "amazon.com", "twitter.com", "instagram.com", "linkedin.com", "netflix.com", 
    "microsoft.com", "apple.com", "github.com", "reddit.com", "stackoverflow.com",
    "medium.com", "pinterest.com", "tumblr.com", "twitch.tv", "discord.com",
    "spotify.com", "zoom.us", "dropbox.com", "cloudflare.com", "slack.com",
    "notion.so", "figma.com", "canva.com", "trello.com", "evernote.com",
    "nytimes.com", "cnn.com", "bbc.com", "theguardian.com", "forbes.com",
    "imdb.com", "quora.com", "walmart.com", "ebay.com", "target.com",
    "paypal.com", "stripe.com", "salesforce.com", "hubspot.com", "mailchimp.com"
]

SUBDOMAINS = ["www", "mail", "blog", "docs", "support", "developer", "shop", "news", "account", "billing"]
PATHS = [
    "", "/", "/index.html", "/login", "/home", "/about", "/contact", "/search",
    "/profile", "/settings", "/dashboard", "/feed", "/explore", "/pricing",
    "/docs", "/help", "/download", "/faq", "/terms", "/privacy"
]

def generate_legitimate_urls(count):
    urls = []
    random.seed(42)
    for _ in range(count):
        proto = random.choice(["https://", "http://"])
        sub = random.choice(["", "www.", random.choice(SUBDOMAINS) + "."])
        domain = random.choice(POPULAR_DOMAINS)
        path = random.choice(PATHS)
        urls.append(f"{proto}{sub}{domain}{path}")
    return urls

def download_active_phishing_links(limit=3000):
    feeds = [
        "https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE.txt",
        "https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master/phishing-links-ACTIVE-today.txt",
        "https://openphish.com/feed.txt"
    ]
    
    all_urls = []
    for feed_url in feeds:
        print(f"Downloading phishing links from {feed_url}...")
        try:
            req = urllib.request.Request(
                feed_url, 
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            )
            with urllib.request.urlopen(req) as response:
                content = response.read().decode('utf-8')
                lines = [line.strip() for line in content.split('\n') if line.strip() and not line.startswith('#')]
                print(f"Fetched {len(lines)} URLs from {feed_url}.")
                all_urls.extend(lines)
        except Exception as e:
            print(f"Failed to fetch from {feed_url}: {e}")
            
    # Remove duplicates
    unique_urls = list(set(all_urls))
    print(f"Total unique phishing URLs fetched: {len(unique_urls)}")
    
    if len(unique_urls) > 0:
        random.seed(42)
        random.shuffle(unique_urls)
        return unique_urls[:limit]
        
    return []

def train_universal_model():
    # 1. Load Phishing URLs
    phish_urls = download_active_phishing_links(limit=3000)
    if not phish_urls:
        print("Fallback: Using local phishing URLs...")
        local_data_path = os.path.join("data", "all_urls.csv")
        if os.path.exists(local_data_path):
            df = pd.read_csv(local_data_path)
            phish_urls = df[df["label"].str.lower().str.strip() == "phishing"]["url"].tolist()
        else:
            print("Error: No phishing URLs available.")
            return

    phish_count = len(phish_urls)

    # 2. Generate balancing Legitimate URLs
    print(f"Generating {phish_count} balanced legitimate URLs...")
    legit_urls = generate_legitimate_urls(phish_count)

    # 3. Create Dataset
    df_phish = pd.DataFrame({"url": phish_urls, "label": "phishing"})
    df_legit = pd.DataFrame({"url": legit_urls, "label": "legitimate"})
    balanced_df = pd.concat([df_phish, df_legit], ignore_index=True)
    balanced_df["target"] = balanced_df["label"].apply(lambda x: 1 if x == "phishing" else 0)

    print(f"Balanced Dataset size: {len(balanced_df)} URLs.")
    print(balanced_df["label"].value_counts())

    X = balanced_df["url"]
    y = balanced_df["target"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("\nVectorizing URLs using TF-IDF (char n-grams 3-5)...")
    vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(3, 5), min_df=2)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

    print("\nTraining Universal Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=150, max_depth=35, random_state=42, n_jobs=-1)
    model.fit(X_train_vec, y_train)

    # Evaluate
    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest Set Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Safe", "Phishing"]))

    # Save
    models_dir = "models"
    data_dir = "data"
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    model_path = os.path.join(models_dir, "phish_model.pkl")
    vectorizer_path = os.path.join(data_dir, "vectorizer.pkl")

    # Save training dataset
    balanced_df.to_csv(os.path.join(data_dir, "universal_all_urls.csv"), index=False)

    print(f"\nSaving model to {model_path}...")
    joblib.dump(model, model_path)
    
    print(f"Saving vectorizer to {vectorizer_path}...")
    joblib.dump(vectorizer, vectorizer_path)

    print("\nUniversal model training completed successfully!")

if __name__ == "__main__":
    train_universal_model()
