import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib


def main():
    print("Initializing BuyerProof ML Training Pipeline...")
    
    # 1. Load the Dataset
    dataset_path = "dataset\payment_intent_dataset_1000_60_40.csv"
    
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return
        
    print(f"Loading data from {dataset_path}...")
    df = pd.read_csv(dataset_path)

    # 2. Feature Engineering
    # The absolute price is less predictive than the gap between expected and preferred price
    print("Engineering features...")
    df['price_gap'] = df['expected_price'] - df['preferred_price']

    # Select features (X) and target (y)
    feature_cols = ['interest_level', 'price_gap', 'timeline_days']
    X = df[feature_cols]
    y = df['will_pay']

    # 3. Train/Test Split (80% training, 20% validation)
    print("Splitting dataset into training and testing sets (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Initialize and Train the Model
    # Random Forest is chosen for its robustness against overfitting and non-linear data patterns
    print("Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=100, 
        max_depth=6, 
        random_state=42,
        class_weight='balanced' # Handles the 60/40 split effectively
    )
    rf_model.fit(X_train, y_train)

    # 5. Evaluate the Model
    print("Evaluating model performance...")
    y_pred = rf_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print("\n" + "="*40)
    print(f"MODEL ACCURACY: {accuracy * 100:.2f}%")
    print("="*40)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("="*40)

    # 6. Save the Model
    model_filename = 'intent_model.pkl'
    joblib.dump(rf_model, model_filename)
    print(f"\nTraining complete. Model successfully saved to {model_filename}")
    print("Ready for integration with backend via predict.py.")

if __name__ == "__main__":
    main()