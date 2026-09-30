# Genera el CV de Mario Huarte Nolasco en .docx con python-docx.
# Contenido: datos confirmados por Mario (sept 2026). Una columna, Letter, márgenes 0.6".
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BLUE=RGBColor(0x1F,0x5F,0xA8); GRAY=RGBColor(0x55,0x55,0x55); DARK=RGBColor(0x22,0x22,0x22)
doc=Document()
sec=doc.sections[0]; sec.page_width=Inches(8.5); sec.page_height=Inches(11)
for side in ('left_margin','right_margin'): setattr(sec,side,Inches(0.6))
sec.top_margin=Inches(0.5); sec.bottom_margin=Inches(0.5)
st=doc.styles['Normal']; st.font.name='Calibri'; st.font.size=Pt(10); st.element.rPr.rFonts.set(qn('w:eastAsia'),'Calibri')
st.paragraph_format.space_after=Pt(0); st.paragraph_format.space_before=Pt(0)

def para(text='',size=10,bold=False,color=DARK,align=None,after=0,before=0,italic=False):
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(after); p.paragraph_format.space_before=Pt(before)
    if align: p.alignment=align
    if text:
        r=p.add_run(text); r.font.size=Pt(size); r.bold=bold; r.italic=italic; r.font.color.rgb=color
    return p
def runs(p,parts):
    """parts: lista de (texto, bold)"""
    for t,b in parts:
        r=p.add_run(t); r.bold=b; r.font.size=Pt(10); r.font.color.rgb=DARK
def bottom_border(p,color='1F5FA8',sz='8'):
    pPr=p._p.get_or_add_pPr(); pbdr=OxmlElement('w:pBdr'); b=OxmlElement('w:bottom')
    b.set(qn('w:val'),'single'); b.set(qn('w:sz'),sz); b.set(qn('w:space'),'1'); b.set(qn('w:color'),color); pbdr.append(b); pPr.append(pbdr)
def heading(text):
    p=para(text.upper(),size=10.5,bold=True,color=BLUE,before=9,after=3); bottom_border(p); return p
def bullet(parts):
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(1.5); p.paragraph_format.left_indent=Inches(0.22)
    runs(p,parts if isinstance(parts,list) else [(parts,False)]); return p
def role(title,org,dates,duration):
    t=doc.add_table(rows=2,cols=2); t.alignment=WD_TABLE_ALIGNMENT.LEFT; t.autofit=False
    for row,w in zip(t.rows,[(Inches(5.6),Inches(1.7))]*2):
        row.cells[0].width=w[0]; row.cells[1].width=w[1]
    c=t.cell(0,0).paragraphs[0]; r=c.add_run(title); r.bold=True; r.font.size=Pt(11); r.font.color.rgb=DARK
    c=t.cell(1,0).paragraphs[0]; r=c.add_run(org); r.bold=True; r.font.size=Pt(10); r.font.color.rgb=BLUE
    c=t.cell(0,1).paragraphs[0]; c.alignment=WD_ALIGN_PARAGRAPH.RIGHT; r=c.add_run(dates); r.font.size=Pt(9.5); r.font.color.rgb=GRAY
    c=t.cell(1,1).paragraphs[0]; c.alignment=WD_ALIGN_PARAGRAPH.RIGHT; r=c.add_run(duration); r.font.size=Pt(9.5); r.bold=True; r.font.color.rgb=BLUE
    doc.add_paragraph().paragraph_format.space_after=Pt(1)

# ── Encabezado ──
para('MARIO HUARTE NOLASCO',size=20,bold=True,align=WD_ALIGN_PARAGRAPH.CENTER,after=2)
para('MDM Specialist | TIBCO EBX Developer | Java | Data Governance',size=12,bold=True,color=BLUE,align=WD_ALIGN_PARAGRAPH.CENTER,after=3)
para('Tel: 55 6229 3691     Email: mario_huarte@outlook.com     LinkedIn: linkedin.com/in/mario-huarte-nolasco-874436202',size=9,color=GRAY,align=WD_ALIGN_PARAGRAPH.CENTER,after=1)
para('Mexico City, Mexico     Portfolio: mariounam.github.io     Cédula Profesional: 14265872',size=9,color=GRAY,align=WD_ALIGN_PARAGRAPH.CENTER,after=6)

# ── Resumen ──
p=para(before=2,after=2)
runs(p,[('Computer Engineer (UNAM) with ',False),('5 years of experience',True),(' in Master Data Management (MDM) and ',False),('TIBCO EBX',True),
 (' implementation, since December 2021. Five MDM implementations for clients in retail, manufacturing, financial services, pharma and telecom, modeling customer, employee and location domains on datasets of up to ',False),('200M records',True),
 ('. Specialized in master data modeling, ',False),('Java',True),(' extensions on EBX, Data Governance workflows, Data Quality and Match & Merge rules. Daily use of ',False),('SQL',True),
 ('; integration through ',False),('SnapLogic iPaaS',True),(', Oracle, PostgreSQL, SQL Server and AWS. Occasional use of ',False),('Python',True),(' for process automation. English B2 — technical proficiency.',False)])

