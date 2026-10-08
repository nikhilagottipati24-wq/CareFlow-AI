import os
import pymupdf

from synthetic_scenarios import SCENARIOS

def generate_sample_pdfs():
    output_dir = os.path.join(os.path.dirname(__file__), "sample_pdfs")
    os.makedirs(output_dir, exist_ok=True)
    
    for scenario_key, scenario in SCENARIOS.items():
        pdf_path = os.path.join(output_dir, f"{scenario_key}.pdf")
        doc = pymupdf.open()
        
        # Split text into pages if needed or add to a clean styled page
        lines = scenario["raw_text"].strip().split("\n")
        
        page = doc.new_page(width=595, height=842) # A4 size
        rect = pymupdf.Rect(50, 50, 545, 792)
        
        # Add Header banner text
        header_text = f"CAREFLOW AI - SYNTHETIC DISCHARGE SUMMARY\n{scenario['title'].upper()}\n" + "="*50 + "\n\n"
        full_content = header_text + scenario["raw_text"]
        
        page.insert_textbox(rect, full_content, fontsize=10, fontname="helv", color=(0.1, 0.15, 0.25))
        
        doc.save(pdf_path)
        doc.close()
        print(f"Generated PDF: {pdf_path}")

if __name__ == "__main__":
    generate_sample_pdfs()
