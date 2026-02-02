# ===============================================
# Adversarial Threat Detection Module
# ===============================================
# This module uses unsupervised anomaly detection to identify
# URLs with suspicious feature patterns that deviate from both
# phishing and legitimate distributions, indicating potential
# adversarial manipulations or out-of-distribution samples.

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from feature_extractor import extract_url_features

# =====================
# Adversarial Detector Class
# =====================
class AdversarialThreatDetector:
    """
    Detects adversarial threats using Isolation Forest anomaly detection.
    Trained on both legitimate and phishing URLs to identify out-of-distribution
    patterns that might indicate feature-level manipulations.
    """
    
    def __init__(self, model_path="adversarial_detector.pkl", contamination=0.1):
        """
        Initialize the adversarial detector.
        
        Args:
            model_path: Path to saved Isolation Forest model
            contamination: Expected proportion of anomalies (0.1 = 10%)
        """
        self.model_path = model_path
        self.contamination = contamination
        self.detector = None
        self.scaler = None
        self.is_trained = False
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained adversarial detector if available."""
        if os.path.exists(self.model_path):
            try:
                saved_data = joblib.load(self.model_path)
                self.detector = saved_data.get('detector')
                self.scaler = saved_data.get('scaler')
                self.is_trained = saved_data.get('is_trained', False)
                
                if self.detector is not None and self.scaler is not None:
                    print(f"✅ Loaded adversarial detector from {self.model_path}")
                else:
                    print(f"⚠️ Adversarial detector file exists but is invalid. Will train new model.")
                    self.is_trained = False
            except Exception as e:
                print(f"⚠️ Error loading adversarial detector: {e}. Will train new model.")
                self.is_trained = False
        else:
            print(f"ℹ️ No pre-trained adversarial detector found. Will train on first use.")
            self.is_trained = False
    
    def train(self, training_urls, labels=None):
        """
        Train the Isolation Forest on a set of URLs.
        
        Args:
            training_urls: List of URLs (strings) or DataFrame of features
            labels: Optional labels (not used for unsupervised learning, but kept for API consistency)
        
        Returns:
            self (for chaining)
        """
        try:
            # Extract features if URLs are provided as strings
            if isinstance(training_urls, list) and isinstance(training_urls[0], str):
                print("🔍 Extracting features from URLs for adversarial detector training...")
                features_list = []
                for url in training_urls:
                    try:
                        features = extract_url_features(url)
                        features_list.append(list(features.values()))
                    except Exception as e:
                        print(f"⚠️ Error extracting features from URL: {e}")
                        continue
                
                if not features_list:
                    raise ValueError("No valid features extracted from training URLs")
                
                X = pd.DataFrame(features_list)
            elif isinstance(training_urls, pd.DataFrame):
                X = training_urls
            else:
                raise ValueError("training_urls must be a list of URLs or a DataFrame")
            
            # Initialize scaler and detector
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
            
            # Train Isolation Forest
            self.detector = IsolationForest(
                contamination=self.contamination,
                random_state=42,
                n_estimators=100,
                max_samples='auto'
            )
            
            self.detector.fit(X_scaled)
            self.is_trained = True
            
            print(f"✅ Adversarial detector trained on {len(X)} samples")
            
            # Save the trained model
            self.save()
            
            return self
            
        except Exception as e:
            print(f"❌ Error training adversarial detector: {e}")
            raise
    
    def detect(self, url_or_features):
        """
        Detect adversarial threats in a URL or feature vector.
        
        Args:
            url_or_features: URL string or feature dictionary/array
        
        Returns:
            dict with 'is_adversarial', 'anomaly_score', and 'risk_level'
        """
        if not self.is_trained or self.detector is None or self.scaler is None:
            # Return safe default if not trained
            return {
                'is_adversarial': False,
                'anomaly_score': 0.0,
                'risk_level': 'Low',
                'message': 'Adversarial detector not trained'
            }
        
        try:
            # Extract features if URL string is provided
            if isinstance(url_or_features, str):
                features = extract_url_features(url_or_features)
                feature_array = np.array([list(features.values())])
            elif isinstance(url_or_features, dict):
                feature_array = np.array([list(url_or_features.values())])
            elif isinstance(url_or_features, (list, np.ndarray, pd.Series)):
                feature_array = np.array([url_or_features])
            else:
                raise ValueError("Invalid input type for adversarial detection")
            
            # Scale features
            feature_array_scaled = self.scaler.transform(feature_array)
            
            # Predict anomaly (1 = normal, -1 = anomaly)
            prediction = self.detector.predict(feature_array_scaled)[0]
            
            # Get anomaly score (lower = more anomalous)
            anomaly_score = self.detector.score_samples(feature_array_scaled)[0]
            
            # Normalize score to [0, 1] range where 1 = most anomalous
            # Isolation Forest returns negative scores for anomalies
            # We'll normalize to make higher = more suspicious
            normalized_score = 1.0 / (1.0 + np.exp(-anomaly_score))  # Sigmoid normalization
            
            is_adversarial = prediction == -1
            
            # Determine risk level
            if normalized_score > 0.7:
                risk_level = 'High'
            elif normalized_score > 0.4:
                risk_level = 'Medium'
            else:
                risk_level = 'Low'
            
            return {
                'is_adversarial': bool(is_adversarial),
                'anomaly_score': float(normalized_score),
                'risk_level': risk_level,
                'raw_score': float(anomaly_score)
            }
            
        except Exception as e:
            print(f"⚠️ Error in adversarial detection: {e}")
            return {
                'is_adversarial': False,
                'anomaly_score': 0.0,
                'risk_level': 'Low',
                'message': f'Detection error: {str(e)}'
            }
    
    def save(self, path=None):
        """Save the trained detector to disk."""
        if not self.is_trained or self.detector is None:
            print("⚠️ Cannot save: detector not trained")
            return
        
        save_path = path or self.model_path
        try:
            joblib.dump({
                'detector': self.detector,
                'scaler': self.scaler,
                'is_trained': self.is_trained,
                'contamination': self.contamination
            }, save_path)
            print(f"✅ Saved adversarial detector to {save_path}")
        except Exception as e:
            print(f"❌ Error saving adversarial detector: {e}")


# =====================
# Global Detector Instance
# =====================
# Initialize a global detector instance that will be used by the API
_adversarial_detector = None

def get_adversarial_detector():
    """Get or create the global adversarial detector instance."""
    global _adversarial_detector
    if _adversarial_detector is None:
        _adversarial_detector = AdversarialThreatDetector()
    return _adversarial_detector

def initialize_adversarial_detector_with_sample_data():
    """
    Initialize the adversarial detector with sample legitimate and phishing URLs.
    This is a fallback if no pre-trained model exists.
    """
    detector = get_adversarial_detector()
    
    if detector.is_trained:
        return detector
    
    # Sample URLs for training (mix of legitimate and phishing patterns)
    sample_urls = [
        # Legitimate URLs
        "https://www.google.com",
        "https://www.github.com",
        "https://www.stackoverflow.com",
        "https://www.amazon.com",
        "https://www.microsoft.com",
        "https://www.apple.com",
        "https://www.facebook.com",
        "https://www.twitter.com",
        "https://www.linkedin.com",
        "https://www.youtube.com",
        "https://www.netflix.com",
        "https://www.spotify.com",
        "https://www.reddit.com",
        "https://www.wikipedia.org",
        "https://www.medium.com",
        
        # Phishing-like URLs (suspicious patterns)
        "http://goog1e.com",
        "http://amaz0n.com",
        "http://faceb00k.com",
        "http://paypal-security.com",
        "http://microsoft-update.com",
        "http://apple-verify.com",
        "http://bank-verify.com",
        "http://secure-login.com",
        "http://account-update.com",
        "http://suspicious-site.com",
        
        # Adversarial patterns (feature manipulations)
        "http://a" + "a" * 100 + ".com",
        "http://" + "1" * 50 + ".com",
        "http://" + "-" * 30 + ".com",
        "http://test." + "sub." * 20 + "domain.com",
    ]
    
    try:
        print("🔧 Training adversarial detector with sample data...")
        detector.train(sample_urls)
        return detector
    except Exception as e:
        print(f"⚠️ Could not train adversarial detector: {e}")
        return detector

