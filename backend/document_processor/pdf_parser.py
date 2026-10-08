import io
from typing import Dict, List, Any
import pymupdf

class DocumentParser:
    """
    CareFlow AI Document Processing Engine
    Uses PyMuPDF to extract text, pages, and section boundaries from synthetic discharge PDFs and text files.
    """
    
    @staticmethod
    def parse_pdf(file_bytes: bytes, file_name: str = "Discharge_Summary.pdf") -> Dict[str, Any]:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        pages_content = []
        full_text_parts = []
        
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text("text")
            clean_text = text.strip()
            pages_content.append({
                "page_number": page_idx + 1,
                "text": clean_text,
                "char_count": len(clean_text)
            })
            full_text_parts.append(clean_text)
            
        doc.close()
        
        full_text = "\n\n".join(full_text_parts)
        sections = DocumentParser._detect_sections(full_text)
        
        return {
            "file_name": file_name,
            "total_pages": len(pages_content),
            "full_text": full_text,
            "pages": pages_content,
            "detected_sections": sections
        }

    @staticmethod
    def parse_text(raw_text: str, file_name: str = "Discharge_Summary.txt") -> Dict[str, Any]:
        clean_text = raw_text.strip()
        sections = DocumentParser._detect_sections(clean_text)
        
        return {
            "file_name": file_name,
            "total_pages": 1,
            "full_text": clean_text,
            "pages": [{
                "page_number": 1,
                "text": clean_text,
                "char_count": len(clean_text)
            }],
            "detected_sections": sections
        }

    @staticmethod
    def _detect_sections(text: str) -> List[Dict[str, Any]]:
        common_headers = [
            "PRIMARY DIAGNOSIS",
            "DISCHARGE MEDICATIONS",
            "SCHEDULED APPOINTMENTS",
            "REQUIRED MEDICAL TESTS",
            "CARE AND WOUND INSTRUCTIONS",
            "CARE INSTRUCTIONS",
            "WARNING SIGNS",
            "WARNING SIGNS AND EMERGENCY PROTOCOL",
            "PATIENT REPORTED CONCERN",
            "NURSING DISCHARGE NOTE",
            "ATTENDING PHYSICIAN DISCHARGE ORDER"
        ]
        
        found = []
        lines = text.split("\n")
        for i, line in enumerate(lines):
            line_upper = line.strip().upper().replace(":", "")
            for header in common_headers:
                if header in line_upper:
                    found.append({
                        "header": header,
                        "line_index": i,
                        "line_text": line.strip()
                    })
                    break
        return found
