# ===============================================
# Feature Extractor — Robust Version (with URL Sanitization)
# ===============================================

import re
import math
import numpy as np
import pandas as pd
from urllib.parse import urlparse, unquote

# =====================
# 🔧 URL Cleaner
# =====================
def clean_url(raw_url):
    """Decode and clean URL before feature extraction."""
    if not raw_url:
        return ""
    
    # Decode percent-encoding
    decoded = unquote(raw_url)
    
    # Remove smart quotes, extra spaces, and invisible unicode chars
    decoded = decoded.strip().replace("“", "").replace("”", "").replace('"', "")
    
    # Replace spaces with %20 or just remove them
    decoded = decoded.replace(" ", "")
    
    # Ensure scheme
    if not re.match(r"^https?://", decoded):
        decoded = "http://" + decoded
    
    return decoded

# =====================
# 🔢 Helper: Entropy
# =====================
def shannon_entropy(s):
    """Compute Shannon entropy of a string."""
    if not s:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(s)]
    return -sum([p * math.log(p, 2) for p in prob])

# =====================
# 🧩 Main Feature Extractor
# =====================
def extract_url_features(url: str):
    """
    Extract features from a single URL — consistent with training version.
    Returns a dictionary (ready for DataFrame construction).
    """
    # ✅ Sanitize URL first
    url = clean_url(url)

    parsed = urlparse(url)
    domain = parsed.netloc or ""
    path = parsed.path or ""
    query = parsed.query or ""
    fragment = parsed.fragment or ""
    subdomains = domain.split('.')[:-2] if len(domain.split('.')) > 2 else []
    sub_str = '.'.join(subdomains)

    features = {
        "url_length": len(url),
        "number_of_dots_in_url": url.count('.'),
        "having_repeated_digits_in_url": int(any(url.count(d) > 1 for d in "0123456789")),
        "number_of_digits_in_url": sum(c.isdigit() for c in url),
        "number_of_special_char_in_url": sum(not c.isalnum() for c in url),
        "number_of_hyphens_in_url": url.count('-'),
        "number_of_underline_in_url": url.count('_'),
        "number_of_slash_in_url": url.count('/'),
        "number_of_questionmark_in_url": url.count('?'),
        "number_of_equal_in_url": url.count('='),
        "number_of_at_in_url": url.count('@'),
        "number_of_dollar_in_url": url.count('$'),
        "number_of_exclamation_in_url": url.count('!'),
        "number_of_hashtag_in_url": url.count('#'),
        "number_of_percent_in_url": url.count('%'),
        "domain_length": len(domain),
        "number_of_dots_in_domain": domain.count('.'),
        "number_of_hyphens_in_domain": domain.count('-'),
        "having_special_characters_in_domain": int(any(not c.isalnum() and c not in ".-" for c in domain)),
        "number_of_special_characters_in_domain": sum(not c.isalnum() and c not in ".-" for c in domain),
        "having_digits_in_domain": int(any(c.isdigit() for c in domain)),
        "number_of_digits_in_domain": sum(c.isdigit() for c in domain),
        "having_repeated_digits_in_domain": int(any(domain.count(d) > 1 for d in "0123456789")),
        "number_of_subdomains": len(subdomains),
        "having_dot_in_subdomain": int('.' in sub_str),
        "having_hyphen_in_subdomain": int('-' in sub_str),
        "average_subdomain_length": np.mean([len(s) for s in subdomains]) if subdomains else 0.0,
        "average_number_of_dots_in_subdomain": np.mean([s.count('.') for s in subdomains]) if subdomains else 0,
        "average_number_of_hyphens_in_subdomain": np.mean([s.count('-') for s in subdomains]) if subdomains else 0,
        "having_special_characters_in_subdomain": int(any(not c.isalnum() for c in sub_str)) if sub_str else 0,
        "number_of_special_characters_in_subdomain": sum(not c.isalnum() for c in sub_str),
        "having_digits_in_subdomain": int(any(c.isdigit() for c in sub_str)) if sub_str else 0,
        "number_of_digits_in_subdomain": sum(c.isdigit() for c in sub_str),
        "having_repeated_digits_in_subdomain": int(any(sub_str.count(d) > 1 for d in "0123456789")) if sub_str else 0,
        "having_path": int(bool(path)),
        "path_length": len(path),
        "having_query": int(bool(query)),
        "having_fragment": int(bool(fragment)),
        "having_anchor": int('#' in url),
        "entropy_of_url": shannon_entropy(url),
        "entropy_of_domain": shannon_entropy(domain)
    }

    feature_order = [
        "url_length","number_of_dots_in_url","having_repeated_digits_in_url",
        "number_of_digits_in_url","number_of_special_char_in_url","number_of_hyphens_in_url",
        "number_of_underline_in_url","number_of_slash_in_url","number_of_questionmark_in_url",
        "number_of_equal_in_url","number_of_at_in_url","number_of_dollar_in_url",
        "number_of_exclamation_in_url","number_of_hashtag_in_url","number_of_percent_in_url",
        "domain_length","number_of_dots_in_domain","number_of_hyphens_in_domain",
        "having_special_characters_in_domain","number_of_special_characters_in_domain",
        "having_digits_in_domain","number_of_digits_in_domain","having_repeated_digits_in_domain",
        "number_of_subdomains","having_dot_in_subdomain","having_hyphen_in_subdomain",
        "average_subdomain_length","average_number_of_dots_in_subdomain",
        "average_number_of_hyphens_in_subdomain","having_special_characters_in_subdomain",
        "number_of_special_characters_in_subdomain","having_digits_in_subdomain",
        "number_of_digits_in_subdomain","having_repeated_digits_in_subdomain",
        "having_path","path_length","having_query","having_fragment",
        "having_anchor","entropy_of_url","entropy_of_domain"
    ]

    return {key: features[key] for key in feature_order}
