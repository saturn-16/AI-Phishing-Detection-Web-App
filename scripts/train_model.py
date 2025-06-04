import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib  # to save the model
import os

# Define paths
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, '..', 'data')
feature_file = os.path.join(data_dir, 'feature_extracted.csv')

print(f"Loading feature data from: {feature_file}")
df = pd.read_csv(feature_file)
# Features: all columns except 'url' and 'label'
X = df.drop(['url', 'label'], axis=1)

# Labels: convert 'phishing' to 1, 'legitimate' to 0
y = df['label'].apply(lambda x: 1 if x == 'phishing' else 0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
model_path = os.path.join(data_dir, 'phishing_detector_model.pkl')
joblib.dump(clf, model_path)
print(f"Model saved to: {model_path}")
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import joblib

# Replace these sample URLs & labels with your full dataset
urls = [
    "http://google.com",
    "http://phishingsite.com/login",
    "https://safe-site.org",
    # Add more URLs here...
]

labels = [0, 1, 0]  # 0 = legitimate, 1 = phishing

# Create vectorizer and fit on your URLs
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(urls)

# Train the model
model = RandomForestClassifier()
model.fit(X, labels)

# Save both model and vectorizer to the 'data' folder
os.makedirs('data', exist_ok=True)

joblib.dump(model, os.path.join('data', 'phishing_detector_model.pkl'))
joblib.dump(vectorizer, os.path.join('data', 'vectorizer.pkl'))

print("Model and vectorizer saved successfully!")
