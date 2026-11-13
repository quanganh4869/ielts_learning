"""Script to generate realistic IELTS sample files across formats (TXT, MD, DOCX, XLSX, JSONL)."""

import os
import json
import docx
from openpyxl import Workbook

def generate_samples(base_dir="."):
    sample_dir = os.path.join(base_dir, "data", "sample")
    raw_dir = os.path.join(base_dir, "data", "raw")
    os.makedirs(sample_dir, exist_ok=True)
    os.makedirs(raw_dir, exist_ok=True)

    # 1. Reading Passage (TXT & MD)
    reading_content = """# IELTS Reading Academic Practice Test: The Future of Renewable Energy

## Passage 1: The Transition to Geothermal and Offshore Wind

The 21st century has witnessed an unprecedented acceleration in the global shift towards renewable energy sources. While solar photovoltaic arrays and onshore wind turbines have historically dominated public discourse, recent engineering advancements have shifted attention toward deep geothermal systems and floating offshore wind installations.

Deep geothermal energy harnesses heat residing kilometres beneath the Earth's crust. Unlike intermittent renewable sources such as wind and solar, geothermal stations provide continuous baseload power, operating with capacity factors exceeding 90 percent. Enhanced Geothermal Systems (EGS) inject pressurized fluid into deep crystalline rock formations to re-open microscopic fractures, enabling fluid circulation and thermal extraction in regions devoid of natural hydrothermal reservoirs.

However, offshore floating wind turbines face contrasting hurdles. Installed in waters deeper than 60 meters where seabed-fixed foundations are economically unfeasible, these immense structures must endure oceanic swells, salt spray corrosion, and cyclical wave-induced mechanical fatigue. Nevertheless, open-sea wind regimes are noticeably stronger and more consistent than terrestrial winds, yielding capacity factors upward of 55 percent.

## Questions 1-5: True / False / Not Given
Do the following statements agree with the information given in the reading passage?
Write:
TRUE if the statement agrees with the information
FALSE if the statement contradicts the information
NOT GIVEN if there is no information on this

Question 1: Geothermal power plants produce electricity continuously regardless of weather conditions.
Answer: TRUE
Explanation: The passage states that "geothermal stations provide continuous baseload power, operating with capacity factors exceeding 90 percent" unlike intermittent renewable sources.

Question 2: Enhanced Geothermal Systems can only be constructed in regions with existing natural thermal springs.
Answer: FALSE
Explanation: The passage mentions that EGS enables thermal extraction "in regions devoid of natural hydrothermal reservoirs" by injecting pressurized fluid into crystalline rock.

Question 3: Floating offshore wind farms are cheaper to construct than onshore wind farms.
Answer: NOT GIVEN
Explanation: The passage notes that seabed-fixed foundations become economically unfeasible in deep water, but does not compare total construction costs between floating offshore wind farms and onshore wind farms.

Question 4: Oceanic winds tend to be less volatile and more powerful than onshore wind patterns.
Answer: TRUE
Explanation: The passage explicitly states that "open-sea wind regimes are noticeably stronger and more consistent than terrestrial winds".

Question 5: Salt corrosion has caused major structural collapses in North Sea floating platforms.
Answer: NOT GIVEN
Explanation: While salt spray corrosion is cited as a challenge, no specific structural collapse in the North Sea is mentioned.
"""

    for target_dir in [sample_dir, raw_dir]:
        with open(os.path.join(target_dir, "reading_renewable_energy.md"), "w", encoding="utf-8") as f:
            f.write(reading_content)
        with open(os.path.join(target_dir, "reading_renewable_energy.txt"), "w", encoding="utf-8") as f:
            f.write(reading_content)

    # 2. Listening Transcript (TXT)
    listening_content = """# IELTS Listening Section 1: University Accommodation Registration

## Audio Script Transcript

Officer: Good morning, Student Accommodation Services. How may I help you today?
Student: Hello, my name is Alex Chen. I'm an incoming postgraduate student for the Autumn semester, and I'd like to apply for on-campus accommodation.
Officer: Certainly, Alex. Let me take down your details. Can you spell your surname for me?
Student: Yes, it's C-H-E-N. My student identification number is ST-84920.
Officer: Thank you. And which campus will your primary faculty be located on?
Student: Originally I thought I would be at the North campus, but my program in Advanced Materials Engineering was moved to the Riverside campus.
Officer: Right, Riverside campus. We have three main residence halls there: Parkview, Brookside, and Highfield Manor. Do you have a preference?
Student: I prefer a studio flat with a private en-suite bathroom. Shared kitchens are fine, but a private bathroom is essential.
Officer: In that case, Parkview Hall has studio units available from September 15th at £185 per week, including utilities and high-speed internet. Brookside has rooms from £145, but bathrooms are communal.
Student: £185 at Parkview fits my budget perfectly. Please register me for that.
Officer: Excellent. The deposit is £250, payable within 14 days of room allocation.

## Questions 1-4: Form Completion
1. Student ID: ST-84920
Explanation: Alex clarifies his ID clearly as ST-84920.
2. Campus Location: Riverside
Explanation: The student mentions North campus first as a distractor ("Originally I thought..."), but corrects that the faculty was moved to Riverside campus.
3. Residence Hall Chosen: Parkview
Explanation: Chosen because it includes an en-suite private bathroom within the student's budget.
4. Weekly Rent: £185
Explanation: £145 was mentioned for Brookside (distractor), but Parkview is £185 per week.
"""

    for target_dir in [sample_dir, raw_dir]:
        with open(os.path.join(target_dir, "listening_section1_accommodation.txt"), "w", encoding="utf-8") as f:
            f.write(listening_content)

    # 3. Writing Task 2 Essay with 4-Criteria Rubric (DOCX)
    for target_dir in [sample_dir, raw_dir]:
        doc = docx.Document()
        doc.add_heading("IELTS Writing Task 2: Model Essay and 4-Criteria Evaluation", level=1)
        
        doc.add_heading("Prompt", level=2)
        doc.add_paragraph(
            "Some people believe that university education should focus on providing knowledge and skills related to students' future careers, while others think that the true role of university is to provide a broad general education. Discuss both views and give your own opinion."
        )

        doc.add_heading("Candidate Response (Band 7.5 Sample)", level=2)
        p1 = (
            "The debate concerning the primary objective of tertiary education remains contentious. "
            "While one school of thought contends that universities must strictly equip undergraduates with vocational skills "
            "directly aligned with labor market demands, others advocate for a more holistic academic syllabus. "
            "This essay examines both perspectives before arguing that while career-readiness is undeniably vital, "
            "cultivating critical inquiry and cross-disciplinary understanding constitutes the true essence of higher education."
        )
        doc.add_paragraph(p1)

        p2 = (
            "Proponents of career-oriented curricula highlight economic pragmatism. In an increasingly competitive global economy, "
            "graduates often face substantial student debt and rigorous hiring standards. Institutions emphasizing practical proficiencies—such as "
            "software development, clinical competencies, or financial modelling—enable their alumni to secure immediate employment. "
            "Consequently, aligning tertiary coursework with market needs minimizes youth underemployment."
        )
        doc.add_paragraph(p2)

        p3 = (
            "Conversely, advocates of liberal education argue that vocational skills rapidly become obsolete due to automation. "
            "By contrast, a comprehensive curriculum fostering critical thinking, philosophical reasoning, and academic versatility prepares "
            "students to adapt flexibly across diverse professional landscapes. Historically, landmark scientific breakthroughs "
            "frequently emerged from multidisciplinary syntheses rather than narrow technical training."
        )
        doc.add_paragraph(p3)

        doc.add_heading("Examiner Rubric Assessment (4 Criteria Breakdown)", level=2)
        table = doc.add_table(rows=1, cols=3)
        hdr_cells = table.rows[0].cells
        hdr_cells[0].text = "Criteria"
        hdr_cells[1].text = "Band Score"
        hdr_cells[2].text = "Examiner Feedback"

        criteria_data = [
            ("Task Response (TR)", "7.5", "Addresses all parts of the task. Presents a clear, well-developed position throughout with convincing supporting ideas."),
            ("Coherence and Cohesion (CC)", "8.0", "Logically organized progression with clear paragraphing and varied discourse markers ('Conversely', 'Proponents of', 'Consequently')."),
            ("Lexical Resource (LR)", "7.5", "Sophisticated academic vocabulary used naturally ('tertiary education', 'economic pragmatism', 'multidisciplinary syntheses')."),
            ("Grammatical Range and Accuracy (GRA)", "7.5", "Wide range of complex structures with high degree of accuracy and rare minor slips.")
        ]

        for crit, band, fb in criteria_data:
            row_cells = table.add_row().cells
            row_cells[0].text = crit
            row_cells[1].text = band
            row_cells[2].text = fb

        doc_path = os.path.join(target_dir, "writing_task2_tertiary_education.docx")
        doc.save(doc_path)

    # 4. Academic Vocabulary Worksheet (XLSX)
    for target_dir in [sample_dir, raw_dir]:
        wb = Workbook()
        ws = wb.active
        ws.title = "Academic Vocabulary"

        headers = ["Word / Phrase", "Part of Speech", "Band Level", "Definition", "Collocations", "Example Sentence"]
        ws.append(headers)

        vocab_data = [
            ["ubiquitous", "Adjective", "8.0", "Present, appearing, or found everywhere", "ubiquitous presence, become ubiquitous", "Smartphones have become ubiquitous across modern urban society."],
            ["exacerbate", "Verb", "7.5", "Make a problem, bad situation, or negative feeling worse", "exacerbate tensions, exacerbate environmental degradation", "Rapid urbanisation without adequate infrastructure will inevitably exacerbate traffic congestion."],
            ["proponent", "Noun", "7.0", "A person who advocates a theory, proposal, or course of action", "leading proponent, strong proponent of", "Proponents of renewable energy cite substantial long-term economic savings."],
            ["pragmatic", "Adjective", "7.5", "Dealing with things sensibly and realistically in a practical way", "pragmatic approach, pragmatic solution", "Governments must adopt a pragmatic policy toward public healthcare spending."],
            ["mitigate", "Verb", "7.5", "Make something bad less severe, serious, or painful", "mitigate risks, mitigate climate change effects", "Reforestation initiatives help mitigate the detrimental effects of global warming."],
            ["indispensable", "Adjective", "8.0", "Absolutely necessary or essential", "indispensable tool, indispensable role", "Technological literacy has become indispensable in the 21st-century workplace."]
        ]

        for row in vocab_data:
            ws.append(row)

        wb.save(os.path.join(target_dir, "ielts_academic_vocab_band7plus.xlsx"))

    # 5. Speaking Candidates & Responses (JSONL)
    speaking_records = [
        {
            "id": "speaking-part2-001",
            "skill": "Speaking",
            "topic": "Describe a historical building you have visited",
            "candidate_speech": "I would like to talk about the Temple of Literature in Hanoi, which I visited last autumn. It was established in the 11th century and functioned as Vietnam's premier national academy. What struck me most was the well-preserved traditional architecture, featuring aged wooden pavilions, courtyard gardens, and stone stelae commemorating ancient scholars.",
            "band_score": 7.5,
            "fluency_and_coherence": "Maintained continuous flow with minimal hesitation. Good chronological narrative structure.",
            "lexical_resource": "Rich vocabulary: 'premier national academy', 'well-preserved', 'stone stelae commemorating'.",
            "grammatical_range": "Effective use of relative clauses ('which I visited', 'commemorating ancient scholars').",
            "pronunciation": "Clear articulation, natural word stress and intonation."
        },
        {
            "id": "speaking-part3-001",
            "skill": "Speaking",
            "topic": "Why is it important to protect historical buildings?",
            "candidate_speech": "Preserving historic architecture is crucial because these landmarks serve as tangible links to a nation's cultural heritage. Unlike modern steel-and-glass skyscrapers, historic edifices reflect the indigenous craftsmanship and sociopolitical context of their respective eras, fostering civic identity and national pride.",
            "band_score": 8.0,
            "fluency_and_coherence": "Fluent and well-structured response with coherent conceptual progression.",
            "lexical_resource": "High-level collocations: 'tangible links', 'cultural heritage', 'indigenous craftsmanship', 'fostering civic identity'.",
            "grammatical_range": "Complex sentences with participial phrases and contrasted clauses.",
            "pronunciation": "Expressive intonation and accurate syllable stress."
        }
    ]

    for target_dir in [sample_dir, raw_dir]:
        with open(os.path.join(target_dir, "speaking_part2_and_3_responses.jsonl"), "w", encoding="utf-8") as f:
            for rec in speaking_records:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"Sample data generated in {sample_dir} and {raw_dir}")

if __name__ == "__main__":
    generate_samples(".")
