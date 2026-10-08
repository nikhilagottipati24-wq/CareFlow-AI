from typing import List, Dict, Any, Optional
from models.schemas import Provider
from data.synthetic_scenarios import SYNTHETIC_PROVIDERS

class ProviderFinderAgent:
    """
    Agent 6 – Provider Finder Agent
    Matches follow-up clinical needs with synthetic provider/facility fixtures.
    SAFETY BOUNDARY:
    - Never declares 'This is the correct doctor.'
    - Labels matches: 'Potential provider matches based on specialty and available synthetic data.'
    - Displays synthetic provider badge and mandatory non-guarantee disclaimer.
    """
    
    DISCLAIMER_TEXT = "Provider matches are based on synthetic data and do not guarantee availability, suitability, or clinical appropriateness."

    def __init__(self):
        self.name = "Provider Finder Agent"
        self.providers_db = [Provider(**p) for p in SYNTHETIC_PROVIDERS]

    def find_matches(self, specialty: Optional[str] = None, location: Optional[str] = None, facility: Optional[str] = None) -> Dict[str, Any]:
        results: List[Provider] = self.providers_db
        
        if specialty and specialty.strip() and specialty.lower() != "all":
            spec_q = specialty.lower().strip()
            results = [
                p for p in results
                if spec_q in p.specialty.lower() or (spec_q == "cardiology" and "cardio" in p.specialty.lower())
            ]
            
        if location and location.strip() and location.lower() != "all":
            loc_q = location.lower().strip()
            results = [p for p in results if loc_q in p.location.lower()]
            
        if facility and facility.strip() and facility.lower() != "all":
            fac_q = facility.lower().strip()
            results = [p for p in results if fac_q in p.facility.lower()]
            
        return {
            "disclaimer": self.DISCLAIMER_TEXT,
            "banner_text": "Potential provider matches based on specialty and available synthetic data.",
            "total_matches": len(results),
            "providers": results
        }
