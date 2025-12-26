# ATS-Friendly Font Standards

## Overview

This document outlines the ATS (Applicant Tracking System) friendly font implementation in the CV Builder application. The implementation ensures that generated CVs are optimized for both human readability and ATS parsing.

## Font Families

The application supports three ATS-friendly font options:

### 1. **Serif (Classic)** - Default

- **Primary Font**: Times New Roman
- **Fallback**: Times, serif
- **CSS Variable**: `--font-cv-serif`
- **Best For**: Traditional industries (law, finance, academia)

### 2. **Sans-Serif (Modern)**

- **Primary Font**: Arial
- **Fallback**: Helvetica, sans-serif
- **CSS Variable**: `--font-cv-sans`
- **Best For**: Tech, creative, modern industries

### 3. **Monospace (Tech)**

- **Primary Font**: Courier New
- **Fallback**: Courier, monospace
- **CSS Variable**: `--font-cv-mono`
- **Best For**: Technical roles, programming positions

## Font Size Standards

All font sizes are specified in **points (pt)** to ensure consistent rendering across different devices and when printed/exported to PDF.

### Size Hierarchy

| Element              | Size | Purpose                                    |
| -------------------- | ---- | ------------------------------------------ |
| **Candidate Name**   | 16pt | Primary heading, maximum visibility        |
| **Role/Title**       | 13pt | Secondary heading, professional title      |
| **Section Headings** | 12pt | Major sections (SUMMARY, EXPERIENCE, etc.) |
| **Body Text**        | 11pt | Main content, descriptions, bullet points  |
| **Metadata**         | 10pt | Contact info, dates, secondary information |

### Detailed Breakdown

#### Header Section

- **Name**: `16pt` - Bold, tracking-tight
- **Role**: `13pt` - Semibold
- **Contact Info**: `10pt` - Medium weight
- **Separators**: `10pt` - Gray color

#### Content Sections

- **Section Titles**: `12pt` - Bold, uppercase, with bottom border
- **Job Titles**: `11pt` - Bold
- **Dates/Years**: `10pt` - Medium weight
- **Company/Institution**: `10pt` - Italic, medium weight
- **Descriptions**: `11pt` - Regular weight
- **Bullet Points**: `11pt` - Regular weight

## Implementation Details

### CSS Configuration

Font families are defined in `src/index.css`:

```css
@theme {
  /* ATS-friendly fonts for resume */
  --font-cv-serif: "Times New Roman", Times, serif;
  --font-cv-sans: Arial, Helvetica, sans-serif;
  --font-cv-mono: "Courier New", Courier, monospace;
}
```

### React Component

The `Preview.tsx` component applies fonts using:

1. **Font Family**: Applied via inline style on the root div

   ```tsx
   style={{ fontFamily, fontSize: '11pt' }}
   ```

2. **Font Sizes**: Applied via inline styles on specific elements
   ```tsx
   <h1 style={{ fontSize: '16pt' }}>...</h1>
   <h2 style={{ fontSize: '12pt' }}>...</h2>
   ```

### Why Inline Styles?

We use inline styles for font sizes instead of Tailwind classes because:

1. **Precision**: Point sizes ensure exact rendering for ATS compatibility
2. **Print Consistency**: Inline styles are more reliable when printing to PDF
3. **ATS Parsing**: Many ATS systems parse inline styles more accurately than CSS classes
4. **Export Reliability**: Ensures consistent sizing across different export formats

## ATS Compatibility Guidelines

### ✅ Do's

- Use standard, widely-supported fonts (Times New Roman, Arial, Calibri)
- Maintain consistent font sizes throughout the document
- Use point sizes (10-12pt) for body text
- Keep name prominent (14-16pt)
- Use clear hierarchy with section headings (12-14pt)

### ❌ Don'ts

- Avoid decorative or custom fonts
- Don't use font sizes below 10pt
- Avoid mixing too many font sizes
- Don't use pixel or em units for critical text
- Avoid font effects like shadows or outlines

## Testing Recommendations

When testing ATS compatibility:

1. **Visual Check**: Ensure all text is clearly readable
2. **Print Test**: Print to PDF and verify font rendering
3. **Size Verification**: Use browser dev tools to confirm point sizes
4. **ATS Scanner**: Run through an ATS testing tool
5. **Export Test**: Export to different formats and verify consistency

## Browser Compatibility

The implementation is tested and works across:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Print to PDF (all browsers)

## Future Enhancements

Potential improvements:

- [ ] Add Calibri as an additional sans-serif option
- [ ] Implement font size presets (compact, standard, large)
- [ ] Add accessibility font size controls
- [ ] Support for additional ATS-friendly fonts
- [ ] Font preview in editor

## References

- [ATS Best Practices](../src/services/ats-rule-set.md)
- [Preview Component](../src/components/Preview.tsx)
- [CSS Configuration](../src/index.css)

---

**Last Updated**: December 2025  
**Version**: 1.0.0
