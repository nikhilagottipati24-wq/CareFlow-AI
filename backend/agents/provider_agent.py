"""
Agent 6 – Provider Finder Agent
Matches post-discharge specialty requirements with synthetic provider directory.
Enforces non-guarantee safety disclaimer and synthetic badges.
"""

from typing import List, Dict, Any, Optional
from backend.models import Provider
from backend.data.synthetic_data import SYNTHETIC_PROVIDERS

class ProviderFinderAgent:
    def __init__(self):
        self.name = "Provider Finder Agent"
        self.disclaimer = (
            "Provider matches are based on synthetic data and do not guarantee "
            "provider availability, network suitability, or clinical appropriateness."
        )

    def find_matches(
        self,
        specialties: List[str],
        preferred_location: Optional[str] = None
    ) -> List[Provider]:
        """
        Finds synthetic providers matching identified care specialties.
        """
        matched_providers: List[Provider] = []
        seen_ids = set()

        # Normalize specialties
        target_specialties = [s.lower().strip() for s in specialties if s]
        if not target_specialties:
            target_specialties = ["cardiology", "primary care", "endocrinology"]

        for prov_dict in SYNTHETIC_PROVIDERS:
            p_spec = prov_dict["specialty"].lower()
            p_loc = prov_dict["location"].lower()

            # Check specialty match
            spec_matched = any(
                target in p_spec or p_spec in target
                for target in target_specialties
            )

            # Check location match if provided
            loc_matched = True
            if preferred_location:
                loc_matched = preferred_location.lower() in p_loc

            if spec_matched and loc_matched and prov_dict["id"] not in seen_ids:
                matched_providers.append(Provider(**prov_dict))
                seen_ids.add(prov_dict["id"])

        # If no strict match, provide top synthetic facilities as fallbacks
        if not matched_providers:
            for prov_dict in SYNTHETIC_PROVIDERS[:3]:
                if prov_dict["id"] not in seen_ids:
                    matched_providers.append(Provider(**prov_dict))
                    seen_ids.add(prov_dict["id"])

        return matched_providers