# ── Competencias ──
heading('Key Competencies')
para('Master Data Management (MDM)  |  TIBCO EBX 5.x–6.x  |  EBX Add-ons & Custom Modules  |  Java  |  Data Governance  |  Data Quality  |  Data Cleansing  |  Match & Merge  |  Data Stewardship  |  Reference Data Management  |  Data Modeling  |  EBX Workflows  |  EBX Data Spaces & Datasets  |  SnapLogic iPaaS  |  REST Services  |  SQL  |  Oracle  |  PostgreSQL  |  SQL Server  |  AWS  |  Azure (AZ-900)  |  Python  |  Power BI  |  Enterprise Data Management',size=9.5,after=2)

# ── Experiencia ──
heading('Professional Experience')
role('MDM Consultant | TIBCO EBX Developer','Alldatum Business  ·  Mexico City, Mexico','Aug 2023 – Present','3 years 2 months')
bullet([('Implementation and configuration of MDM solutions on ',False),('TIBCO EBX',True),(': data model design, Data Spaces and Datasets for customer, employee and location domains, on datasets of up to 200M records.',False)])
bullet([('Data cleansing and quality rules in ',False),('TIBCO EBX',True),(': validations, constraints and corrections on master data records within the platform.',False)])
bullet([('Java extensions on EBX: triggers, constraints, custom validations, REST services, workflow scripts and importers — created from scratch or evolved from existing modules.',False)])
bullet([('EBX integration with external systems through ',False),('SnapLogic iPaaS',True),(' and native EBX REST services: Oracle, PostgreSQL, SQL Server and AWS.',False)])
bullet([('Telecom: designed cleansing and ',False),('Match & Merge',True),(' rules for customer data from two Central American countries, after researching each country\'s phone numbering plans and address standards; delivered clean, deduplicated data back to the operator.',False)])
bullet([('Data quality monitoring and reporting with ',False),('Power BI',True),(' and ',False),('SQL',True),(' to track governance KPIs for client projects.',False)])
bullet([('Five MDM implementations across ',False),('retail, manufacturing, financial services, pharma and telecom',True),(', working with business and IT teams to translate requirements into EBX technical configurations.',False)])

role('Intern – Data and MDM Consultant','Alldatum Business  ·  Mexico City, Mexico','Dec 2021 – Aug 2023','1 year 9 months')
bullet('Initial learning and configuration of the TIBCO EBX platform under senior consultant supervision.')
bullet('Support in identifying data sources and mapping them to MDM models during implementation projects.')

role('Programming Instructor','PROTECO  ·  School of Engineering, UNAM','Feb 2021 – Feb 2022','1 year 1 month')
bullet('Taught 10+ online courses and workshops (OOP, web development, Python, Linux) to groups of 20–30 Computer Engineering students, including onboarding of new program members.')
bullet('Created learning materials and one-on-one tutoring focused on technical problem-solving, plus practical workshops such as building a professional CV.')

# ── Educación ──
heading('Education')
role('Bachelor of Engineering in Computer Science (Ingeniero en Computación)','Facultad de Ingeniería · Universidad Nacional Autónoma de México (UNAM)','2017 – 2024','Degree & license 2024')
role('Software Development Technician (Técnico en Desarrollo de Software)','Colegio de Ciencias y Humanidades, Azcapotzalco · UNAM','Aug 2014 – Mar 2017','Graduated')

# ── Certificaciones ──
heading('Certifications')
bullet([('Google AI',True),(' — Google · Aug 2026 · Credential ID LY3LGZVG593W',False)])
bullet([('Diploma: Desarrollo de Habilidades Directivas (240 h)',True),(' — Facultad de Ingeniería, UNAM · Mar 2024 · Folio 4283',False)])
bullet([('SnapLogic Integrator Certification',True),(' — SnapLogic · Aug 2023 · verify.skilljar.com/c/ewn4n2hoqxh5',False)])
bullet([('Google Data Analytics Professional Certificate',True),(' — Google / Coursera · Mar 2023 · coursera.org/share/ef3d02dd5eafc5509d940ecdb1be61b2',False)])
bullet([('Microsoft Certified: Azure Fundamentals (AZ-900)',True),(' — Microsoft via Certiport · Jun 2020',False)])
p=para(before=3,after=1); runs(p,[('Continuous training (Udemy, 2025): ',True),('Curso Práctico SQL Server: De Principiante a Experto · SQL Consultas en SQL Server · Administrador Linux – Curso completo desde cero (LPIC-1) · Ciberseguridad – CompTIA Security+ Módulo 1 · Ciberseguridad: Protege tu información de cibercriminales. ',False),('Official TIBCO EBX platform training.',False)])

# ── Idiomas ──
heading('Languages')
para('Spanish — Native     |     English — B2 (technical proficiency)',after=0)

doc.save('Mario_Huarte_CV.docx'); print('docx ok')
