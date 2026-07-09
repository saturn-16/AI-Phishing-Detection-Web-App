import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

def train_kaggle_model():
    data_path = os.path.join("data", "phishing_site_urls.csv")
    if not os.path.exists(data_path):
        # Fallback if renamed
        data_path = os.path.join("data", "all_urls.csv")
        if not os.path.exists(data_path):
            print("Error: Kaggle CSV file 'phishing_site_urls.csv' not found in backend/data/.")
            print("Please place the extracted CSV in backend/data/ and rename it to 'phishing_site_urls.csv'.")
            return

    print(f"Loading Kaggle Phishing Dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")
    
    # Rename columns to standard lowercase if needed
    df.columns = [col.lower().strip() for col in df.columns]
    
    if 'url' not in df.columns or 'label' not in df.columns:
        print("Error: CSV must contain 'url' and 'label' columns.")
        print(f"Found columns: {list(df.columns)}")
        return

    print("Unique labels in Kaggle dataset:")
    print(df["label"].value_counts())

    # Map labels: 'bad' -> 1 (phishing), others (good) -> 0
    df["target"] = df["label"].apply(lambda x: 1 if str(x).lower().strip() == "bad" else 0)

    # To keep training fast and prevent memory issues while ensuring high accuracy,
    # we take a balanced sample of 25,000 'good' and 25,000 'bad' URLs (50k total)
    print("\nExtracting balanced sample of 50,000 URLs for training...")
    bad_df = df[df["target"] == 1]
    good_df = df[df["target"] == 0]

    sample_size = min(25000, len(bad_df), len(good_df))
    
    bad_sample = bad_df.sample(n=sample_size, random_state=42)
    good_sample = good_df.sample(n=sample_size, random_state=42)
    
    balanced_df = pd.concat([bad_sample, good_sample], ignore_index=True)
    print(f"Balanced training subset size: {len(balanced_df)} URLs.")

    X = balanced_df["url"]
    y = balanced_df["target"]

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("\nVectorizing URLs using TF-IDF (char n-grams 3-5)...")
    vectorizer = TfidfVectorizer(analyzer="char", ngram_range=(3, 5), min_df=3)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

    print("\nTraining Random Forest Classifier on Kaggle data...")
    # Restrict max_depth slightly to keep pkl file size optimized for web deployment
    model = RandomForestClassifier(n_estimators=100, max_depth=35, random_state=42, n_jobs=-1)
    model.fit(X_train_vec, y_train)

    # Evaluate
    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest Set Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["Good", "Bad"]))

    # Save
    models_dir = "models"
    data_dir = "data"
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "phish_model.pkl")
    vectorizer_path = os.path.join(data_dir, "vectorizer.pkl")

    print(f"\nSaving model to {model_path}...")
    joblib.dump(model, model_path)
    
    print(f"Saving vectorizer to {vectorizer_path}...")
    joblib.dump(vectorizer, vectorizer_path)

    print("\nKaggle model training completed successfully!")

if __name__ == "__main__":
    train_kaggle_model()
