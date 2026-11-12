# Make Healthier’s report workflow genuinely useful

## User experience
- Reposition the home screen around a concrete first task: understand a lab report or prescription, while retaining existing tools.
- Upgrade the report-analysis page for camera capture and image/PDF uploads, clear report-type selection, reviewable results, doctor questions, and PDF export.
- Keep the flow understandable on phones and respect the existing Healthier visual style and language behavior.

## Safety and implementation
- Extend the existing authenticated image-analysis function to accept validated image or PDF inputs and provide distinct, cautious lab-report and prescription explanations.
- Never invent or convert a medicine dose, diagnose, or automatically schedule medicines from an uncertain scan. Clearly flag unreadable details and require checking the original with a clinician or pharmacist.
- Reuse existing report storage, quota handling, camera, and PDF patterns. Validate concrete safety/input limits with focused tests and verify the live upload-to-result flow if an authenticated session is available.
