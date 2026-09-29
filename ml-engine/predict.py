import sys
import json
import joblib
import pandas as pd
import warnings

# Suppress sklearn warnings about feature names lacking during prediction to keep stdout clean for Node.js
warnings.filterwarnings("ignore", category=UserWarning)

def main():
    try:
        # 1. Parse Input Arguments passed from Node.js child_process
        if len(sys.argv) != 5:
            raise ValueError("Expected 4 arguments: expected_price, preferred_price, interest_level, timeline_days")
            
        expected_price = float(sys.argv[1])
        preferred_price = float(sys.argv[2])
        interest_level = int(sys.argv[3])
        timeline_days = int(sys.argv[4])
        
        # 2. Feature Engineering (Must match training logic exactly)
        price_gap = expected_price - preferred_price
        
        # 3. Load the Pre-trained Model
        model_path = 'intent_model.pkl'
        try:
            model = joblib.load(model_path)
        except FileNotFoundError:
            raise FileNotFoundError(f"Model file '{model_path}' not found. Run train.py first.")
        
        # 4. Predict Purchase Intent Score
        # Create DataFrame to maintain feature names expected by the model
        features = pd.DataFrame(
            [[interest_level, price_gap, timeline_days]], 
            columns=['interest_level', 'price_gap', 'timeline_days']
        )
        
        # predict_proba returns [[prob_class_0, prob_class_1]]
        intent_prob = model.predict_proba(features)[0][1]
        intent_score = int(intent_prob * 100)
        
        # 5. Calculate Willingness to Pay (WTP) & Segment
        # Ratio of the gap to the expected price
        price_sensitivity = price_gap / expected_price if expected_price > 0 else 0
        
        # WTP Score Logic: Caps at 100, drops proportionally as preferred price drops
        wtp_score = max(0, min(100, int(100 - (price_sensitivity * 100))))
        
        # Segmentation Logic
        if price_sensitivity <= 0:
            segment = "Premium / Low Friction"
        elif price_sensitivity < 0.15:
            segment = "Value-Driven Buyers"
        else:
            segment = "Highly Price Sensitive"
            
        # Business Recommendation Logic
        if intent_score >= 70:
            recommendation = "PROCEED"
        elif intent_score >= 40:
            recommendation = "VALIDATE FURTHER"
        else:
            recommendation = "RECONSIDER PRODUCT/PRICE"

        # 6. Format Output for Node.js
        result = {
            "purchase_intent_score": intent_score,
            "willingness_to_pay_score": wtp_score,
            "buyer_segment": segment,
            "business_recommendation": recommendation
        }
        
        # Print JSON so Node.js child_process.stdout can capture it
        print(json.dumps(result))
        
    except Exception as e:
        # Print error as JSON so backend handles it gracefully instead of crashing
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()