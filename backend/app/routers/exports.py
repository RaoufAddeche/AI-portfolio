"""Export PDF (item ou résumé) et export JSON du portfolio."""
import io
from datetime import datetime

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from ..db import get_db

router = APIRouter(tags=["export"])

_TEMPLATES = {
    "professional": {
        "title_color": colors.darkblue,
        "accent_color": colors.blue,
        "title_size": 24,
        "header_bg": colors.lightblue,
    },
    "modern": {
        "title_color": colors.purple,
        "accent_color": colors.purple,
        "title_size": 26,
        "header_bg": colors.lavender,
    },
    "minimalist": {
        "title_color": colors.black,
        "accent_color": colors.gray,
        "title_size": 22,
        "header_bg": colors.lightgrey,
    },
}


def _pdf_response(buffer: io.BytesIO, filename: str) -> Response:
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/api/export/pdf/{item_id}")
async def export_portfolio_pdf(
    item_id: int,
    template: str = Query("professional", description="PDF template style"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Exporter un item portfolio en PDF."""
    row = await conn.fetchrow("SELECT * FROM portfolio_items WHERE id = $1", item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=72, rightMargin=72, topMargin=72, bottomMargin=72
    )
    styles = getSampleStyleSheet()
    story = []
    current_template = _TEMPLATES.get(template, _TEMPLATES["professional"])

    header_data = [
        ["Raouf Addeche", "Développeur Full Stack"],
        ["Portfolio Project", datetime.now().strftime("%B %Y")],
    ]
    header_table = Table(header_data, colWidths=[3 * inch, 3 * inch])
    header_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), current_template["header_bg"]),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ])
    )
    story.append(header_table)
    story.append(Spacer(1, 20))

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=current_template["title_size"],
        spaceAfter=30,
        textColor=current_template["title_color"],
        alignment=1,
    )
    story.append(Paragraph(row["title"], title_style))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=2, color=current_template["accent_color"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Résumé :</b>", styles["Heading2"]))
    story.append(Paragraph(row["short_pitch"], styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Description détaillée :</b>", styles["Heading2"]))
    story.append(Paragraph(row["long_desc"], styles["Normal"]))
    story.append(Spacer(1, 12))

    if row["business_metrics"]:
        story.append(Paragraph("<b>Impact Business :</b>", styles["Heading2"]))
        business_data = [
            [k.replace("_", " ").title(), str(v)]
            for k, v in row["business_metrics"].items()
            if v
        ]
        if business_data:
            business_table = Table(business_data, colWidths=[2.5 * inch, 3.5 * inch])
            business_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (0, -1), colors.blue),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                    ("BACKGROUND", (1, 0), (1, -1), colors.lightblue),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ])
            )
            story.append(business_table)
            story.append(Spacer(1, 12))

    if row["technical_metrics"]:
        story.append(Paragraph("<b>Performance Technique :</b>", styles["Heading2"]))
        tech_metrics_data = [
            [k.replace("_", " ").title(), str(v)]
            for k, v in row["technical_metrics"].items()
            if v
        ]
        if tech_metrics_data:
            tech_metrics_table = Table(tech_metrics_data, colWidths=[2.5 * inch, 3.5 * inch])
            tech_metrics_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (0, -1), colors.green),
                    ("TEXTCOLOR", (0, 0), (0, -1), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                    ("BACKGROUND", (1, 0), (1, -1), colors.lightgreen),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ])
            )
            story.append(tech_metrics_table)
            story.append(Spacer(1, 12))

    if row["achievements"]:
        story.append(Paragraph("<b>Réalisations :</b>", styles["Heading2"]))
        for achievement in row["achievements"]:
            story.append(Paragraph(f"• {achievement}", styles["Normal"]))
        story.append(Spacer(1, 12))

    tech_data = [
        ["GitHub URL", row["github_url"]],
        ["Langage principal", row["github_language"] or "N/A"],
        ["Stars", str(row["github_stars"])],
        ["Forks", str(row["github_forks"])],
        ["Technologies", ", ".join(row["stack"]) if row["stack"] else "N/A"],
        ["Tags", ", ".join(row["tags"]) if row["tags"] else "N/A"],
        ["Complexité", f"{row['complexity_score']}/10" if row["complexity_score"] else "N/A"],
        ["Équipe", f"{row['team_size']} personne(s)" if row["team_size"] else "N/A"],
        ["Durée", f"{row['project_duration_months']} mois" if row["project_duration_months"] else "N/A"],
    ]
    tech_table = Table(tech_data, colWidths=[2 * inch, 4 * inch])
    tech_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("BACKGROUND", (1, 0), (1, -1), colors.beige),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ])
    )
    story.append(Paragraph("<b>Informations techniques :</b>", styles["Heading2"]))
    story.append(tech_table)

    footer_data = [
        ["Généré automatiquement", f"Portfolio Dashboard - {datetime.now().strftime('%d/%m/%Y')}"],
        ["GitHub", row["github_url"]],
    ]
    footer_table = Table(footer_data, colWidths=[2 * inch, 4 * inch])
    footer_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.lightgrey),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ])
    )
    story.append(Spacer(1, 20))
    story.append(footer_table)

    doc.build(story)
    buffer.seek(0)
    filename = f"portfolio_{template}_{row['repo'].replace('/', '_')}.pdf"
    return _pdf_response(buffer, filename)


@router.get("/api/export/portfolio-summary")
async def export_portfolio_summary_pdf(
    template: str = Query("professional", description="PDF template style"),
    conn: asyncpg.Connection = Depends(get_db),
):
    """Exporter un résumé complet du portfolio en PDF."""
    rows = await conn.fetch(
        """
        SELECT * FROM portfolio_items
        WHERE status IN ('approved', 'published')
        ORDER BY ai_confidence_score DESC, github_stars DESC
        LIMIT 5
        """
    )
    if not rows:
        raise HTTPException(status_code=404, detail="No approved projects found")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=72, rightMargin=72, topMargin=72, bottomMargin=72
    )
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(
        "Portfolio Professionnel",
        ParagraphStyle("PortfolioTitle", parent=styles["Heading1"], fontSize=28,
                       textColor=colors.darkblue, alignment=1, spaceAfter=20),
    ))
    story.append(Paragraph(
        "Raouf Addeche - Développeur Full Stack",
        ParagraphStyle("Subtitle", parent=styles["Heading2"], fontSize=16,
                       textColor=colors.blue, alignment=1, spaceAfter=30),
    ))

    story.append(Paragraph("<b>Résumé Exécutif</b>", styles["Heading2"]))
    story.append(Paragraph(
        "Développeur passionné spécialisé en intelligence artificielle, automatisation et "
        "développement full-stack. Expertise en Python, React, et architectures cloud modernes.",
        styles["Normal"],
    ))
    story.append(Spacer(1, 20))

    story.append(Paragraph("<b>Projets Phares</b>", styles["Heading2"]))
    for i, row in enumerate(rows):
        story.append(Paragraph(
            f"{i + 1}. {row['title']}",
            ParagraphStyle(f"ProjectTitle{i}", parent=styles["Heading3"], fontSize=14,
                           textColor=colors.darkblue, spaceAfter=10),
        ))
        story.append(Paragraph(row["short_pitch"], styles["Normal"]))

        if row["business_metrics"]:
            metrics_data = [
                [k.replace("_", " ").title(), str(v)]
                for k, v in row["business_metrics"].items()
                if v
            ]
            if metrics_data:
                metrics_table = Table(metrics_data[:3], colWidths=[2 * inch, 2 * inch])
                metrics_table.setStyle(
                    TableStyle([
                        ("BACKGROUND", (0, 0), (0, -1), colors.lightblue),
                        ("FONTSIZE", (0, 0), (-1, -1), 8),
                        ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                    ])
                )
                story.append(metrics_table)
        story.append(Spacer(1, 15))

    all_techs: set[str] = set()
    for row in rows:
        if row["stack"]:
            all_techs.update(row["stack"])
    story.append(Paragraph("<b>Technologies Maîtrisées</b>", styles["Heading2"]))
    story.append(Paragraph(" • ".join(sorted(all_techs)[:15]), styles["Normal"]))

    doc.build(story)
    buffer.seek(0)
    filename = f"portfolio_summary_{template}_{datetime.now().strftime('%Y%m%d')}.pdf"
    return _pdf_response(buffer, filename)


@router.get("/api/export/json")
async def export_portfolio_json(conn: asyncpg.Connection = Depends(get_db)):
    """Exporter tout le portfolio (approuvé/publié) en JSON."""
    rows = await conn.fetch(
        """
        SELECT repo, title, short_pitch, long_desc, tags, stack, impact,
               github_url, github_stars, github_forks, github_language,
               ai_confidence_score, status, created_at, business_metrics,
               technical_metrics, achievements, complexity_score, team_size,
               project_duration_months, demo_url, live_url
        FROM portfolio_items
        WHERE status IN ('approved', 'published')
        ORDER BY github_stars DESC, created_at DESC
        """
    )

    portfolio = []
    for row in rows:
        item = dict(row)
        item["tags"] = list(item["tags"]) if item["tags"] else []
        item["stack"] = list(item["stack"]) if item["stack"] else []
        item["achievements"] = item["achievements"] if item["achievements"] else []
        item["business_metrics"] = item["business_metrics"] if item["business_metrics"] else {}
        item["technical_metrics"] = item["technical_metrics"] if item["technical_metrics"] else {}
        item["created_at"] = item["created_at"].isoformat()
        portfolio.append(item)

    return {
        "portfolio": portfolio,
        "generated_at": datetime.now().isoformat(),
        "total_projects": len(portfolio),
    }
