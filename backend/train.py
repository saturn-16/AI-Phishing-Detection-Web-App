import os
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

SUBDOMAINS = ["www", "mail", "blog", "docs", "support", "developer", "shop", "news"]
PATHS = [
    "", "/", "/index.html", "/login", "/home", "/about", "/contact", "/search",
    "/profile", "/settings", "/dashboard", "/feed", "/explore", "/pricing",
    "/docs", "/help", "/download", "/faq", "/terms", "/privacy"
]

def generate_legitimate_urls(count):
    urls = []
    import random
    random.seed(42)
    for _ in range(count):
        proto = random.choice(["https://", "http://"])
        sub = random.choice(["", "www.", random.choice(SUBDOMAINS) + "."])
        domain = random.choice(POPULAR_DOMAINS)
        path = random.choice(PATHS)
        urls.append(f"{proto}{sub}{domain}{path}")
    return urls

def train_model():
    data_path = os.path.join("data", "all_urls.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    print("Loading original dataset...")
    df = pd.read_csv(data_path)
    print(f"Original dataset shape: {df.shape}")
    
    # Filter only phishing URLs in the original dataset
    phish_df = df[df["label"].str.lower().str.strip() == "phishing"].copy()
    phish_count = len(phish_df)
    print(f"Found {phish_count} phishing URLs.")

    # Generate an equal number of legitimate URLs to perfectly balance the dataset
    print(f"Generating {phish_count} legitimate URLs for balanced training...")
    legit_urls = generate_legitimate_urls(phish_count)
    legit_df = pd.DataFrame({
        "url": legit_urls,
        "label": ["legitimate"] * phish_count
    })

    # Combine
    balanced_df = pd.concat([phish_df, legit_df], ignore_index=True)
    print(f"Balanced dataset shape: {balanced_df.shape}")
    print(balanced_df["label"].value_counts())

    # Map labels to 0 and 1
    balanced_df["target"] = balanced_df["label"].apply(lambda x: 1 if str(x).lower().strip() == "phishing" else 0)

    X = balanced_df["url"]
    y = balanced_df["target"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("\nVectorizing URLs using TF-IDF (char n-grams 3-5)...")
    # Character n-grams captures sub-strings, domains, and protocol structures
    vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(3, 5), min_df=2)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

    print("\nTraining Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=150, max_depth=30, random_state=42, n_jobs=-1)
    model.fit(X_train_vec, y_train)

    # Evaluate
    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest Set Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Safe", "Phishing"]))

    # Save vectorizer and model to expected locations
    models_dir = "models"
    data_dir = "data"
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    model_path = os.path.join(models_dir, "phish_model.pkl")
    vectorizer_path = os.path.join(data_dir, "vectorizer.pkl")

    # Also save the balanced training dataset for review
    balanced_df.to_csv(os.path.join(data_dir, "balanced_all_urls.csv"), index=False)

    print(f"\nSaving model to {model_path}...")
    joblib.dump(model, model_path)
    
    print(f"Saving vectorizer to {vectorizer_path}...")
    joblib.dump(vectorizer, vectorizer_path)

    print("\nTraining completed successfully!")

if __name__ == "__main__":
    train_model()
